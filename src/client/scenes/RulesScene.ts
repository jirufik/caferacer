import Phaser from 'phaser';
import { MENU } from '../config/gameConfig.js';

const SLIDE_KEYS = [
  'slideRulesS1',
  'slideRulesS2',
  'slideRulesS3',
  'slideRulesS5',
  'slideRulesS6',
  'slideRulesS7',
  'slideRulesS8',
  'slideRulesS9',
  'slideRulesS10',
  'slideRulesS11',
  'slideRulesS4',
];

export class RulesScene extends Phaser.Scene {
  private curSlide = 0;
  private slideSprite!: Phaser.GameObjects.Sprite;
  private textSlide!: Phaser.GameObjects.Text;
  private rightSprite!: Phaser.GameObjects.Sprite;
  private leftSprite!: Phaser.GameObjects.Sprite;

  constructor() {
    super({ key: 'Rules' });
  }

  create(): void {
    this.curSlide = 0;

    this.cameras.main.setBackgroundColor('#FFFFFF');

    const bg = this.add.image(0, 0, 'backgroundS').setOrigin(0, 0);
    bg.setAlpha(0.2);

    // Close button
    const closeSprite = this.add.sprite(MENU.CLOSE_POS.x, MENU.CLOSE_POS.y, 'closeS');
    closeSprite.setOrigin(0.5, 0.5);
    closeSprite.setInteractive({ useHandCursor: true });
    closeSprite.on('pointerdown', () => this.scene.start('Game'));
    closeSprite.on('pointerover', () => closeSprite.setScale(1.2));
    closeSprite.on('pointerout', () => closeSprite.setScale(1));

    // Right arrow
    this.rightSprite = this.add.sprite(990, this.cameras.main.centerY, 'rightS');
    this.rightSprite.setOrigin(0.5, 0.5);
    this.rightSprite.setInteractive({ useHandCursor: true });
    this.rightSprite.on('pointerdown', () => this.nextSlide());
    this.rightSprite.on('pointerover', () => this.rightSprite.setScale(1.2));
    this.rightSprite.on('pointerout', () => this.rightSprite.setScale(1));

    // Left arrow
    this.leftSprite = this.add.sprite(30, this.cameras.main.centerY, 'leftS');
    this.leftSprite.setOrigin(0.5, 0.5);
    this.leftSprite.setInteractive({ useHandCursor: true });
    this.leftSprite.on('pointerdown', () => this.prevSlide());
    this.leftSprite.on('pointerover', () => this.leftSprite.setScale(1.2));
    this.leftSprite.on('pointerout', () => this.leftSprite.setScale(1));

    // Current slide sprite
    this.slideSprite = this.add.sprite(
      this.cameras.main.centerX,
      this.cameras.main.centerY,
      SLIDE_KEYS[this.curSlide],
    );
    this.slideSprite.setOrigin(0.5, 0.5);

    // Slide counter text
    this.textSlide = this.add.text(this.cameras.main.centerX, 685, `1 of ${SLIDE_KEYS.length}`, {
      fontFamily: 'Eras Bold ITC',
      fontSize: '30px',
      color: '#000',
    });
    this.textSlide.setOrigin(0.5, 0);

    // Keyboard
    this.input.keyboard!.on('keydown-ESC', () => this.scene.start('Game'));
    this.input.keyboard!.on('keydown-Q', () => this.scene.start('Game'));
    this.input.keyboard!.on('keydown-RIGHT', () => this.nextSlide());
    this.input.keyboard!.on('keydown-LEFT', () => this.prevSlide());
  }

  private nextSlide(): void {
    this.curSlide = (this.curSlide + 1) % SLIDE_KEYS.length;
    this.showSlide();
  }

  private prevSlide(): void {
    this.curSlide = (this.curSlide - 1 + SLIDE_KEYS.length) % SLIDE_KEYS.length;
    this.showSlide();
  }

  private showSlide(): void {
    this.slideSprite.destroy();
    this.slideSprite = this.add.sprite(
      this.cameras.main.centerX,
      this.cameras.main.centerY,
      SLIDE_KEYS[this.curSlide],
    );
    this.slideSprite.setOrigin(0.5, 0.5);
    this.textSlide.setText(`${this.curSlide + 1} of ${SLIDE_KEYS.length}`);
  }
}
