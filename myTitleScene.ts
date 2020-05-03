export class MyTitleScene extends Phaser.Scene {
    loadingSprite: Phaser.GameObjects.Sprite;

    constructor() {
        super({
            key: 'MyTitleScene'
        });
    }

    preload() {
        this.loadingSprite = this.add.sprite(0, 0, 'loading')
            .setOrigin(0, 0)
            .setScale(8);
        this.tweens.add({
            targets: [this.loadingSprite],
            repeat: -1,
            yoyo: true,
            alpha: 0
        });

        this.load.audio('step', require('./assets/step.wav'));
        this.load.audio('bonk', require('./assets/bonk.wav'));
        this.load.audio('goal', require('./assets/goal.wav'));
        this.load.audio('weird', require('./assets/10 Weird.mp3'));
        this.load.spritesheet('bitter', require('./assets/SHEET.png'), {
            frameWidth: 8,
            frameHeight: 8,
            endFrame: 22
        });
        this.load.image('win', require('./assets/win.png'));
        this.load.image('title', require('./assets/title.png'));
        this.load.spritesheet('numerals', require('./assets/numerals.png'), {
            frameWidth: 3,
            frameHeight: 5,
            endFrame: 9
        });

        this.load.once('complete', () => {
            this.loadingSprite.destroy();
        });
    }

    create() {
        // hack the spritesheet for love
        this.getSpriteSheetWithAlpha();

        this.add.rectangle(0, 0, 256, 256, 0xaaa95a)
            .setOrigin(0, 0);
        this.add.sprite(0, 0, 'title')
            .setOrigin(0, 0)
            .setScale(8, 8);

        // quiet please
        this.sound.stopAll();
        this.sound.play('weird', {
            loop: true,
            seek: 60,
            volume: 0.25
        });

        this.input.keyboard.addKey('SPACE').addListener('up', () => this.goToGame(), this);
    }

    goToGame() {
        this.scene.start('MyGameScene');
    }

    getSpriteSheetWithAlpha() {
        if (this.textures.checkKey('bitter-alpha') === false) {
            return;
        }

        let sourceTexture = this.textures.get('bitter');
        let sourceImage = sourceTexture.getSourceImage();
        let newTexture = this.textures.createCanvas('bitter-alpha-canvas', sourceImage.width, sourceImage.height);
        let context = newTexture.getContext();

        context.drawImage(sourceImage as CanvasImageSource, 0, 0);

        let pixels = context.getImageData(0, 0, sourceImage.width, sourceImage.height);
        for (let i = 0; i < pixels.data.length / 4; i++) {
            let index = i * 4;
            if (pixels.data[index] > 0) {
                pixels.data[index] = 0;
                pixels.data[index + 1] = 0;
                pixels.data[index + 2] = 0;
                pixels.data[index + 3] = 0;
            } else {
                pixels.data[index] = 255;
                pixels.data[index + 1] = 255;
                pixels.data[index + 2] = 255;
                pixels.data[index + 3] = 255;
            }
        }

        context.putImageData(pixels, 0, 0);
        newTexture.refresh();

        this.textures.addSpriteSheet('bitter-alpha', newTexture.getSourceImage() as HTMLImageElement, {
            frameWidth: 8,
            frameHeight: 8,
            endFrame: 22
        });
    }
}