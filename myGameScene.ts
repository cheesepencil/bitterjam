import { Maze } from "./maze";

export class MyGameScene extends Phaser.Scene {
    constructor() {
        super({
            key: 'MyGameScene'
        });
    }

    preload() {
        this.load.spritesheet('bitter', require('./assets/SHEET.png'), {
            frameWidth: 8,
            frameHeight: 8,
            endFrame: 22
        });
    }

    create() {
        let maze = new Maze(10, 6);
        for (let i = 0; i < maze.dungeon.length; i++) {
            for (let j = 0; j < maze.dungeon[i].length; j++) {
                if (maze.dungeon[i][j]) {
                    this.add.sprite(i * 8, j * 8, 'bitter', 0).setOrigin(0, 0);
                }
            }
        }
    }

    update() {

    }
}