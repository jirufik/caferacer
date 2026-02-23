import Phaser from 'phaser';
import { audioManager } from '../systems/AudioManager.js';
import { MENU } from '../config/gameConfig.js';

interface Caption {
  role: string;
  name: string;
}

const CAPTIONS: Caption[] = [
  { role: 'Produced', name: 'Jirufik Gamez' },
  { role: 'Producer', name: 'Jirufik' },
  { role: 'Game Director', name: 'Jirufik' },
  { role: 'Art Director', name: 'Jirufik' },
  { role: 'Designer', name: 'Jirufik' },
  { role: 'Programmer', name: 'Jirufik' },
  { role: 'Tester', name: 'Jirufik' },
  { role: 'Soundman', name: 'Jirufik' },
  { role: 'Sound', name: 'http://freesound.org' },
  { role: 'Game engine', name: 'http://phaser.io' },
  { role: 'Phaser library', name: 'Phaser input' },
  { role: 'Code editor', name: 'Visual Studio Code for Mac OS X' },
  { role: 'Raster graphics editor', name: 'Paint.net' },
  { role: 'Vector graphics editor', name: 'Inkscape' },
  { role: 'Photo from the Internet', name: '' },
  { role: 'Jirufik', name: 'Rufus' },
  { role: 'My "Hello World" in JavaScript and Phaser', name: '' },
  { role: 'http://rufus.pro', name: 'jirufik@gmail.com' },
  { role: 'Created by Jirufik Gamez 2016', name: '' },
];

export class AboutScene extends Phaser.Scene {
  private jirufikSprite!: Phaser.GameObjects.Sprite;

  constructor() {
    super({ key: 'About' });
  }

  create(): void {
    audioManager.play('about');

    this.cameras.main.setBackgroundColor('#FFFFFF');

    const bg = this.add.image(0, 0, 'backgroundS').setOrigin(0, 0);
    bg.setAlpha(0.5);

    // Close button
    const closeSprite = this.add.sprite(MENU.CLOSE_POS.x, MENU.CLOSE_POS.y, 'closeS');
    closeSprite.setOrigin(0.5, 0.5);
    closeSprite.setInteractive({ useHandCursor: true });
    closeSprite.on('pointerdown', () => this.exitAbout());
    closeSprite.on('pointerover', () => closeSprite.setScale(1.2));
    closeSprite.on('pointerout', () => closeSprite.setScale(1));

    // Jirufik logo
    this.jirufikSprite = this.add.sprite(
      this.cameras.main.centerX,
      this.cameras.main.centerY,
      'jirufikS',
    );
    this.jirufikSprite.setScale(0.2);
    this.jirufikSprite.setOrigin(0.5, 0.5);

    // Scale up animation
    this.tweens.add({
      targets: this.jirufikSprite,
      scaleX: 1.3,
      scaleY: 1.3,
      duration: 2000,
      ease: 'Linear',
      onComplete: () => this.moveLogoOut(),
    });

    // Keyboard
    this.input.keyboard!.on('keydown-ESC', () => this.exitAbout());
    this.input.keyboard!.on('keydown-Q', () => this.exitAbout());
  }

  private moveLogoOut(): void {
    this.tweens.add({
      targets: this.jirufikSprite,
      y: -400,
      duration: 2000,
      ease: 'Linear',
      onComplete: () => this.startCaptions(0),
    });
  }

  private startCaptions(index: number): void {
    if (this.scene.key !== this.scene.manager.getScenes(true)[0]?.scene.key) {
      return;
    }

    if (index < CAPTIONS.length) {
      const caption = CAPTIONS[index];
      const text = caption.name.length === 0 ? caption.role : `${caption.role} - ${caption.name}`;

      const txt = this.add.text(this.cameras.main.centerX, 800, text, {
        fontFamily: 'Eras Bold ITC',
        fontSize: '50px',
        color: '#000',
      });
      txt.setOrigin(0.5, 0.5);

      this.tweens.add({
        targets: txt,
        y: -100,
        duration: 4000,
        ease: 'Linear',
      });

      this.time.delayedCall(1000, () => this.startCaptions(index + 1));
    } else {
      this.time.delayedCall(4000, () => this.exitAbout());
    }
  }

  private exitAbout(): void {
    audioManager.stop('about');
    this.scene.start('Game');
  }
}
