// main.js
// Main javascript workflow for Cropbots
//-------------
// Imports
//-------------
import { kaplay } from "./modules/imports/kaplay.js";
import { crew } from "./modules/imports/crew.js";
import { createClient } from "./modules/imports/supabase.js";

// script loader
function loadScripts(scripts, callback, vars = {}) {
    // attach vars to window
    for (let k in vars) window[k] = vars[k];

    let i = 0;
    function next() {
        if (i >= scripts.length) return callback && callback();
        const s = document.createElement("script");
        s.src = scripts[i] + '?v=' + Date.now();
        s.onload = () => { console.log("Loaded:", scripts[i]); i++; next(); };
        s.onerror = e => console.error("Failed:", scripts[i], e);
        document.head.appendChild(s);
    }
    next();
}

//-------------
// Constants
//-------------
// supabase
const supabase = createClient(
    "https://gofwuyczxgsuflflpjry.supabase.co/", 
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdvZnd1eWN6eGdzdWZsZmxwanJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4NzAwNjcsImV4cCI6MjA3ODQ0NjA2N30.Fzl9CG9X1spWNLeoLM3BAJNK23g71d93b-TjfT2-kr4", 
{
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
});

// cropbot version
const VERSION = "nightly20251113";
console.log("Cropbots version:", VERSION);

async function loadjs() {
//-------------
// Loading & Saving (supabase & local storage)
//-------------

// local storage key
const LS_KEY = "cropbots_user_data";

// get current user
async function getCurrentUser() {
    const { data } = await supabase.auth.getSession();
    return data?.session?.user ?? null;
}

// load user data
async function loadUserData() {
    const user = await getCurrentUser();
    if (!user) return null;

    try {
        const { data, error } = await supabase
            .from("users")
            .select("settings, game_data")
            .eq("id", user.id)
            .single();

        if (error) throw error;

        // save backup to localStorage
        localStorage.setItem(LS_KEY, JSON.stringify(data));

        return data;
    } catch (err) {
        console.warn("Supabase fetch failed, falling back to localStorage:", err);
        // fallback to localStorage
        const backup = localStorage.getItem(LS_KEY);
        if (backup) return JSON.parse(backup);
        return null;
    }
}

// save user data
async function saveUserData(settings, game_data) {
    const user = await getCurrentUser();
    if (!user) return null;

    // always save to localStorage
    const payload = { settings, game_data };
    localStorage.setItem(LS_KEY, JSON.stringify(payload));

    // try saving online
    try {
        const { data, error } = await supabase
            .from("users")
            .update({ settings, game_data })
            .eq("id", user.id)
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (err) {
        console.warn("Supabase save failed, localStorage updated:", err);
        return payload; // still return the local backup
    }
}

//-------------
// Settings
//-------------
const userData = await loadUserData();   

const { settings, game_data } = userData;
console.log("loaded user data:", game_data, settings);

//-------------
// Kaplay init
//-------------
// get current URL
const urlParams = new URLSearchParams(window.location.search);

// get the scale
const s = (urlParams.get("scale")) ? urlParams.get("scale") : 1;
console.log("game scale: " + s);

kaplay({
  loadingScreen: false,
  plugins: [crew],
  font: "happy-o",
  debugKey: "r",
  scale: s,
});

setLayers(["bg","obj","fg","ui","load","cur"], "obj");
//setCursor("none");
setBackground("1a1a1a");

//-------------
// Sprites & tiles
//-------------
loadBean();
loadCrew("font","happy-o");
loadCrew("sprite", "cursor");
loadCrew("sprite", "knock");
loadCrew("sprite", "glady");
loadCrew("sprite", "toolbox-o");
loadCrew("sprite", "menu-o");
loadCrew("sprite", "sword");
loadCrew("sprite", "sok");
loadCrew("sprite", "beenking");
loadCrew("sprite", "marks_legend");
loadCrew("sprite", "skuller");
loadCrew("sprite", "gigagantrum");
loadCrew("sprite", "jam");
loadCrew("sprite", "config");
loadCrew("sprite", "lightning");
loadCrew("sprite", "fire");

loadSprite("heart-o", "assets/ui/heart.png");
loadSprite("heart-empty-o", "assets/ui/heart-empty.png");

loadSprite("player01", "assets/objects/player01.png");
loadSprite("player02", "assets/objects/player02.png");
loadSprite("player03", "assets/objects/player03.png");
loadSprite("player04", "assets/objects/player04.png");
loadSprite("player08", "assets/objects/player08.png");

loadSprite("virat", "assets/objects/virat.png");
loadSprite("virabird", "assets/objects/virabird.png");

loadSprite("virabirdBullet", "assets/projectiles/virabirdBullet.png");

loadSprite("gear", "assets/items/gear.png")
loadSprite("gear-o", "assets/items/gear-o.png")

loadSpriteAtlas("assets/tileset.png", "assets/tileset.json");
loadSprite("chunk-24", "assets/chunk-24.png");
loadSprite("loading", "assets/loading.png")

//-------------
// Sounds
//-------------
loadSound("grass", "assets/sounds/grass.wav");
loadSound("hurt", "assets/sounds/hurt.wav");
loadSound("hurt2", "assets/sounds/hurt2.wav");
loadSound("pickup", "assets/sounds/coinpickup.wav");
loadSound("select", "assets/sounds/select.wav");

//-------------
// Loading Screen
//-------------
var loadingRect = add([
    pos(0,0),
    rect(width() * 3, height() * 3),
    color("#161616"),
    layer("load"),
])

var loadingBean = add([
    pos(center()),
    anchor("center"),
    sprite("loading"),
    color(),
    rotate(),
    layer("load"),
    scale(.125),
])

var loadingText = add([
    pos(center().add(vec2(0, 200))),
    text("loading...", {
        size: 30,
        width: 500,
        font: "happy-o",
    }),
    color(),
    layer("load"),
    scale(),
])

loadingBean.onUpdate(() => {
    loadingBean.rotateBy(45 * dt());
    loadingBean.pos = getCamPos();
})

loadingRect.onUpdate(() => {
    loadingRect.pos = getCamPos().sub(center());
})

loadingText.onUpdate(() => {
    loadingText.pos = getCamPos().add(vec2(-3.75*30, 50));
})

onLoading((pct) => {
    loadingBean.rotateBy(45 * dt());
    loadingBean.pos = getCamPos();

    loadingRect.pos = getCamPos().sub(center());

    loadingText.pos = getCamPos().add(vec2(-3.75*30, 50));
})

console.log("loading..")

loadScripts([
    // Custom Components & Plugins
    "modules/custom.js",
    // AI + Pathfinding (tile-based)
    "modules/ai.js",
    // Map (optimized, chunked)
    "modules/map.js",
    // Objects & UI
    "modules/objects.js",
    // Inputs & updates
    "modules/updates.js",
    // Draw loop (chunk-aware, only draw visible chunks)
    "modules/draw.js",
], 

() => {
    console.log("scripts loaded!");
    setTimeout(() => {
        destroy(loadingBean);
        destroy(loadingText);
        destroy(loadingRect);
        console.log("i cast fireball! extremely effective. loading screen destroyed")
    }, 100)
}, { settings, game_data });
}

// -------------
// OTP Login
// -------------
const modal = document.querySelector("#otp-modal");
const emailInput = document.querySelector("#otp-email");
const sendBtn = document.querySelector("#otp-send");
const codeBox = document.querySelector("#otp-code-box");
const codeInput = document.querySelector("#otp-code");
const verifyBtn = document.querySelector("#otp-verify");
const statusLine = document.querySelector("#otp-status");
const emailBox = document.querySelector("#otp-email-box");

// try to auto-login
supabase.auth.getSession().then(({ data }) => {
    if (data.session) loadjs();
    else modal.style.display = "flex";
});

// send otp
sendBtn.onclick = async () => {
    const email = emailInput.value.trim();
    if (!email) return;

    statusLine.textContent = "Sending...";
    const { data, error } = await supabase.auth.signInWithOtp({
        email,
        options: {
            emailRedirectTo: null,       // disables magic link
            shouldCreateUser: true,
            channel: "email",            // IMPORTANT
        }
    });

    if (error) {
        statusLine.textContent = error.message;
    } else {
        statusLine.textContent = "Code sent!";
        emailBox.style.display = "none";
        codeBox.style.display = "flex";
        codeInput.focus();
    }
};

// verify otp
verifyBtn.onclick = async () => {
    const email = emailInput.value.trim();
    const code = codeInput.value.trim();

    statusLine.textContent = "Verifying...";

    const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: code,
        type: "email",
    });

    if (error) {
        statusLine.textContent = error.message;
    } else {
        statusLine.textContent = "Logged in!";
        modal.style.display = "none";

        // optional — load user row (your table)
        const { data: profile } = await supabase
            .from("users")
            .select("*")
            .eq("id", data.user.id)
            .single();

        console.log("profile:", profile);

        loadjs();
    }
};

//-------------
// VM Worker
//-------------
const worker = new Worker("workers/vm-worker.js");

worker.onmessage = (e) => {
  const { type, data } = e.data;
  if (type === "log") console.log("Worker log:", ...data);
  else if (type === "result") console.log("Worker result:", data);
  else if (type === "error") console.error("Worker error:", data);
};

function vm_run(code) {
  worker.postMessage({ code });
}

// save data before unload!
window.onbeforeunload = function(){
   saveUserData(window.settings, window.game_data);
}