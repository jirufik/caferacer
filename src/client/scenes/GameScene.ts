import Phaser from 'phaser';
import { gameState } from '../core/GameState.js';
import { audioManager } from '../systems/AudioManager.js';
import { AIController } from '../ai/AIPlayer.js';
import { Board } from '../entities/Board.js';
import { shuffle } from '../utils/helpers.js';
import { BOARD, GAMEPLAY, UI, DICE_CONFIG } from '../config/gameConfig.js';
import type { PlayerData } from '../types/index.js';

export class GameScene extends Phaser.Scene {
  // Dice sprites
  private qubic1!: Phaser.GameObjects.Sprite;
  private qubic2!: Phaser.GameObjects.Sprite;
  private qubic3!: Phaser.GameObjects.Sprite;

  // UI sprites
  private tonSprite!: Phaser.GameObjects.Sprite;
  private dangerSprite!: Phaser.GameObjects.Sprite;
  private raceSprite!: Phaser.GameObjects.Sprite;
  private rollSprite!: Phaser.GameObjects.Sprite;
  private aboutSprite!: Phaser.GameObjects.Sprite;
  private rulesSprite!: Phaser.GameObjects.Sprite;
  private settingsSprite!: Phaser.GameObjects.Sprite;
  private soundSprite!: Phaser.GameObjects.Sprite;
  private startSprite!: Phaser.GameObjects.Sprite;

  // UI texts
  private textGo!: Phaser.GameObjects.Text;
  private textStop!: Phaser.GameObjects.Text;
  private textCurPlayer!: Phaser.GameObjects.Text;
  private textCurLap!: Phaser.GameObjects.Text;
  private spriteCurPlayer!: Phaser.GameObjects.Sprite;

  // Medal animation
  private viewMedalsMas: Array<{ medal: string; nameplayer: string }> = [];
  private medalSprite: Phaser.GameObjects.Sprite | null = null;
  private txtLap: Phaser.GameObjects.Text | null = null;
  private finishSprite: Phaser.GameObjects.Sprite | null = null;

  constructor() {
    super({ key: 'Game' });
  }

  create(): void {
    this.add.image(0, 0, 'boardS').setOrigin(0, 0);

    this.createGame();
    this.createDice();
    this.createUI();
    this.createSounds();
    this.setupKeyboard();

    this.viewStart();
    this.updateDisplayTexts();
    this.updateCurPlayerDisplay();

    if (!gameState.flags.gameFinished && !gameState.flags.newGame) {
      gameState.flags.globalPause = false;
    }

    if (!gameState.flags.newGame && gameState.settings.playerRaceOnBoard) {
      this.raceOnBoard();
    }
  }

  update(): void {
    if (gameState.flags.globalPause) return;

    if (gameState.flags.diceAnimating) {
      this.qubic1.play('bzzz', true);
      this.qubic2.play('bzzz2', true);
      this.qubic3.play('bzzz3', true);
    } else {
      this.setDiceFrames();

      if (!gameState.flags.gamePaused && !gameState.flags.tokenAnimating) {
        this.robotPlay();
      }
    }

    if (!gameState.flags.tokenAnimating) {
      this.checkNextPlayer();
      this.checkEndGame();
    }
  }

  // ==================== GAME SETUP ====================

  private createGame(): void {
    if (gameState.flags.newGame) {
      if (gameState.getPlayerCount() === 0) {
        gameState.createDefaultPlayers();
      }
      gameState.resetForNewGame();

      let firstPosX = BOARD.START_X;
      const count = gameState.getPlayerCount();
      for (let i = 0; i < count; i++) {
        const player = gameState.getPlayer(i);
        player.sprite = this.add
          .sprite(firstPosX + BOARD.PLAYER_OFFSET, BOARD.START_Y, player.namesprite)
          .setOrigin(0, 0);
        firstPosX += BOARD.PLAYER_OFFSET;
      }
      gameState.settings.finishplayers = [];
      gameState.flags.nextPlayerTurn = false;
    } else {
      let firstPosX = BOARD.START_X;
      const count = gameState.getPlayerCount();
      for (let i = 0; i < count; i++) {
        const player = gameState.getPlayer(i);
        if (player.posonboard === 0) {
          player.sprite = this.add
            .sprite(firstPosX + BOARD.PLAYER_OFFSET, BOARD.START_Y, player.namesprite)
            .setOrigin(0, 0);
          firstPosX += BOARD.PLAYER_OFFSET;
        } else {
          const pos = Board.getPosition(player.posonboard);
          player.sprite = this.add.sprite(pos.x, pos.y, player.namesprite).setOrigin(0, 0);
        }
      }
    }
    this.setFinishSprites();
    gameState.flags.gamePaused = false;
  }

  private createDice(): void {
    this.qubic1 = this.add.sprite(UI.DICE_1_POS.x, UI.DICE_1_POS.y, 'qubicS').setOrigin(0, 0);
    this.anims.create({
      key: 'bzzz',
      frames: this.anims.generateFrameNumbers('qubicS', { frames: [0, 1] }),
      frameRate: DICE_CONFIG.FRAME_RATE,
      repeat: -1,
    });

    this.qubic2 = this.add.sprite(UI.DICE_2_POS.x, UI.DICE_2_POS.y, 'qubicS').setOrigin(0, 0);
    this.anims.create({
      key: 'bzzz2',
      frames: this.anims.generateFrameNumbers('qubicS', { frames: [0, 1] }),
      frameRate: DICE_CONFIG.FRAME_RATE,
      repeat: -1,
    });

    this.qubic3 = this.add.sprite(UI.DICE_3_POS.x, UI.DICE_3_POS.y, 'qubicS').setOrigin(0, 0);
    this.anims.create({
      key: 'bzzz3',
      frames: this.anims.generateFrameNumbers('qubicS', { frames: [0, 1] }),
      frameRate: DICE_CONFIG.FRAME_RATE,
      repeat: -1,
    });
  }

  private createUI(): void {
    this.tonSprite = this.add.sprite(UI.TON_POS.x, UI.TON_POS.y, 'tonS').setOrigin(0, 0);
    this.textGo = this.add.text(UI.TON_TEXT_POS.x, UI.TON_TEXT_POS.y, 'X 0', UI.TEXT_STYLE);

    this.dangerSprite = this.add
      .sprite(UI.DANGER_POS.x, UI.DANGER_POS.y, 'dangerS')
      .setOrigin(0, 0);
    this.textStop = this.add.text(UI.DANGER_TEXT_POS.x, UI.DANGER_TEXT_POS.y, 'X 0', UI.TEXT_STYLE);

    this.aboutSprite = this.createMenuButton(UI.ABOUT_POS.x, UI.ABOUT_POS.y, 'aboutS', () =>
      this.scene.start('About'),
    );

    this.rulesSprite = this.createMenuButton(UI.RULES_POS.x, UI.RULES_POS.y, 'rulesS', () =>
      this.scene.start('Rules'),
    );

    this.settingsSprite = this.createMenuButton(
      UI.SETTINGS_POS.x,
      UI.SETTINGS_POS.y,
      'setplayersS',
      () => this.scene.start('Menu'),
    );

    this.soundSprite = this.add
      .sprite(UI.SOUND_POS.x, UI.SOUND_POS.y, 'soundS')
      .setOrigin(0.5)
      .setInteractive();
    this.soundSprite.setFrame(gameState.flags.soundEnabled ? 0 : 1);
    this.soundSprite.on('pointerdown', () => this.toggleSound());
    this.soundSprite.on('pointerover', () => this.soundSprite.setScale(1.2));
    this.soundSprite.on('pointerout', () => this.soundSprite.setScale(1));

    this.raceSprite = this.createMenuButton(UI.RACE_POS.x, UI.RACE_POS.y, 'raceS', () =>
      this.playerRace(),
    );

    this.rollSprite = this.createMenuButton(UI.ROLL_POS.x, UI.ROLL_POS.y, 'rollS', () =>
      this.playerRoll(),
    );

    this.textCurPlayer = this.add.text(
      UI.CUR_PLAYER_TEXT_POS.x,
      UI.CUR_PLAYER_TEXT_POS.y,
      '',
      UI.TEXT_STYLE,
    );
    this.textCurLap = this.add.text(
      UI.CUR_LAP_TEXT_POS.x,
      UI.CUR_LAP_TEXT_POS.y,
      '',
      UI.TEXT_STYLE,
    );
    this.spriteCurPlayer = this.add
      .sprite(UI.CUR_PLAYER_SPRITE_POS.x, UI.CUR_PLAYER_SPRITE_POS.y, gameState.getCurrentPlayer().namesprite)
      .setOrigin(0, 0);
  }

  private createMenuButton(
    x: number,
    y: number,
    key: string,
    callback: () => void,
  ): Phaser.GameObjects.Sprite {
    const sprite = this.add.sprite(x, y, key).setOrigin(0.5).setInteractive();
    sprite.on('pointerdown', callback);
    sprite.on('pointerover', () => sprite.setScale(1.2));
    sprite.on('pointerout', () => sprite.setScale(1));
    return sprite;
  }

  private createSounds(): void {
    // AudioManager already initialized in BootScene
  }

  private setupKeyboard(): void {
    this.input.keyboard!.on('keydown-M', () => this.scene.start('Menu'));
    this.input.keyboard!.on('keydown-S', () => this.toggleSound());
    this.input.keyboard!.on('keydown-H', () => this.scene.start('Rules'));
    this.input.keyboard!.on('keydown-I', () => this.scene.start('About'));
    this.input.keyboard!.on('keydown-RIGHT', () => {
      if (this.raceSprite.input?.enabled) this.playerRace();
    });
    this.input.keyboard!.on('keydown-LEFT', () => {
      if (this.rollSprite.input?.enabled) this.playerRoll();
    });
    this.input.keyboard!.on('keydown-ENTER', () => {
      if (gameState.flags.gameFinished || gameState.flags.newGame) this.beginGame();
    });
  }

  // ==================== GAME FLOW ====================

  private viewStart(): void {
    if (gameState.flags.gameFinished || gameState.flags.newGame) {
      this.raceSprite.disableInteractive();
      this.rollSprite.disableInteractive();
      this.startSprite = this.add
        .sprite(UI.START_POS.x, this.cameras.main.centerY, 'startS')
        .setOrigin(0.5)
        .setInteractive();
      this.startSprite.on('pointerdown', () => this.beginGame());
      this.startSprite.on('pointerover', () => this.startSprite.setScale(1.2));
      this.startSprite.on('pointerout', () => this.startSprite.setScale(1));
      gameState.flags.globalPause = true;
    }
  }

  private beginGame(): void {
    if (this.startSprite) this.startSprite.destroy();

    const count = gameState.getPlayerCount();
    const players = gameState.settings.players;
    for (let i = 0; i < count; i++) {
      const p = players[i] as import('../entities/Player.js').Player;
      if (p.reset) p.reset(gameState.flags.newGame);
    }

    shuffle(gameState.settings.players);
    gameState.settings.curplayers = 0;
    gameState.settings.finishplayers = [];

    let firstPosX = BOARD.START_X;
    for (let i = 0; i < count; i++) {
      const player = players[i];
      if (player.sprite) {
        player.sprite.x = firstPosX + BOARD.PLAYER_OFFSET;
        player.sprite.y = BOARD.START_Y;
        this.children.bringToTop(player.sprite);
      }
      firstPosX += BOARD.PLAYER_OFFSET;
    }

    this.updateDisplayTexts();
    this.updateCurPlayerDisplay();

    gameState.flags.newGame = false;
    gameState.flags.gameFinished = false;
    gameState.flags.globalPause = false;
  }

  // ==================== DICE ====================

  private playerRoll(): void {
    const cur = gameState.getCurrentPlayer();
    if (!cur.robot) {
      this.resetAllButtons();
    }

    audioManager.play('diceroll');

    this.time.delayedCall(DICE_CONFIG.ANIMATION_DURATION, () => this.endDiceAnimation());
    gameState.flags.diceAnimating = true;

    gameState.diceResults.q1 = gameState.dice1.roll();
    gameState.diceResults.q2 = gameState.dice2.roll();
    gameState.diceResults.q3 = gameState.dice3.roll();
  }

  private endDiceAnimation(): void {
    this.processDiceResults();
    gameState.flags.diceAnimating = false;
  }

  private processDiceResults(): void {
    const cur = gameState.getCurrentPlayer();
    if (gameState.diceResults.q1 === 1) cur.goz++;
    else cur.stopz++;
    if (gameState.diceResults.q2 === 1) cur.goz++;
    else cur.stopz++;
    if (gameState.diceResults.q3 === 1) cur.goz++;
    else cur.stopz++;
    this.updateDisplayTexts();
  }

  private setDiceFrames(): void {
    this.qubic1.setFrame(gameState.diceResults.q1 === 1 ? 0 : 1);
    this.qubic2.setFrame(gameState.diceResults.q2 === 1 ? 0 : 1);
    this.qubic3.setFrame(gameState.diceResults.q3 === 1 ? 0 : 1);
  }

  // ==================== RACE / MOVE ====================

  private playerRace(): void {
    const cur = gameState.getCurrentPlayer();
    if (!cur.robot) {
      this.resetAllButtons();
    }
    if (cur.goz > 0) {
      if (cur.goz > cur.maxTon) cur.maxTon = cur.goz;
      this.raceOnBoard();
    }
  }

  private raceOnBoard(): void {
    const cur = gameState.getCurrentPlayer();
    if (gameState.flags.globalPause) return;

    gameState.settings.playerRaceOnBoard = true;
    if (cur.sprite) this.children.bringToTop(cur.sprite);

    if (cur.posonboard === 0 && cur.sprite) {
      cur.sprite.x = BOARD.SPRITE_START_X;
      cur.sprite.y = BOARD.SPRITE_START_Y;
    }

    if (cur.goz > 0) {
      gameState.flags.tokenAnimating = true;

      const offset = Board.getMoveOffset(cur.posonboard);
      if (cur.sprite) {
        cur.sprite.x += offset.x;
        cur.sprite.y += offset.y;
      }

      cur.goz--;
      cur.posonboard++;

      this.finishOrEndLap();

      audioManager.play('race');

      this.time.delayedCall(GAMEPLAY.MOVE_DELAY, () => this.raceOnBoard());
    } else {
      cur.stopz = 0;

      if (gameState.flags.hardcoreEnabled) {
        this.checkCollisions();
      }

      this.setPosPlayers();
      this.updateLapText();

      gameState.flags.nextPlayerTurn = true;
      this.checkNextPlayer();

      gameState.flags.gamePaused = false;
      gameState.flags.tokenAnimating = false;
      gameState.settings.playerRaceOnBoard = false;
    }
  }

  private finishOrEndLap(): void {
    const cur = gameState.getCurrentPlayer();

    if (cur.posonboard === Board.CELLS) {
      cur.lap++;
      this.updateLapText();
      this.showLapAnimation();
    }

    if (cur.lap > gameState.settings.laps) {
      audioManager.play('finish');
      this.showFinishAnimation();

      cur.posInGame = gameState.settings.finishplayers.length + 1;
      gameState.settings.finishplayers.push(cur);
      cur.stopz = 0;
      cur.goz = 0;
      this.setFinishSprites();
    } else if (cur.posonboard === 37) {
      cur.posonboard = 1;
    }
  }

  // ==================== COLLISIONS ====================

  private checkCollisions(): void {
    const cur = gameState.getCurrentPlayer();
    if (gameState.isPlayerFinished(cur)) return;

    const count = gameState.getPlayerCount();
    for (let i = 0; i < count; i++) {
      const player = gameState.getPlayer(i);
      if (cur.posonboard === player.posonboard && i !== gameState.settings.curplayers) {
        if (!gameState.isPlayerFinished(player)) {
          audioManager.play('incafe');

          if (player.posonboard === Board.CELLS) {
            player.lap--;
          }
          player.posonboard = 0;
          player.sumLoser++;
          cur.sumBreak++;
          this.setCafeSprites();
        }
      }
    }
  }

  // ==================== NEXT PLAYER ====================

  private checkNextPlayer(): void {
    const cur = gameState.getCurrentPlayer();

    if (gameState.flags.soundEnabled && cur.stopz >= GAMEPLAY.OVERHEAT_LIMIT) {
      audioManager.play('danger');
    }

    if (cur.stopz >= GAMEPLAY.OVERHEAT_LIMIT || gameState.flags.nextPlayerTurn) {
      if (cur.stopz >= GAMEPLAY.OVERHEAT_LIMIT) {
        cur.sumStopz++;
      }

      cur.stopz = 0;
      cur.goz = 0;
      cur.sumStep++;
      cur.sumAllStep++;

      this.advanceToNextPlayer();
      this.setDiceFrames();
      this.updateDisplayTexts();
      this.updateCurPlayerDisplay();

      gameState.flags.nextPlayerTurn = false;
    }
  }

  private advanceToNextPlayer(): void {
    let allFinished = true;
    const count = gameState.getPlayerCount();
    for (let i = 0; i < count; i++) {
      if (!gameState.isPlayerFinished(gameState.getPlayer(i))) {
        allFinished = false;
        break;
      }
    }
    gameState.flags.gameFinished = allFinished;

    if (!allFinished) {
      let z = gameState.settings.curplayers + 1;
      while (z !== gameState.settings.curplayers) {
        if (z >= count) z = 0;
        const player = gameState.getPlayer(z);
        if (!gameState.isPlayerFinished(player)) {
          gameState.settings.curplayers = z;
          if (player.sprite) this.children.bringToTop(player.sprite);
          break;
        }
        z++;
      }
    }
  }

  // ==================== AI ====================

  private robotPlay(): void {
    const cur = gameState.getCurrentPlayer();
    if (!cur.robot) {
      this.raceSprite.setInteractive();
      this.rollSprite.setInteractive();
      return;
    }

    gameState.flags.gamePaused = true;
    this.time.delayedCall(GAMEPLAY.AI_DECISION_DELAY, () => {
      gameState.flags.gamePaused = false;
    });

    this.raceSprite.disableInteractive();
    this.rollSprite.disableInteractive();

    const decision = AIController.decide(cur, gameState);
    if (decision === 'race' && cur.goz > 0) {
      this.playerRace();
    } else {
      this.playerRoll();
    }
  }

  // ==================== END GAME / MEDALS ====================

  private checkEndGame(): void {
    if (!gameState.flags.gameFinished) return;

    gameState.flags.globalPause = true;
    this.raceSprite.disableInteractive();
    this.rollSprite.disableInteractive();

    this.setAllMedals();
  }

  private setAllMedals(): void {
    this.viewMedalsMas = [];
    const fp = gameState.settings.finishplayers;

    if (fp.length > 0) {
      fp[0].medalsPos1++;
      this.viewMedalsMas.push({ medal: 'medalsPos1', nameplayer: fp[0].nameplayer });
    }
    if (fp.length > 1) {
      fp[1].medalsPos2++;
      this.viewMedalsMas.push({ medal: 'medalsPos2', nameplayer: fp[1].nameplayer });
    }
    if (fp.length > 2) {
      fp[2].medalsPos3++;
      this.viewMedalsMas.push({ medal: 'medalsPos3', nameplayer: fp[2].nameplayer });
    }

    const statMedals: Array<{ medal: keyof PlayerData; stat: keyof PlayerData }> = [
      { medal: 'medalsfastPlayer', stat: 'maxTon' },
      { medal: 'medalsbreakingPlayer', stat: 'sumStopz' },
      { medal: 'medalshorriblePlayer', stat: 'sumBreak' },
      { medal: 'medalsloserPlayer', stat: 'sumLoser' },
    ];

    for (const { medal, stat } of statMedals) {
      let maxVal = 0;
      let maxIdx = 0;
      for (let i = 0; i < fp.length; i++) {
        const val = fp[i][stat] as number;
        if (val > maxVal) {
          maxVal = val;
          maxIdx = i;
        }
      }
      if (maxVal > 0) {
        (fp[maxIdx][medal] as number)++;
        this.viewMedalsMas.push({ medal, nameplayer: fp[maxIdx].nameplayer });
        // Tie check
        for (let i = 0; i < fp.length; i++) {
          if (i !== maxIdx && (fp[i][stat] as number) === maxVal) {
            (fp[i][medal] as number)++;
            this.viewMedalsMas.push({ medal, nameplayer: fp[i].nameplayer });
          }
        }
      }
    }

    this.time.delayedCall(4000, () => this.showMedalAnimation());
  }

  private getMedalSpriteKey(medal: string): string {
    const map: Record<string, string> = {
      medalsPos1: 'Pos1S',
      medalsPos2: 'Pos2S',
      medalsPos3: 'Pos3S',
      medalsfastPlayer: 'TopSpeedS',
      medalsbreakingPlayer: 'DesperateS',
      medalshorriblePlayer: 'HorribleS',
      medalsloserPlayer: 'LoserS',
    };
    return map[medal] || medal;
  }

  private showMedalAnimation(): void {
    this.destroyMedalAnimation();

    if (this.viewMedalsMas.length > 0) {
      const { nameplayer, medal } = this.viewMedalsMas[0];
      const spriteKey = this.getMedalSpriteKey(medal);

      this.txtLap = this.add.text(364, 420, nameplayer, { ...UI.TEXT_STYLE_30 }).setOrigin(0.5);

      this.tweens.add({
        targets: this.txtLap,
        scaleX: 3,
        scaleY: 3,
        duration: 2000,
        ease: 'Linear',
      });
      this.tweens.add({ targets: this.txtLap, y: 510, duration: 2000, ease: 'Linear' });

      this.medalSprite = this.add.sprite(364, 364, spriteKey).setOrigin(0.5);
      this.tweens.add({
        targets: this.medalSprite,
        scaleX: 3,
        scaleY: 3,
        duration: 2000,
        ease: 'Linear',
        onComplete: () => this.endMedalAnimation(),
      });
    } else {
      this.viewStart();
    }
  }

  private endMedalAnimation(): void {
    if (this.medalSprite) {
      this.tweens.add({
        targets: this.medalSprite,
        alpha: 0.1,
        duration: 1000,
        ease: 'Linear',
        onComplete: () => this.nextMedal(),
      });
    }
    if (this.txtLap) {
      this.tweens.add({ targets: this.txtLap, alpha: 0.1, duration: 1000, ease: 'Linear' });
    }
  }

  private nextMedal(): void {
    this.destroyMedalAnimation();
    this.viewMedalsMas.splice(0, 1);
    if (this.viewMedalsMas.length === 0) {
      this.viewStart();
    } else {
      this.showMedalAnimation();
    }
  }

  private destroyMedalAnimation(): void {
    this.medalSprite?.destroy();
    this.medalSprite = null;
    this.txtLap?.destroy();
    this.txtLap = null;
  }

  // ==================== ANIMATIONS ====================

  private showLapAnimation(): void {
    this.destroyLapText();
    const cur = gameState.getCurrentPlayer();
    if (cur.lap <= gameState.settings.laps) {
      const txt = `Lap ${cur.lap}`;
      this.txtLap = this.add.text(364, 364, txt, { ...UI.TEXT_STYLE_30 }).setOrigin(0.5);
      this.tweens.add({
        targets: this.txtLap,
        scaleX: 4,
        scaleY: 4,
        duration: 2000,
        ease: 'Linear',
        onComplete: () => this.endLapAnimation(),
      });
    }
  }

  private endLapAnimation(): void {
    if (this.txtLap) {
      this.tweens.add({
        targets: this.txtLap,
        alpha: 0.1,
        duration: 1000,
        ease: 'Linear',
        onComplete: () => this.destroyLapText(),
      });
    }
  }

  private destroyLapText(): void {
    this.txtLap?.destroy();
    this.txtLap = null;
  }

  private showFinishAnimation(): void {
    this.finishSprite?.destroy();
    this.finishSprite = this.add.sprite(364, 364, 'finishS').setOrigin(0.5).setScale(0.2);
    this.tweens.add({
      targets: this.finishSprite,
      scaleX: 1,
      scaleY: 1,
      duration: 2000,
      ease: 'Linear',
      onComplete: () => {
        if (this.finishSprite) {
          this.tweens.add({
            targets: this.finishSprite,
            alpha: 0.1,
            duration: 1000,
            ease: 'Linear',
            onComplete: () => {
              this.finishSprite?.destroy();
              this.finishSprite = null;
            },
          });
        }
      },
    });
  }

  // ==================== SPRITE POSITIONING ====================

  private setCafeSprites(): void {
    let firstPosX = BOARD.START_X;
    const count = gameState.getPlayerCount();
    for (let i = 0; i < count; i++) {
      const player = gameState.getPlayer(i);
      if (player.posonboard === 0 && player.sprite) {
        player.sprite.x = firstPosX;
        player.sprite.y = BOARD.START_Y;
        this.children.bringToTop(player.sprite);
        firstPosX += BOARD.PLAYER_OFFSET;
      }
    }
  }

  private setFinishSprites(): void {
    let firstPosX = BOARD.FINISH_X;
    for (const player of gameState.settings.finishplayers) {
      if (player.sprite) {
        player.sprite.x = firstPosX;
        player.sprite.y = BOARD.FINISH_Y;
        this.children.bringToTop(player.sprite);
      }
      firstPosX += BOARD.PLAYER_OFFSET;
    }
  }

  private setPosPlayers(): void {
    const fp = gameState.settings.finishplayers;
    const sumFin = fp.length;
    const firstPos = sumFin + 1;
    const endPos = gameState.getPlayerCount();

    let tmpMax = 100000;
    let tmpValue = 0;

    for (let i = firstPos; i <= endPos; i++) {
      for (let j = 0; j < endPos; j++) {
        const player = gameState.getPlayer(j);
        if (!gameState.isPlayerFinished(player)) {
          const score = player.posonboard + player.lap * 100;
          if (score < tmpMax && score >= tmpValue) {
            player.posInGame = i;
            tmpValue = score;
          }
        }
      }
      tmpMax = tmpValue;
      tmpValue = 0;
    }

    for (let f = 0; f < fp.length; f++) {
      fp[f].posInGame = f + 1;
    }
  }

  // ==================== DISPLAY UPDATE ====================

  private updateDisplayTexts(): void {
    const cur = gameState.getCurrentPlayer();
    this.textGo.setText(`X ${cur.goz}`);
    this.textStop.setText(`X ${cur.stopz}`);
  }

  private updateCurPlayerDisplay(): void {
    const cur = gameState.getCurrentPlayer();
    this.textCurPlayer.setText(cur.nameplayer);
    this.spriteCurPlayer?.destroy();
    this.spriteCurPlayer = this.add
      .sprite(UI.CUR_PLAYER_SPRITE_POS.x, UI.CUR_PLAYER_SPRITE_POS.y, cur.namesprite)
      .setOrigin(0, 0);
    this.updateLapText();
  }

  private updateLapText(): void {
    const cur = gameState.getCurrentPlayer();
    let lap = cur.lap;
    if (lap > gameState.settings.laps) lap--;
    this.textCurLap.setText(`Lap: ${lap} of ${gameState.settings.laps}`);
  }

  private toggleSound(): void {
    const enabled = audioManager.toggle();
    this.soundSprite.setFrame(enabled ? 0 : 1);
  }

  private resetAllButtons(): void {
    this.time.delayedCall(500, () => {
      this.aboutSprite.setScale(1);
      this.rulesSprite.setScale(1);
      this.settingsSprite.setScale(1);
      this.soundSprite.setScale(1);
      this.raceSprite.setScale(1);
      this.rollSprite.setScale(1);
    });
  }

  // Pause game when leaving scene
  goodBuyStateGame(): void {
    gameState.flags.globalPause = true;
    if (!gameState.settings.playerRaceOnBoard) {
      if (gameState.flags.diceAnimating) {
        gameState.flags.diceAnimating = false;
        this.processDiceResults();
      }
    }
    this.viewMedalsMas = [];
    this.destroyMedalAnimation();
  }
}
