import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene.js';
import { GameScene } from './scenes/GameScene.js';
import { MenuScene } from './scenes/MenuScene.js';
import { RulesScene } from './scenes/RulesScene.js';
import { AboutScene } from './scenes/AboutScene.js';
import { GAME } from './config/gameConfig.js';

new Phaser.Game({
  type: Phaser.AUTO,
  width: GAME.WIDTH,
  height: GAME.HEIGHT,
  parent: GAME.PARENT,
  backgroundColor: GAME.BG_COLOR,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  dom: {
    createContainer: true,
  },
  scene: [BootScene, GameScene, MenuScene, RulesScene, AboutScene],
});
