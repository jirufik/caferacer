import Phaser from 'phaser';
import { gameState } from '../core/GameState.js';
import { Player } from '../entities/Player.js';
import { SaveManager } from '../systems/SaveManager.js';
import { MENU, GAMEPLAY, UI } from '../config/gameConfig.js';
import type { PlayerData } from '../types/index.js';

export class MenuScene extends Phaser.Scene {
  private curUserIndex = 0;
  private curUserIndexTmp = 0;
  private isNewPlayerCard = false;

  // Sprites
  private tmpSpriteUser!: Phaser.GameObjects.Sprite;
  private inputElement!: Phaser.GameObjects.DOMElement;
  private htmlInput!: HTMLInputElement;
  private checkSprite!: Phaser.GameObjects.Sprite;
  private btnAddDelSprite!: Phaser.GameObjects.Sprite;
  private btnHardcoreSprite!: Phaser.GameObjects.Sprite;
  private rightSprite!: Phaser.GameObjects.Sprite;
  private leftSprite!: Phaser.GameObjects.Sprite;
  private closeSprite!: Phaser.GameObjects.Sprite;
  private plusSprite!: Phaser.GameObjects.Sprite;
  private minusSprite!: Phaser.GameObjects.Sprite;

  // Medal texts
  private txtPos1!: Phaser.GameObjects.Text;
  private txtPos2!: Phaser.GameObjects.Text;
  private txtPos3!: Phaser.GameObjects.Text;
  private txtTopSpeed!: Phaser.GameObjects.Text;
  private txtHorrible!: Phaser.GameObjects.Text;
  private txtDesperate!: Phaser.GameObjects.Text;
  private txtLoser!: Phaser.GameObjects.Text;

  // Stats texts
  private txtPos!: Phaser.GameObjects.Text;
  private txtLap!: Phaser.GameObjects.Text;
  private txtTS!: Phaser.GameObjects.Text;
  private txtHor!: Phaser.GameObjects.Text;
  private txtDes!: Phaser.GameObjects.Text;
  private txtLos!: Phaser.GameObjects.Text;
  private txtSteps!: Phaser.GameObjects.Text;
  private txtLaps!: Phaser.GameObjects.Text;

  // Selection overlay
  private fonSprite: Phaser.GameObjects.Sprite | null = null;
  private groupFishki: Phaser.GameObjects.Group | null = null;

  constructor() {
    super({ key: 'Menu' });
  }

  create(): void {
    this.pauseGame();

    this.cameras.main.setBackgroundColor('#FFFFFF');
    const bg = this.add.image(0, 0, 'backgroundS').setOrigin(0, 0);
    bg.setAlpha(0.2);

    this.closeSprite = this.createButton(980, 50, 'closeS', () => this.goBack());
    this.rightSprite = this.createButton(990, this.cameras.main.centerY, 'rightS', () =>
      this.viewUserNext(),
    );
    this.leftSprite = this.createButton(30, this.cameras.main.centerY, 'leftS', () =>
      this.viewUserPrevious(),
    );

    // Username input
    this.htmlInput = document.createElement('input');
    this.htmlInput.type = 'text';
    this.htmlInput.maxLength = 12;
    this.htmlInput.placeholder = 'Username';
    this.htmlInput.style.cssText =
      'font: bold 28px "Eras Bold ITC", sans-serif; color: #212121; width: 180px; padding: 8px; border: 3px solid #000; text-align: center; background: rgba(255,255,255,0.5);';
    this.inputElement = this.add.dom(
      MENU.SPRITE_PLAYER_X - 10,
      MENU.SPRITE_PLAYER_Y + 95,
      this.htmlInput,
    );

    this.curUserIndex = gameState.settings.curplayers;
    this.curUserIndexTmp = gameState.settings.curplayers;
    this.isNewPlayerCard = false;

    const cur = gameState.getPlayer(this.curUserIndex);
    this.tmpSpriteUser = this.createButton(
      MENU.SPRITE_PLAYER_X,
      MENU.SPRITE_PLAYER_Y,
      cur.namesprite,
      () => this.selectUserSprite(),
    );

    // Autopilot checkbox
    this.checkSprite = this.add
      .sprite(MENU.SPRITE_PLAYER_X + 180, MENU.SPRITE_PLAYER_Y + 80, 'checkS')
      .setOrigin(0.5)
      .setInteractive();
    this.checkSprite.on('pointerdown', () => this.toggleRobot());
    this.add.text(
      MENU.SPRITE_PLAYER_X + 220,
      MENU.SPRITE_PLAYER_Y + 65,
      'Autopilot',
      UI.TEXT_STYLE_30,
    );

    // Medals display
    this.createMedalsDisplay(cur);
    this.createStatsDisplay(cur);
    this.createBottomControls();
    this.setupKeyboard();
    this.viewUser();
  }

  update(): void {
    if (!this.isNewPlayerCard) {
      const cur = gameState.getPlayer(this.curUserIndex);
      if (cur && this.htmlInput) {
        cur.nameplayer = this.htmlInput.value;
      }
    }
  }

  private pauseGame(): void {
    gameState.flags.globalPause = true;
    if (!gameState.settings.playerRaceOnBoard) {
      gameState.flags.diceAnimating = false;
    }
  }

  private goBack(): void {
    SaveManager.save(gameState);
    this.scene.start('Game');
  }

  private createButton(
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

  private createMedalsDisplay(player: PlayerData): void {
    const cx = this.cameras.main.centerX;
    this.add.text(cx, 360, 'Medals', { ...UI.TEXT_STYLE, fontStyle: 'bold' }).setOrigin(0.5);

    this.add.sprite(342, 390, 'Pos1S').setOrigin(0, 0);
    this.txtPos1 = this.add.text(412, 405, `X ${player.medalsPos1}`, UI.TEXT_STYLE_30);
    this.add.sprite(482, 390, 'Pos2S').setOrigin(0, 0);
    this.txtPos2 = this.add.text(552, 405, `X ${player.medalsPos2}`, UI.TEXT_STYLE_30);
    this.add.sprite(622, 390, 'Pos3S').setOrigin(0, 0);
    this.txtPos3 = this.add.text(692, 405, `X ${player.medalsPos3}`, UI.TEXT_STYLE_30);
    this.add.sprite(270, 460, 'TopSpeedS').setOrigin(0, 0);
    this.txtTopSpeed = this.add.text(340, 475, `X ${player.medalsfastPlayer}`, UI.TEXT_STYLE_30);
    this.add.sprite(410, 460, 'HorribleS').setOrigin(0, 0);
    this.txtHorrible = this.add.text(
      480,
      475,
      `X ${player.medalshorriblePlayer}`,
      UI.TEXT_STYLE_30,
    );
    this.add.sprite(550, 460, 'DesperateS').setOrigin(0, 0);
    this.txtDesperate = this.add.text(
      620,
      475,
      `X ${player.medalsbreakingPlayer}`,
      UI.TEXT_STYLE_30,
    );
    this.add.sprite(690, 460, 'LoserS').setOrigin(0, 0);
    this.txtLoser = this.add.text(760, 475, `X ${player.medalsloserPlayer}`, UI.TEXT_STYLE_30);
  }

  private createStatsDisplay(player: PlayerData): void {
    const x1 = 220;
    const y1 = MENU.SPRITE_PLAYER_Y + 150;
    this.txtPos = this.add.text(x1, y1, `Pos: ${player.posInGame}`, UI.TEXT_STYLE_30);
    this.txtLap = this.add.text(x1 + 120, y1, `Lap: ${player.lap}`, UI.TEXT_STYLE_30);
    this.txtTS = this.add.text(x1 + 250, y1, `Top Speed: ${player.maxTon}`, UI.TEXT_STYLE_30);
    this.txtHor = this.add.text(x1 + 460, y1, `Horrible: ${player.sumBreak}`, UI.TEXT_STYLE_30);

    const x2 = 270;
    const y2 = MENU.SPRITE_PLAYER_Y + 210;
    this.txtDes = this.add.text(x2, y2, `Desperate: ${player.sumStopz}`, UI.TEXT_STYLE_30);
    this.txtLos = this.add.text(x2 + 220, y2, `Loser: ${player.sumLoser}`, UI.TEXT_STYLE_30);
    this.txtSteps = this.add.text(
      x2 + 380,
      y2,
      `Steps: ${player.sumStep} (${player.sumAllStep})`,
      UI.TEXT_STYLE_30,
    );
  }

  private createBottomControls(): void {
    // Add/Delete button
    this.btnAddDelSprite = this.add
      .sprite(MENU.SPRITE_PLAYER_X - 220, MENU.SPRITE_PLAYER_Y + 80, 'btnAddDelS')
      .setOrigin(0.5)
      .setInteractive();
    this.btnAddDelSprite.on('pointerdown', () => this.playerAddDel());
    this.btnAddDelSprite.on('pointerover', () => this.btnAddDelSprite.setScale(1.2));
    this.btnAddDelSprite.on('pointerout', () => this.btnAddDelSprite.setScale(1));

    const line3X = 260;
    const line3Y = MENU.SPRITE_PLAYER_Y + 540;

    // Hardcore toggle
    this.btnHardcoreSprite = this.add
      .sprite(line3X + 580, line3Y, 'hardcoreS')
      .setOrigin(0.5)
      .setInteractive();
    this.btnHardcoreSprite.setFrame(gameState.flags.hardcoreEnabled ? 0 : 1);
    this.btnHardcoreSprite.on('pointerdown', () => this.toggleHardcore());
    this.btnHardcoreSprite.on('pointerover', () => this.btnHardcoreSprite.setScale(1.2));
    this.btnHardcoreSprite.on('pointerout', () => this.btnHardcoreSprite.setScale(1));

    // Laps
    this.txtLaps = this.add.text(line3X + 250, line3Y - 25, `Laps: ${gameState.settings.laps}`, {
      fontFamily: 'Eras Bold ITC',
      fontSize: '38px',
      color: '#000000',
      fontStyle: 'bold',
    });

    this.minusSprite = this.createButton(line3X + 210, line3Y, 'minusS', () => this.delLap());
    this.plusSprite = this.createButton(line3X + 450, line3Y, 'plusS', () => this.addLap());

    // New game
    this.createButton(line3X, line3Y, 'newgameS', () => this.stopGame());
  }

  private setupKeyboard(): void {
    this.input.keyboard!.on('keydown-ESC', () => this.goBack());
    this.input.keyboard!.on('keydown-Q', () => this.goBack());
    this.input.keyboard!.on('keydown-RIGHT', () => this.viewUserNext());
    this.input.keyboard!.on('keydown-LEFT', () => this.viewUserPrevious());
    this.input.keyboard!.on('keydown-A', () => this.toggleRobot());
    this.input.keyboard!.on('keydown-N', () => this.stopGame());
    this.input.keyboard!.on('keydown-H', () => this.toggleHardcore());
    this.input.keyboard!.on('keydown-UP', () => this.addLap());
    this.input.keyboard!.on('keydown-DOWN', () => this.delLap());
  }

  // ==================== NAVIGATION ====================

  private viewUserNext(): void {
    if (this.curUserIndexTmp > this.curUserIndex) {
      this.curUserIndexTmp = -1;
      this.curUserIndex = -1;
    }
    if (this.curUserIndexTmp < this.curUserIndex) {
      this.curUserIndex = this.curUserIndexTmp;
    }

    const count = gameState.getPlayerCount();
    if (this.curUserIndex + 1 < count) {
      this.curUserIndex++;
      this.curUserIndexTmp++;
      this.isNewPlayerCard = false;
      this.viewUser();
    } else {
      if (count < GAMEPLAY.MAX_PLAYERS) {
        this.curUserIndexTmp++;
        this.addPlayerCard();
      } else {
        this.curUserIndexTmp = 0;
        this.curUserIndex = 0;
        this.isNewPlayerCard = false;
        this.viewUser();
      }
    }
  }

  private viewUserPrevious(): void {
    if (this.curUserIndexTmp < 0) {
      const count = gameState.getPlayerCount();
      this.curUserIndexTmp = count;
      this.curUserIndex = count;
    }
    if (this.curUserIndexTmp > this.curUserIndex) {
      this.curUserIndex = this.curUserIndexTmp;
    }

    if (this.curUserIndex - 1 >= 0) {
      this.curUserIndex--;
      this.curUserIndexTmp--;
      this.isNewPlayerCard = false;
      this.viewUser();
    } else {
      const count = gameState.getPlayerCount();
      if (count < GAMEPLAY.MAX_PLAYERS) {
        this.curUserIndexTmp--;
        this.addPlayerCard();
      } else {
        this.curUserIndexTmp = 11;
        this.curUserIndex = 11;
        this.isNewPlayerCard = false;
        this.viewUser();
      }
    }
  }

  private viewUser(): void {
    this.isNewPlayerCard = false;
    this.tmpSpriteUser.destroy();

    const player = gameState.getPlayer(this.curUserIndex);
    this.htmlInput.value = player.nameplayer;

    this.tmpSpriteUser = this.createButton(
      MENU.SPRITE_PLAYER_X,
      MENU.SPRITE_PLAYER_Y,
      player.namesprite,
      () => this.selectUserSprite(),
    );

    this.checkSprite.setFrame(player.robot ? 1 : 0);

    this.txtPos1.setText(`X ${player.medalsPos1}`);
    this.txtPos2.setText(`X ${player.medalsPos2}`);
    this.txtPos3.setText(`X ${player.medalsPos3}`);
    this.txtTopSpeed.setText(`X ${player.medalsfastPlayer}`);
    this.txtHorrible.setText(`X ${player.medalshorriblePlayer}`);
    this.txtDesperate.setText(`X ${player.medalsbreakingPlayer}`);
    this.txtLoser.setText(`X ${player.medalsloserPlayer}`);

    this.txtPos.setText(`Pos: ${player.posInGame}`);
    let lap = player.lap;
    if (gameState.isPlayerFinished(player)) lap--;
    this.txtLap.setText(`Lap: ${lap}`);
    this.txtTS.setText(`Top Speed: ${player.maxTon}`);
    this.txtHor.setText(`Horrible: ${player.sumBreak}`);
    this.txtDes.setText(`Desperate: ${player.sumStopz}`);
    this.txtLos.setText(`Loser: ${player.sumLoser}`);
    this.txtSteps.setText(`Steps: ${player.sumStep} (${player.sumAllStep})`);

    const count = gameState.getPlayerCount();
    const canDel = count > GAMEPLAY.MIN_PLAYERS && gameState.allowDel(player);
    if (canDel) {
      this.btnAddDelSprite.setInteractive();
      this.btnAddDelSprite.setAlpha(1);
      this.btnAddDelSprite.setFrame(1);
    } else {
      this.btnAddDelSprite.disableInteractive();
      this.btnAddDelSprite.setAlpha(0);
    }
  }

  private addPlayerCard(): void {
    this.isNewPlayerCard = true;
    this.tmpSpriteUser.destroy();
    this.htmlInput.value = 'new player';

    // Find first available token
    const count = gameState.getPlayerCount();
    let tokenKey = 'fishkaS1';
    for (let i = 1; i <= 12; i++) {
      const key = `fishkaS${i}`;
      let used = false;
      for (let z = 0; z < count; z++) {
        if (gameState.getPlayer(z).namesprite === key) {
          used = true;
          break;
        }
      }
      if (!used) {
        tokenKey = key;
        break;
      }
    }

    this.tmpSpriteUser = this.createButton(
      MENU.SPRITE_PLAYER_X,
      MENU.SPRITE_PLAYER_Y,
      tokenKey,
      () => this.selectUserSprite(),
    );
    this.checkSprite.setFrame(0);

    // Reset displayed stats to 0
    this.txtPos1.setText('X 0');
    this.txtPos2.setText('X 0');
    this.txtPos3.setText('X 0');
    this.txtTopSpeed.setText('X 0');
    this.txtHorrible.setText('X 0');
    this.txtDesperate.setText('X 0');
    this.txtLoser.setText('X 0');
    this.txtPos.setText('Pos: 0');
    this.txtLap.setText('Lap: 0');
    this.txtTS.setText('Top Speed: 0');
    this.txtHor.setText('Horrible: 0');
    this.txtDes.setText('Desperate: 0');
    this.txtLos.setText('Loser: 0');
    this.txtSteps.setText('Steps: 0');

    this.btnAddDelSprite.setInteractive();
    this.btnAddDelSprite.setAlpha(1);
    this.btnAddDelSprite.setFrame(0);
  }

  // ==================== PLAYER MANAGEMENT ====================

  private playerAddDel(): void {
    const isNew = this.curUserIndexTmp > this.curUserIndex || this.curUserIndexTmp < 0;
    if (isNew) {
      this.addNewPlayer();
    } else {
      this.delPlayer();
    }
  }

  private addNewPlayer(): void {
    const name = this.htmlInput.value || 'Player';
    const fishka = this.tmpSpriteUser.texture.key;
    const robot = this.checkSprite.frame.name === '1';

    gameState.addPlayer(fishka, robot, name);
    const count = gameState.getPlayerCount();
    this.curUserIndex = count - 1;
    this.curUserIndexTmp = count - 1;
    this.isNewPlayerCard = false;
    SaveManager.save(gameState);
    this.viewUser();
  }

  private delPlayer(): void {
    const indexCur = gameState.settings.curplayers;
    let indexMenu = this.curUserIndex;
    let count = gameState.getPlayerCount() - 1;
    const player = gameState.getPlayer(indexMenu);

    if (!gameState.allowDel(player)) return;

    gameState.removePlayer(indexMenu);
    count--;

    let newCurIndex = indexCur;
    if (indexMenu < indexCur) newCurIndex--;
    if (newCurIndex > count) newCurIndex = 0;
    if (indexMenu > count) indexMenu = 0;

    gameState.settings.curplayers = newCurIndex;
    this.curUserIndex = indexMenu;
    SaveManager.save(gameState);
    this.viewUser();
  }

  private toggleRobot(): void {
    const isNew = this.curUserIndexTmp > this.curUserIndex || this.curUserIndexTmp < 0;
    if (!isNew) {
      const player = gameState.getPlayer(this.curUserIndex);
      player.robot = !player.robot;
      this.checkSprite.setFrame(player.robot ? 1 : 0);
    } else {
      this.checkSprite.setFrame(this.checkSprite.frame.name === '0' ? 1 : 0);
    }
  }

  private selectUserSprite(): void {
    const count = gameState.getPlayerCount();
    if (count >= GAMEPLAY.MAX_PLAYERS) return;

    this.leftSprite.disableInteractive();
    this.rightSprite.disableInteractive();
    this.closeSprite.disableInteractive();

    this.fonSprite = this.add.sprite(0, 0, 'fonS').setOrigin(0, 0);
    this.groupFishki = this.add.group();

    const isNew = this.curUserIndexTmp > this.curUserIndex || this.curUserIndexTmp < 0;
    let posX = 70;
    let posY = 70;
    let nextLine = 0;

    for (let i = 1; i <= 12; i++) {
      const key = `fishkaS${i}`;
      let used = false;
      for (let z = 0; z < count; z++) {
        const p = gameState.getPlayer(z);
        if ((z !== this.curUserIndex || isNew) && p.namesprite === key) {
          used = true;
          break;
        }
      }

      if (!used) {
        nextLine++;
        const fishkaSprite = this.add
          .sprite(posX, posY, key)
          .setOrigin(0.5)
          .setScale(2)
          .setInteractive();
        fishkaSprite.on('pointerdown', () => this.selectFishka(fishkaSprite));
        fishkaSprite.on('pointerover', () => fishkaSprite.setScale(2.2));
        fishkaSprite.on('pointerout', () => fishkaSprite.setScale(2));
        this.groupFishki!.add(fishkaSprite);
        posX += 140;
      }

      if (nextLine === 4) {
        nextLine = 0;
        posX = 70;
        posY += 140;
      }
    }
  }

  private selectFishka(fishkaSprite: Phaser.GameObjects.Sprite): void {
    this.leftSprite.setInteractive();
    this.rightSprite.setInteractive();
    this.closeSprite.setInteractive();

    const isNew = this.curUserIndexTmp > this.curUserIndex || this.curUserIndexTmp < 0;
    const selectedKey = fishkaSprite.texture.key;

    this.groupFishki?.destroy(true);
    this.fonSprite?.destroy();
    this.fonSprite = null;
    this.groupFishki = null;

    if (!isNew) {
      const player = gameState.getPlayer(this.curUserIndex);
      player.namesprite = selectedKey;
      this.viewUser();
    } else {
      this.tmpSpriteUser.destroy();
      this.tmpSpriteUser = this.createButton(
        MENU.SPRITE_PLAYER_X,
        MENU.SPRITE_PLAYER_Y,
        selectedKey,
        () => this.selectUserSprite(),
      );
    }
  }

  // ==================== SETTINGS ====================

  private addLap(): void {
    if (gameState.settings.finishplayers.length === 0) {
      if (gameState.settings.laps < GAMEPLAY.MAX_LAPS) {
        gameState.settings.laps++;
      }
    }
    this.txtLaps.setText(`Laps: ${gameState.settings.laps}`);
  }

  private delLap(): void {
    let minLaps = 1;
    const count = gameState.getPlayerCount();
    for (let i = 0; i < count; i++) {
      const player = gameState.getPlayer(i);
      let playerLap = player.lap;
      if (gameState.isPlayerFinished(player)) playerLap--;
      if (playerLap > minLaps) minLaps = playerLap;
    }
    if (gameState.settings.laps > minLaps) {
      gameState.settings.laps--;
    }
    this.txtLaps.setText(`Laps: ${gameState.settings.laps}`);
  }

  private toggleHardcore(): void {
    gameState.flags.hardcoreEnabled = !gameState.flags.hardcoreEnabled;
    this.btnHardcoreSprite.setFrame(gameState.flags.hardcoreEnabled ? 0 : 1);
  }

  private stopGame(): void {
    gameState.flags.newGame = true;
    const count = gameState.getPlayerCount();
    for (let i = 0; i < count; i++) {
      const p = gameState.settings.players[i] as Player;
      if (p.reset) p.reset(true);
    }
    this.scene.start('Game');
  }
}
