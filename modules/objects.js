//-------------
// Objects & UI
//-------------
// the chosen bean. (alan becker reference??)
let pHp = 30;
let difficulty = 1;
let gears = 0;

const player = add([
  "player",
  sprite("player08"),
  pos(vec2(mapPixelWidth / 2, mapPixelHeight / 2)),
  color(),
  rotate(0),
  area({
    shape: new Rect(vec2(0), 20, 20),
    collisionIgnore: [],
  }),
  body(),
  anchor("botright"),
  health(pHp, pHp),
  dash(true, 1200, 0, 1, 0.2, ["mapCol", "enemy", "player"]),
  lifespan(-1, true),
  scale(1),
]);
 
setCamPos(player.pos);

// those one guys (thatoneguy AND battle cats reference??)

summon(() => e.virat(), player.pos, 1);

summon(() => e.virabird(), player.pos, 0);

/*for (let i = 0; i < 2; i++) {
  add([
    ...e.gigagantrum(),
    {
      add() {
        this.move(vec2((Math.random() * 1000), (Math.random() * 1000)))
      },
    },
  ]);
}*/

// the chosen bean's blade. (alan becker reference??)
const heldItem = add([
  sprite("sok"),
  pos(player.pos.add(vec2(50 - (player.width / 2),player.height / -2))),
  color(),
  rotate(0),
  area(),
  anchor("center"),
  item(0.2, 0.2),
])

// the mouse himself (alan becker reference??)
const cursor = add([
  sprite("cursor"),
  pos(mousePos()),
  layer("cur"),
  scale(1),
]);

cursor.hidden = true;

// hotbar from terraria (terraria reference??)
loadSprite("hotbar-slot", "./assets/ui/hotbar-slot.png");
const hotbarItems = Array.from({ length: 5 }, (_, i) => add([
  sprite("hotbar-slot"),
  pos(50, 50),
  layer("ui"),
  scale(3.33),
  area(),
  anchor("center"),
  opacity(0.7),
]));

// player health from terraria (terraria reference??)
const playerHealth = add([
  pos(0,0),
  sprite("bean"),
  opacity(0),
  layer("ui"),
])

// the inventory!!!
class Inventory {
    constructor() {
        this.items = [];
    }

    addItem(item, amount = 1) {
        if (item.stackable) {
            const existing = this.items.find(i => i.id === item.id);
            if (existing) {
                existing.add(amount);
            } else {
                this.items.push(new Item({ ...item, quantity: amount }));
            }
        } else {
            for (let i = 0; i < amount; i++) {
                this.items.push(new Item({ ...item }));
            }
        }
    }

    removeItem(itemId, amount = 1) {
        const index = this.items.findIndex(i => i.id === itemId);
        if (index === -1) return false;

        const item = this.items[index];
        const shouldDelete = item.remove(amount);
        if (shouldDelete) this.items.splice(index, 1);
        return true;
    }

    getItemsByType(type) {
        return this.items.filter(i => i.type === type);
    }
}

class Item {
    constructor({ id, name, type, icon, stackable = false, quantity = 1, stats = {}, description = "" }) {
        this.id = id;
        this.name = name;
        this.type = type;           // "weapon", "material", "misc"
        this.icon = icon;           // KAPLAY CREW icon path
        this.stackable = stackable;
        this.quantity = quantity;
        this.stats = stats;
        this.description = description;
    }

    // add quantity (for stackable items)
    add(amount = 1) {
        if (this.stackable) this.quantity += amount;
    }

    // remove quantity, return true if item should be deleted
    remove(amount = 1) {
        if (this.stackable) {
            this.quantity -= amount;
            return this.quantity <= 0;
        } else {
            return true; // non-stackable should be deleted when removed
        }
    }
}

let inventory = new Inventory();



// toolbox icon
const toolbox = add([
  sprite("toolbox-o"),
  pos(getCamPos().sub(center()).add(vec2(50, 45))),
  layer("ui"),
  scale(1),
  area(),
  anchor("center")
]);

// menu icon
const menu = add([
  sprite("menu-o"),
  pos(getCamPos().add(center()).sub(vec2(50, 45))),
  layer("ui"),
  scale(1),
  area(),
  anchor("center")
]);

// movement
const player_speed = 100;
const friction = 0.7;
let xVel = 0;
let yVel = 0;

// inventory
let hotbar = new Array(5).fill(0);
let inventoryToggle = false;
let toolboxScale = false;

// menu
let menuToggle = false;
let menuScale = false;

// other stuff
const bars = add([
  sprite("bean"),
  opacity(0),
  layer("cur"),
  color(YELLOW),
  scale(1),
  pos(getCamPos().sub(center())),
])

// currency icon (gear)
const cur = add([
  sprite("gear-o"),
  pos(getCamPos().sub(center()).add(vec2(50, toolbox.height + 100))),
  layer("ui"),
  scale(0.7),
  area(),
  anchor("center"),
])

const curText = add([
  pos(cur.pos.add(vec2(5, 5))),
  text("0", { 
    size: 30,
    width: 500,
    font: "happy-o",
  }),
  color(),
  layer("ui"),
  scale(1),
])

// gear effect
const gearEffect = [];

// expedition time
const expedition = add([
  pos(width() / 2, 24),
  text("10:00", {
    size: 24,
    width: 120,
    font: "happy-o",
  }),
  color(),
  layer("ui"),
  scale(1),
  {
    expTime: 600,
  }
]);

// don't ask
const sixSeven = add([
  {
    six: false,
    seven: false,
  }
]);
