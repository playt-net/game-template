import { Game as PhaserGame } from 'phaser';

export const createGame = (containerId: string) => {
    return new PhaserGame({
        type: Phaser.AUTO,
        parent: containerId,
        pixelArt: false,
        roundPixels: false,
        antialias: true,
        scale: {
            mode: Phaser.Scale.FIT,
            width: 375 * window.devicePixelRatio,
            height: 510 * window.devicePixelRatio,
            zoom: 1 / window.devicePixelRatio,
            autoRound: true,
            min: {
                width: 375 * window.devicePixelRatio,
                height: 510 * window.devicePixelRatio,
            },
            max: {
                width: 375 * window.devicePixelRatio * 1.6,
                height: 510 * window.devicePixelRatio * 1.6,
            },
        },
        powerPreference: 'high-performance',
        autoFocus: true,
        physics: {
            default: 'arcade',
            arcade: {
                gravity: { x: 0, y: 0 },
            },
        },
        scene: [],
    });
};
