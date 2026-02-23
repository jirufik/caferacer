export interface PlayerData {
  stopz: number;
  goz: number;
  posonboard: number;
  namesprite: string;
  robot: boolean;
  lap: number;
  nameplayer: string;
  sprite: Phaser.GameObjects.Sprite | null;
  posInGame: number;
  maxTon: number;
  sumLoser: number;
  sumStopz: number;
  sumBreak: number;
  sumStep: number;
  sumAllStep: number;
  medalsPos1: number;
  medalsPos2: number;
  medalsPos3: number;
  medalsfastPlayer: number;
  medalsbreakingPlayer: number;
  medalshorriblePlayer: number;
  medalsloserPlayer: number;
}

export interface GameSettings {
  laps: number;
  players: PlayerData[];
  curplayers: number;
  finishplayers: PlayerData[];
  playerRaceOnBoard: boolean;
}

export interface GameFlags {
  diceAnimating: boolean;
  gamePaused: boolean;
  nextPlayerTurn: boolean;
  gameFinished: boolean;
  soundEnabled: boolean;
  tokenAnimating: boolean;
  hardcoreEnabled: boolean;
  globalPause: boolean;
  newGame: boolean;
}

export interface BoardPosition {
  x: number;
  y: number;
}

export interface MedalDef {
  key: string;
  spriteKey: string;
  statKey: keyof PlayerData;
  label: string;
}

export interface SaveData {
  players: Array<{
    nameplayer: string;
    namesprite: string;
    robot: boolean;
    sumAllStep: number;
    medalsPos1: number;
    medalsPos2: number;
    medalsPos3: number;
    medalsfastPlayer: number;
    medalsbreakingPlayer: number;
    medalshorriblePlayer: number;
    medalsloserPlayer: number;
  }>;
  laps: number;
  hardcoreEnabled: boolean;
  soundEnabled: boolean;
}

export interface Caption {
  doljCap: string;
  nameCap: string;
}

export interface RuleSlide {
  spriteName: string;
}
