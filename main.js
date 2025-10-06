const TILE_SIZE = 32;
const COLS = 15;
const ROWS = 20;
const GAME_WIDTH = TILE_SIZE * COLS;
const GAME_HEIGHT = TILE_SIZE * ROWS;
const HALF_TILE = TILE_SIZE / 2;
const LEFT = "LEFT";
const RIGHT = "RIGHT";
const UP = "UP";
const DOWN = "DOWN";

window.addEventListener("load", () => {
  const canvas = document.getElementById("canvas1");
  const ctx = canvas.getContext("2d");

  canvas.width = GAME_WIDTH;
  canvas.height = GAME_HEIGHT;

  class Game {
    constructor() {
      this.world = new World();
      this.hero = new Hero({
        game: this,
        sprite: {
          x: 0,
          y: 11,
          width: 64,
          height: 64,
          image: document.getElementById("hero1"),
        },
        position: { x: 1 * TILE_SIZE, y: 2 * TILE_SIZE },
        scale: 1,
      });
      this.input = new Input();

      this.eventUpdate = false;
      this.eventTimer = 0;
      this.eventInterval = 120;
    }
    render(ctx, deltaTime) {
      this.hero.update(deltaTime);
      this.world.drawBackground(ctx);
      this.world.drawGrid(ctx);
      this.hero.draw(ctx);
      this.world.drawForeground(ctx);

      if (this.eventTimer < this.eventInterval) {
        this.eventTimer += deltaTime;
        this.eventUpdate = false;
      } else {
        this.eventTimer = 0;
        this.eventUpdate = true;
      }
    }
  }

  const game = new Game();

  let lastTime = 0;
  function animate(timeStamp) {
    requestAnimationFrame(animate);

    const deltaTime = timeStamp - lastTime;
    lastTime = timeStamp;

    game.render(ctx, deltaTime);
  }
  requestAnimationFrame(animate);
});

class World {
  constructor() {
    this.level1 = {
      waterLayer: [],
      groundLayer: [],
      backgroundLayer: document.getElementById("backgroundLevel1"),
      foregroundLayer: document.getElementById("foregroundLevel1"),
    };
  }

  drawBackground(ctx) {
    ctx.drawImage(this.level1.backgroundLayer, 0, 0);
  }

  drawForeground(ctx) {
    ctx.drawImage(this.level1.foregroundLayer, 0, 0);
  }

  drawGrid(ctx) {
    ctx.strokeStyle = "black";
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        ctx.strokeRect(col * TILE_SIZE, row * TILE_SIZE, TILE_SIZE, TILE_SIZE);
      }
    }
  }
}

class GameObject {
  constructor({ game, sprite, position, scale }) {
    this.game = game;
    this.sprite = sprite ?? {
      x: 0,
      y: 0,
      width: TILE_SIZE,
      height: TILE_SIZE,
      image: "",
    };
    this.position = position ?? { x: 0, y: 0 };
    this.scale = scale ?? 1;

    this.destinationPosition = { x: this.position.x, y: this.position.y };
    this.distanceToTravel = { x: 0, y: 0 };

    this.width = this.sprite.width * this.scale;
    this.halfWidth = this.width / 2;
    this.height = this.sprite.height * this.scale;
  }

  moveTowards(destinationPosition, speed) {
    this.distanceToTravel.x = destinationPosition.x - this.position.x;
    this.distanceToTravel.y = destinationPosition.y - this.position.y;

    //let distance = Math.sqrt(this.distanceToTravel.x**2 + this.distanceToTravel.y**2);
    let distance = Math.hypot(
      this.distanceToTravel.x + this.distanceToTravel.y,
    );

    if (distance <= speed) {
      this.position.x = destinationPosition.x;
      this.position.y = destinationPosition.y;
    } else {
      // learn vector properly
      const stepX = this.distanceToTravel.x / distance;
      const stepY = this.distanceToTravel.y / distance;
      this.position.x += stepX * speed;
      this.position.y += stepY * speed;

      this.distanceToTravel.x = destinationPosition.x - this.position.x;
      this.distanceToTravel.y = destinationPosition.y - this.position.y;

      distance = Math.hypot(this.distanceToTravel.x + this.distanceToTravel.y);
    }

    return distance;
  }

  draw(ctx) {
    ctx.fillStyle = "blue";
    ctx.fillRect(this.position.x, this.position.y, TILE_SIZE, TILE_SIZE);
    ctx.strokeStyle = "yellow";
    ctx.strokeRect(
      this.destinationPosition.x,
      this.destinationPosition.y,
      TILE_SIZE,
      TILE_SIZE,
    );
    ctx.drawImage(
      this.sprite.image,
      this.sprite.x * this.sprite.width,
      this.sprite.y * this.sprite.height,
      this.sprite.width,
      this.sprite.height,
      this.position.x + HALF_TILE - this.halfWidth,
      this.position.y + TILE_SIZE - this.height,
      this.width,
      this.height,
    );
  }
}

class Hero extends GameObject {
  constructor({ game, sprite, position, scale }) {
    super({ game, sprite, position, scale });
    this.speed = 100;
    this.maxFrame = 2;
  }

  update(deltaTime) {
    let nextX = this.destinationPosition.x;
    let nextY = this.destinationPosition.y;

    const scaledSpeed = this.speed * (deltaTime / 1000);

    const distance = this.moveTowards(this.destinationPosition, scaledSpeed);

    const arrived = distance <= scaledSpeed;

    if (arrived) {
      if (this.game.input.lastKey === UP) {
        nextY -= TILE_SIZE;
        this.sprite.y = 8;
      } else if (this.game.input.lastKey === DOWN) {
        nextY += TILE_SIZE;
        this.sprite.y = 10;
      } else if (this.game.input.lastKey === LEFT) {
        nextX -= TILE_SIZE;
        this.sprite.y = 9;
      } else if (this.game.input.lastKey === RIGHT) {
        nextX += TILE_SIZE;
        this.sprite.y = 11;
      }
      this.destinationPosition.x = nextX;
      this.destinationPosition.y = nextY;
    }

    if (this.game.input.keys.length > 0 || !arrived) {
      this.moving = true;
    } else {
      this.moving = false;
    }

    if (this.game.eventUpdate && this.moving) {
      this.sprite.x < this.maxFrame ? this.sprite.x++ : (this.sprite.x = 0);
    } else if (!this.moving) {
      this.sprite.x = 0;
    }
  }
}


class Input {
  constructor() {
    this.keys = [];

    window.addEventListener("keydown", (e) => {
      if (e.key === "ArrowUp" || e.key.toLowerCase() === "w") {
        this.keyPressed(UP);
      } else if (e.key === "ArrowDown" || e.key.toLowerCase() === "s") {
        this.keyPressed(DOWN);
      } else if (e.key === "ArrowLeft" || e.key.toLowerCase() === "a") {
        this.keyPressed(LEFT);
      } else if (e.key === "ArrowRight" || e.key.toLowerCase() === "d") {
        this.keyPressed(RIGHT);
      }
    });
    window.addEventListener("keyup", (e) => {
      if (e.key === "ArrowUp" || e.key.toLowerCase() === "w") {
        this.keyReleased(UP);
      } else if (e.key === "ArrowDown" || e.key.toLowerCase() === "s") {
        this.keyReleased(DOWN);
      } else if (e.key === "ArrowLeft" || e.key.toLowerCase() === "a") {
        this.keyReleased(LEFT);
      } else if (e.key === "ArrowRight" || e.key.toLowerCase() === "d") {
        this.keyReleased(RIGHT);
      }
    });
  }

  keyPressed(key) {
    if (this.keys.indexOf(key) === -1) {
      this.keys.unshift(key);
      console.log(key, this.keys);
    }
  }
  keyReleased(key) {
    const index = this.keys.indexOf(key);
    this.keys.splice(index, 1);
  }
  get lastKey() {
    return this.keys[0];
  }
}
