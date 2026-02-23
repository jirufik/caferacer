import type { PlayerData } from '../types/index.js';

export class Player implements PlayerData {
  stopz = 0;
  goz = 0;
  posonboard = 0;
  namesprite: string;
  robot: boolean;
  lap = 1;
  nameplayer: string;
  sprite: Phaser.GameObjects.Sprite | null = null;
  posInGame = 0;
  maxTon = 0;
  sumLoser = 0;
  sumStopz = 0;
  sumBreak = 0;
  sumStep = 0;
  sumAllStep = 0;
  medalsPos1 = 0;
  medalsPos2 = 0;
  medalsPos3 = 0;
  medalsfastPlayer = 0;
  medalsbreakingPlayer = 0;
  medalshorriblePlayer = 0;
  medalsloserPlayer = 0;

  constructor(namesprite: string, robot: boolean, nameplayer: string) {
    this.namesprite = namesprite;
    this.robot = robot;
    this.nameplayer = nameplayer;
  }

  reset(fullReset: boolean = false): void {
    this.stopz = 0;
    this.goz = 0;
    this.posonboard = 0;
    this.lap = 1;
    this.posInGame = 0;
    this.maxTon = 0;
    this.sumLoser = 0;
    this.sumStopz = 0;
    this.sumBreak = 0;
    this.sumStep = 0;
    if (fullReset) {
      this.sumAllStep = 0;
      this.medalsPos1 = 0;
      this.medalsPos2 = 0;
      this.medalsPos3 = 0;
      this.medalsfastPlayer = 0;
      this.medalsbreakingPlayer = 0;
      this.medalshorriblePlayer = 0;
      this.medalsloserPlayer = 0;
    }
  }

  sendToCafe(): void {
    this.posonboard = 0;
    this.sumLoser++;
  }
}
