import type { GameSettings, GameFlags, PlayerData } from '../types/index.js';
import { Player } from '../entities/Player.js';
import { Dice } from '../entities/Dice.js';
import { DICE_CONFIG } from '../config/gameConfig.js';

export class GameState {
  settings: GameSettings = {
    laps: 1,
    players: [],
    curplayers: 0,
    finishplayers: [],
    playerRaceOnBoard: false,
  };

  flags: GameFlags = {
    diceAnimating: false,
    gamePaused: false,
    nextPlayerTurn: false,
    gameFinished: false,
    soundEnabled: true,
    tokenAnimating: false,
    hardcoreEnabled: true,
    globalPause: false,
    newGame: true,
  };

  diceResults = { q1: 1, q2: 1, q3: 1 };

  dice1 = new Dice(DICE_CONFIG.DICE_1_SIDES as unknown as number[]);
  dice2 = new Dice(DICE_CONFIG.DICE_2_SIDES as unknown as number[]);
  dice3 = new Dice(DICE_CONFIG.DICE_3_SIDES as unknown as number[]);

  getCurrentPlayer(): PlayerData {
    return this.settings.players[this.settings.curplayers];
  }

  getPlayer(index?: number): PlayerData {
    if (index !== undefined && index >= 0 && index < this.settings.players.length) {
      return this.settings.players[index];
    }
    return this.settings.players[this.settings.curplayers];
  }

  getPlayerCount(): number {
    return this.settings.players.length;
  }

  isPlayerFinished(player: PlayerData): boolean {
    return this.settings.finishplayers.includes(player);
  }

  addPlayer(namesprite: string, robot: boolean, nameplayer: string): void {
    const player = new Player(namesprite, robot, nameplayer);
    this.settings.players.push(player);
  }

  removePlayer(index: number): void {
    this.settings.players.splice(index, 1);
  }

  createDefaultPlayers(): void {
    this.settings.players = [];
    this.settings.finishplayers = [];
    this.addPlayer('fishkaS1', false, 'You');
    this.addPlayer('fishkaS3', true, 'Player1');
    this.addPlayer('fishkaS2', true, 'Player2');
  }

  resetForNewGame(): void {
    const count = this.getPlayerCount();
    for (let i = 0; i < count; i++) {
      const p = this.settings.players[i] as Player;
      if (p.reset) p.reset(this.flags.newGame);
    }
    this.settings.curplayers = 0;
    this.settings.finishplayers = [];
    this.flags.nextPlayerTurn = false;
    this.flags.gamePaused = false;
  }

  allowDel(player: PlayerData): boolean {
    if (this.flags.newGame) return true;
    if (this.flags.gameFinished) return true;
    if (!this.isPlayerFinished(player)) return true;
    return false;
  }
}

export const gameState = new GameState();
