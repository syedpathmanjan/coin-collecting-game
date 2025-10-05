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
            this.hero = new Hero({game:this,position:{x:2,y:2}});
            this.input = new Input();
        }
        render(ctx){
            this.world.drawGrid(ctx);
            this.hero.draw(ctx);
            this.hero.update()
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
        this.level1 = {}
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
    }
    
    draw(ctx){
        ctx.fillRect(
            this.position.x * TILE_SIZE,
            this.position.y * TILE_SIZE,
            TILE_SIZE,
            TILE_SIZE,
        )
    }
}

class Hero extends GameObject {
    constructor({game, sprite,position,scale}) {
        super({game, sprite,position,scale})
    }

    update(){
        if (this.game.input.lastKey === UP){
            this.position.y--;
        }else if (this.game.input.lastKey === DOWN){
            this.position.y++;
        }else if (this.game.input.lastKey === LEFT){
            this.position.x--;
        }else if (this.game.input.lastKey === RIGHT){
            this.position.x++;
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
            console.log(e);
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
            console.log(e);
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