import { MyGameScene } from "./myGameScene";
import { MyTitleScene } from "./myTitleScene";
import { MyPreloaderScene } from "./myPreloaderScene";

type GameConfig = Phaser.Types.Core.GameConfig;

let fps = 30;

export const MyGameConfig: GameConfig = {
    type: Phaser.AUTO,
    input: {
        //gamepad: true,
        keyboard: true
    },
    render: {
        antialias: false 
    },
    scale: {
        mode: Phaser.Scale.FIT
    },
    parent: 'game-parent',
    physics: {
        default: 'arcade',
        arcade: {
            //debug: true,
            gravity: { y: 0 },
            fps: fps
        }
    },
    width: 256,
    height: 256,
    fps: {
        target: fps,
        //forceSetTimeOut: true
    },
    //scene: [MyPreloaderScene, MyLoaderScene, MyTitleScene, MyGameScene]
    scene: [MyPreloaderScene, MyTitleScene, MyGameScene]
};