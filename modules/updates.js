//-------------
// Input & updates
//-------------
let camMove = vec2(0, 0);

let mouseDown = false;
onMousePress(() => {
  mouseDown = true;
})

onMouseRelease(() => {
  mouseDown = false;
})

player.onUpdate(() => {
    const xKeyInputs = 
        ((isKeyDown("d") || isKeyDown("right")) ? 1 : 0) - 
        ((isKeyDown("a") || isKeyDown("left")) ? 1 : 0);
    
    const yKeyInputs =
        ((isKeyDown("s") || isKeyDown("down")) ? 1 : 0) -
        ((isKeyDown("w") || isKeyDown("up")) ? 1 : 0);
      
    const inputDir = vec2(
        xKeyInputs,
        yKeyInputs,
    );
    
    if ((xKeyInputs || yKeyInputs) && frameCounter % 10 == 0) play("grass", { volume: 0.4 });

    // dash
    if (isKeyDown("space")) {
        player.dash(inputDir.x, inputDir.y);
    }

    // force player back into bounds
    if (player.pos.x < 0) player.pos.x = 0;
    if (player.pos.y < 0) player.pos.y = 0;
    if (player.pos.x > mapPixelWidth) player.pos.x = mapPixelWidth;
    if (player.pos.y > mapPixelHeight) player.pos.y = mapPixelHeight;

    // only apply normal input velocity if NOT dashing
    if (!player.isDashing) {
        xVel += inputDir.x * player_speed;
        yVel += inputDir.y * player_speed;

        const targetVel = vec2(xVel, yVel);
        xVel *= friction;
        yVel *= friction;
        player.vel = targetVel;
    } else {
        // zero out normal vel to avoid conflict
        player.vel = vec2(0,0);
    }
    // camera movement amount
    camMove = getCamPos().lerp(player.pos.sub(player.width / 2, player.height / 2), 0.12).sub(getCamPos());

    setCamPos(getCamPos().lerp(player.pos.sub(player.width / 2, player.height / 2), 0.12));

    const cam = getCamPos();
    setCamPos(vec2(
        Math.floor(cam.x),
        Math.floor(cam.y)
    ));
});

player.onCollide("enemyBullet", () => {
  if (!player.isDashing) player.hurt(1); 
})

player.on("hurt", (num) => {
  if (settings.gameShake) shake(3);
  player.setHP(player.hp() + num * (1 - difficulty));
  play("hurt", { volume: 1.5 });
})

player.on("death", () => {
  player.lifespan = 0.1;
  destroy(heldItem);
})

// sword updates (coolness)
heldItem.onUpdate(() => {
  heldItem.pos = player.pos.add(vec2(50 - (player.width * 2.5), player.height / -2)).add(radBtwn(player.pos, cursor.pos).scale(40));
  heldItem.angle = angleBtwn(player.pos, cursor.pos);

  if (mouseDown && heldItem.cd <= 0) {
    heldItem.cd = 0.2;
    add([
      pos(player.pos),
      ...p.sokBullet(angleBtwn(player.pos, cursor.pos)),
    ])
  }
})

cursor.onUpdate(() => {
  cursor.pos = getCamPos().sub(center()).add(mousePos());
});

toolbox.onHover(() => { toolboxScale = true; });
toolbox.onHoverEnd(() => { toolboxScale = false; });
toolbox.onMouseDown(() => { inventoryToggle = !inventoryToggle; });
toolbox.onUpdate(() => {
  toolbox.pos = getCamPos().sub(center()).add(vec2(50, 45));
  toolbox.scale = toolboxScale ? vec2(1.1, 1.1) : vec2(1, 1);
});

hotbarItems.forEach((item, i) => {
  item.onHover(() => { item.scale = vec2(3.5, 3.5); });
  item.onHoverEnd(() => { item.scale = vec2(3.33, 3.33); });
  item.onUpdate(() => {
    item.pos = getCamPos().sub(center()).add(vec2(125 + (i * 75), 50));
  });
});

playerHealth.onUpdate(() => {
  playerHealth.pos = getCamPos().sub(center());
})

menu.onHover(() => { menuScale = true; });
menu.onHoverEnd(() => { menuScale = false; });
menu.onMouseDown(() => { menuToggle = !menuToggle; });
menu.onUpdate(() => {
  menu.pos = getCamPos().add(center()).sub(vec2(50, 45));
  menu.scale = menuScale ? vec2(1.1, 1.1) : vec2(1, 1);
})

// Currency updates
cur.onUpdate(() => { 
  cur.pos = toolbox.pos.add(vec2(2.5, toolbox.height + 20));
});

curText.onUpdate(() => {
  curText.pos = cur.pos.add(vec2(35, cur.width / -6));
  // set the text to the current currency amount
  curText.text = gears;
});

// Bars (item cooldown, dash, etc.)
bars.onUpdate(() => { bars.pos = getCamPos().sub(center()); });

// Global updates
onUpdate(() => { 
  frameCounter++ 

  // gear effect update
  gearEffect.forEach((eff, i) => {
    eff[0] = eff[0].add(camMove.scale(1));
    eff[0] = eff[0].lerp(cur.pos, 0.3);
    if (eff[0].dist(cur.pos.x, cur.pos.y) < 10) {
      gears += eff[1];
      gearEffect.splice(i, 1);
    }
  });
})

// expedition time
expedition.onUpdate(() => {
  expedition.pos = getCamPos().sub(center()).add(vec2((width() / 2) - expedition.width / 2, 25));
  expedition.expTime -= dt();

  const minutes = Math.floor(expedition.expTime / 60);
  const seconds = Math.floor(expedition.expTime % 60);

  expedition.text = 
    (minutes < 10 ? "0" + minutes : minutes) + ":" + 
    (seconds < 10 ? "0" + seconds : seconds);

  if (expedition.expTime <= 0) {
    // end expedition
    expedition.expTime = 0;
    // todo: expedition end logic
  }
});

// don't ask
sixSeven.onUpdate(() => {
  if (isKeyDown("6")) sixSeven.six = true;
  if (isKeyDown("7")) sixSeven.seven = true;

  if (sixSeven.six && sixSeven.seven) {
    player.pos = vec2(150, 150);
    summon(() => e.gigagantrum(), vec2(0, 1000));
    summon(() => e.gigagantrum(), vec2(1000, 0));
    destroy(sixSeven);
  }
})