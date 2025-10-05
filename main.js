const TILE_SIZE = 32;
const COLS = 15;
const ROWS = 20;
const GAME_WIDTH = TILE_SIZE * COLS;
const GAME_HEIGHT = TILE_SIZE * ROWS;

window.addEventListener('load', () => {
    const canvas = document.getElementById('canvas1')
    const ctx = canvas.getContext('2d');

    canvas.width = GAME_WIDTH;
    canvas.height = GAME_HEIGHT;

    class Game {
        constructor(){
            this.world = new World();
            this.hero = new Hero({game:this,position:{x:1 * TILE_SIZE,y:2 * TILE_SIZE}});
            this.input = new Input();
        }
        render(ctx){
            this.hero.update()
            this.world.drawBackground(ctx);
            this.world.drawGrid(ctx);
            this.hero.draw(ctx);
            this.world.drawForeground(ctx);
        }
    }

    const game = new Game();

    function animate() {
        requestAnimationFrame(animate);
        // ctx.clearReact()
        game.render(ctx);
    }
    requestAnimationFrame(animate)
})

class World {
    constructor() {
        this.level1 = {
            waterLayer: [],
            groundLayer: [],
            backgroundLayer: document.getElementById('backgroundLevel1'),
            foregroundLayer: document.getElementById('foregroundLevel1'),
        }
    }
    
    drawBackground(ctx){
        ctx.drawImage(this.level1.backgroundLayer, 0, 0)
    }

    drawForeground(ctx){
        ctx.drawImage(this.level1.foregroundLayer, 0, 0)
    }

    drawGrid(ctx){
        for (let row = 0; row < ROWS; row++) {
            for (let col = 0; col < COLS; col++) {
                ctx.strokeRect(
                    col * TILE_SIZE,
                    row * TILE_SIZE,
                    TILE_SIZE,
                    TILE_SIZE,
                )
            }
        }
    }
}


class GameObject {
    constructor({game, sprite,position,scale}) {
        this.game = game;
        this.sprite = sprite ?? {x:0,y:0,width:TILE_SIZE,height:TILE_SIZE,image:''};
        this.position = position ?? {x:0,y:0};
        this.scale = scale ?? 1;

        this.destinationPosition = {x: this.position.x, y: this.position.y};
        this.distanceToTravel = {x:0,y:0}
    }

    moveTowards(destinationPosition,speed){
        this.distanceToTravel.x = destinationPosition.x - this.position.x;
        this.distanceToTravel.y = destinationPosition.y - this.position.y;

        //let distance = Math.sqrt(this.distanceToTravel.x**2 + this.distanceToTravel.y**2);
        let distance = Math.hypot(this.distanceToTravel.x + this.distanceToTravel.y);

        if(distance <= speed) {
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
    
    draw(ctx){
        ctx.fillRect(
            this.position.x,
            this.position.y,
            TILE_SIZE,
            TILE_SIZE,
        )
    }
}

class Hero extends GameObject {
    constructor({game, sprite,position,scale}) {
        super({game, sprite,position,scale})
        this.speed = 2;
    }

    update(){
        let nextX = this.destinationPosition.x;
        let nextY = this.destinationPosition.y;

        const distance = this.moveTowards(this.destinationPosition,this.speed);

        const arrived = distance <= this.speed;

        if(arrived){
            if (this.game.input.lastKey === UP){
                nextY -= TILE_SIZE;
            }else if (this.game.input.lastKey === DOWN){
                nextY += TILE_SIZE;
            }else if (this.game.input.lastKey === LEFT){
                nextX -= TILE_SIZE;
            }else if (this.game.input.lastKey === RIGHT){
                nextX += TILE_SIZE;
            }
            this.destinationPosition.x = nextX;
            this.destinationPosition.y = nextY;
        }


    }
}

const LEFT = 'LEFT';
const RIGHT = 'RIGHT';
const UP = 'UP';
const DOWN = 'DOWN';

class Input {
    constructor() {
        this.keys = [];

        window.addEventListener('keydown', e => {
            if ( e.key === 'ArrowUp' || e.key.toLowerCase() === 'w'){
                this.keyPressed(UP);
            }else if ( e.key === 'ArrowDown' || e.key.toLowerCase() === 's'){
                this.keyPressed(DOWN);
            }else if ( e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a'){
                this.keyPressed(LEFT);
            }else if ( e.key === 'ArrowRight' || e.key.toLowerCase() === 'd'){
                this.keyPressed(RIGHT);
            }
        })
        window.addEventListener('keyup', e => {
            if ( e.key === 'ArrowUp' || e.key.toLowerCase() === 'w'){
                this.keyReleased(UP);
            }else if ( e.key === 'ArrowDown' || e.key.toLowerCase() === 's'){
                this.keyReleased(DOWN);
            }else if ( e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a'){
                this.keyReleased(LEFT);
            }else if ( e.key === 'ArrowRight' || e.key.toLowerCase() === 'd'){
                this.keyReleased(RIGHT);
            }
        })
    }

    keyPressed(key){
        if (this.keys.indexOf(key) === -1){
            this.keys.unshift(key);
            console.log(key, this.keys)
        }
    }
    keyReleased(key){
        const index = this.keys.indexOf(key);
        this.keys.splice(index, 1);
    }
    get lastKey(){
        return this.keys[0];
    }
}

