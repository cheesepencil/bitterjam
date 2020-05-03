import { Maze } from "./maze";

export class MyGameScene extends Phaser.Scene {
    hero: Phaser.GameObjects.Sprite;
    goal: Phaser.GameObjects.Sprite;
    maze: Maze;
    cursors: Phaser.Types.Input.Keyboard.CursorKeys;
    lastMove: number = 0;
    randomizer: Phaser.Math.RandomDataGenerator;
    previousState: string;
    level: number;
    maxLevel: number = 10;
    steps: number = 0;
    levelSteps: number = 0;

    constructor() {
        super({
            key: 'MyGameScene'
        });

        let seed = 'This jam had drama from day one!';
        this.randomizer = new Phaser.Math.RandomDataGenerator([seed])
    }

    preload() {

    }

    create(data: { width: number, height: number, level: number, restart: boolean }) {
        // move somewhere else and randomize
        let sceneColor = this.colorSwap(data.level ?? this.level ?? 1, 0xaaa95a);
        let wallColor = this.colorSwap(data.level ?? this.level ?? 1, 0x1b2d2a);
        let pathColor = this.colorSwap(data.level ?? this.level ?? 1, 0x82816d);
        let heroColor = 0x414066;
        let goalColor = 0xceff1a;

        // scene background color
        this.cameras.main.setBackgroundColor(sceneColor);
        this.add.tween({
            targets: [this.cameras.main.backgroundColor],
            alpha: 128,
            repeat: -1,
            yoyo: true,
            duration: 5000
        });

        // save randomizer for reboots
        if (data.restart) {
            this.randomizer.state(this.previousState);
        } else {
            this.previousState = this.randomizer.state();
        }
        this.levelSteps = 0;

        // level and dungeon init
        let mazeWidth = data.width ?? 4;
        let mazeHeight = data.height ?? 4;
        this.level = data.level ?? 1;
        for (let i = 0; i < this.maxLevel; i++) {
            this.add.sprite((i * 8) + (11 * 8), 31 * 8, 'bitter', 0)
                .setOrigin(0, 0)
                .setTint(0x555555)
                .setScrollFactor(0)
                .setDepth(5);
        }
        for (let i = 0; i < this.level - 1; i++) {
            let frame = i == this.maxLevel - 1 ? 14 : 6;
            this.add.sprite((i * 8) + (11 * 8), 31 * 8, 'bitter-alpha', frame)
                .setOrigin(0, 0)
                .setTint(0x00ff00)
                .setScrollFactor(0)
                .setDepth(5);
        }
        for (let i = this.level - 1; i < this.maxLevel; i++) {
            let frame = i == this.maxLevel - 1 ? 14 : 6;
            this.add.sprite((i * 8) + (11 * 8), 31 * 8, 'bitter-alpha', frame)
                .setOrigin(0, 0)
                .setTint(0x333333)
                .setScrollFactor(0)
                .setDepth(5);
        }

        // draw maze
        this.maze = new Maze(mazeWidth, mazeHeight, this.randomizer);
        let path = this.add.rectangle(0, 0, this.maze.pixelWidth, this.maze.pixelHeight, pathColor)
            .setOrigin(0, 0);
        for (let i = 0; i < this.maze.dungeon.length; i++) {
            for (let j = 0; j < this.maze.dungeon[i].length; j++) {
                if (this.maze.dungeon[i][j]) {
                    this.add.sprite(i * 8, j * 8, 'bitter', 0).setOrigin(0, 0).setTint(wallColor);
                }
            }
        }

        // init hero, goal, and camera
        this.hero = this.add.sprite(8, 8, 'bitter-alpha', 16)
            .setOrigin(0, 0)
            .setTint(heroColor)
            .setDepth(10);
        this.goal = this.add.sprite((this.maze.blockWidth - 2) * 8, (this.maze.blockHeight - 2) * 8, 'bitter-alpha', 10)
            .setOrigin(0, 0)
            .setTint(goalColor);
        this.tweens.add({
            targets: [this.goal],
            alpha: 0.25,
            yoyo: true,
            repeat: -1,
            duration: 300
        })
        this.cameras.main.centerOn(this.hero.x, this.hero.y);

        // input
        this.lastMove = 0;
        if (!this.cursors) this.cursors = this.input.keyboard.createCursorKeys();
    }

    update(time: number, delta: number) {
        if (time > this.lastMove + 100) {
            this.lastMove = time;
            if (this.cursors.down.isDown) this.move('down');
            else if (this.cursors.up.isDown) this.move('up');
            else if (this.cursors.left.isDown) this.move('left');
            else if (this.cursors.right.isDown) this.move('right');

            // got lost lol
            if (this.cursors.space.isDown) {
                this.sound.play('bonk');
                this.scene.restart({
                    width: this.maze.width,
                    height: this.maze.height,
                    restart: true,
                    level: this.level
                });
            }
        }
    }

    move(direction: string) {
        let destination = new Phaser.Geom.Point(this.hero.x / 8, this.hero.y / 8);

        switch (direction) {
            case 'up':
                destination.y -= 1;
                break;
            case 'down':
                destination.y += 1;
                break;
            case 'left':
                destination.x -= 1;
                break;
            case 'right':
                destination.x += 1;
                break;
        }

        if (this.maze.dungeon[destination.x][destination.y]) {
            // this.sound.play('bonk');
        } else {
            this.steps++;
            this.levelSteps++;
            this.sound.play('step');
            this.add.sprite(this.hero.x, this.hero.y, 'bitter-alpha', 9)
                .setOrigin(0, 0)
                .setTint(0xceff1a)
                .setAlpha(0.2);
            this.hero.x = destination.x * 8;
            this.hero.y = destination.y * 8;
            this.cameras.main.centerOn(this.hero.x, this.hero.y);
        }

        if (this.hero.x === this.goal.x && this.hero.y === this.goal.y) {
            this.sound.play('goal', { volume: 0.1 });
            this.goal.destroy();
            if (this.level === this.maxLevel) {
                this.steps += this.levelSteps;
                console.log(`Completed the game in ${this.steps} steps!`);
                this.win();
                this.input.keyboard.shutdown();
            } else {
                console.log(`Completed level ${this.level} in ${this.levelSteps} steps!`);
                this.scene.restart({
                    width: this.maze.width + 3,
                    height: this.maze.width + 3,
                    restart: false,
                    level: this.level + 1,
                    steps: this.steps + this.levelSteps
                });
            }
        }
    }

    win() {
        // dark background
        for (let i = 0; i < 32; i++) {
            for (let j = 0; j < 32; j++) {
                this.add.sprite(i * 8, j * 8, 'bitter', 0)
                    .setOrigin(0, 0)
                    .setTint(0x0ff0000)
                    .setDepth(20)
                    .setScrollFactor(0);
            }
        }
        // hearts
        let hearts = [];
        for (let i = 0; i < 32; i++) {
            hearts[i] = [];
            for (let j = 0; j < 32; j++) {
                hearts[i][j] =
                    this.add.sprite(i * 8, j * 8, 'bitter-alpha', 14)
                        .setOrigin(0, 0)
                        .setTint(0xffc0cb)
                        .setDepth(20)
                        .setScrollFactor(0);
            }
        }
        this.add.sprite(0, 0, 'win')
            .setOrigin(0, 0)
            .setDepth(21)
            .setScrollFactor(0)
            .setScale(8, 8);

        let stepString = this.steps.toString()
        for (let i = stepString.length - 1; i >= 0; i--) {
            this.add.sprite(31 * 8 - ((stepString.length - 1 - i) * 4 * 8), 19 * 8 , 'numerals', stepString[i])
                .setScrollFactor(0)
                .setScale(8)
                .setOrigin(1, 0)
                .setDepth(23);
        }
    }

    colorSwap(level: number, colorValue: number): number {
        let rgb = Phaser.Display.Color.IntegerToRGB(colorValue);
        let hsv = Phaser.Display.Color.RGBToHSV(rgb.r, rgb.g, rgb.b);
        let delta = (0.25 * (level - 1));
        let h = hsv.h + delta;
        let resultRgb = Phaser.Display.Color.HSVToRGB(h, hsv.s, hsv.v) as Phaser.Types.Display.ColorObject;
        let resultString = Phaser.Display.Color.GetColor(resultRgb.r, resultRgb.g, resultRgb.b);
        return resultString;
    }
}