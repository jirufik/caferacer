import { gameState } from '../core/GameState.js';

export class AudioManager {
  private sounds: Map<string, Phaser.Sound.BaseSound> = new Map();

  init(scene: Phaser.Scene): void {
    this.sounds.set('diceroll', scene.sound.add('diceroll'));
    this.sounds.set('incafe', scene.sound.add('incafe'));
    this.sounds.set('danger', scene.sound.add('danger'));
    this.sounds.set('finish', scene.sound.add('finish'));
    this.sounds.set('race', scene.sound.add('race'));
    this.sounds.set('about', scene.sound.add('about'));
  }

  play(key: string): void {
    if (gameState.flags.soundEnabled) {
      this.sounds.get(key)?.play();
    }
  }

  stop(key: string): void {
    this.sounds.get(key)?.stop();
  }

  toggle(): boolean {
    gameState.flags.soundEnabled = !gameState.flags.soundEnabled;
    return gameState.flags.soundEnabled;
  }
}

export const audioManager = new AudioManager();
