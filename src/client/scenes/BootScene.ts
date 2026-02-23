import Phaser from 'phaser';
import {
  IMAGES,
  PLAYER_TOKENS,
  RULES_SLIDES,
  SPRITESHEETS,
  AUDIO,
} from '../config/assetManifest.js';
import { gameState } from '../core/GameState.js';
import { audioManager } from '../systems/AudioManager.js';
import { SaveManager } from '../systems/SaveManager.js';
import { Player } from '../entities/Player.js';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'Boot' });
  }

  preload(): void {
    for (const img of IMAGES) {
      this.load.image(img.key, img.path);
    }
    for (const token of PLAYER_TOKENS) {
      this.load.image(token.key, token.path);
    }
    for (const slide of RULES_SLIDES) {
      this.load.image(slide.key, slide.path);
    }
    for (const sheet of SPRITESHEETS) {
      this.load.spritesheet(sheet.key, sheet.path, {
        frameWidth: sheet.frameWidth,
        frameHeight: sheet.frameHeight,
      });
    }
    for (const audio of AUDIO) {
      this.load.audio(audio.key, audio.path);
    }
  }

  create(): void {
    // Load saved data
    const saved = SaveManager.load();
    if (saved && saved.players.length >= 2) {
      gameState.settings.players = saved.players.map((p) => {
        const player = new Player(p.namesprite, p.robot, p.nameplayer);
        player.sumAllStep = p.sumAllStep;
        player.medalsPos1 = p.medalsPos1;
        player.medalsPos2 = p.medalsPos2;
        player.medalsPos3 = p.medalsPos3;
        player.medalsfastPlayer = p.medalsfastPlayer;
        player.medalsbreakingPlayer = p.medalsbreakingPlayer;
        player.medalshorriblePlayer = p.medalshorriblePlayer;
        player.medalsloserPlayer = p.medalsloserPlayer;
        return player;
      });
      gameState.settings.laps = saved.laps;
      gameState.flags.hardcoreEnabled = saved.hardcoreEnabled;
      gameState.flags.soundEnabled = saved.soundEnabled;
    }

    gameState.flags.globalPause = true;
    gameState.flags.newGame = true;
    gameState.flags.soundEnabled = saved?.soundEnabled ?? true;

    this.add.image(0, 0, 'backgroundS').setOrigin(0, 0);

    audioManager.init(this);

    const logoText = this.add.sprite(
      this.cameras.main.centerX,
      this.cameras.main.centerY,
      'logoTextS',
    );
    logoText.setScale(0.2);
    logoText.setOrigin(0.5, 0.5);
    logoText.setAngle(-60);
    logoText.setAlpha(0.8);

    this.tweens.add({
      targets: logoText,
      angle: 20,
      duration: 2000,
      ease: 'Linear',
    });
    this.tweens.add({
      targets: logoText,
      scaleX: 1,
      scaleY: 1,
      duration: 2000,
      ease: 'Linear',
    });

    this.time.delayedCall(5000, () => {
      this.scene.start('Game');
    });
  }
}
