import type { SaveData } from '../types/index.js';
import { GameState } from '../core/GameState.js';

const STORAGE_KEY = 'caferacer_data';

export class SaveManager {
  static save(state: GameState): void {
    const data: SaveData = {
      players: state.settings.players.map((p) => ({
        nameplayer: p.nameplayer,
        namesprite: p.namesprite,
        robot: p.robot,
        sumAllStep: p.sumAllStep,
        medalsPos1: p.medalsPos1,
        medalsPos2: p.medalsPos2,
        medalsPos3: p.medalsPos3,
        medalsfastPlayer: p.medalsfastPlayer,
        medalsbreakingPlayer: p.medalsbreakingPlayer,
        medalshorriblePlayer: p.medalshorriblePlayer,
        medalsloserPlayer: p.medalsloserPlayer,
      })),
      laps: state.settings.laps,
      hardcoreEnabled: state.flags.hardcoreEnabled,
      soundEnabled: state.flags.soundEnabled,
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      console.warn('Failed to save game data');
    }
  }

  static load(): SaveData | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  static clear(): void {
    localStorage.removeItem(STORAGE_KEY);
  }
}
