import type { PlayerData } from '../types/index.js';
import { GameState } from '../core/GameState.js';
import { Board } from '../entities/Board.js';

export class AIController {
  static decide(player: PlayerData, state: GameState): 'roll' | 'race' {
    const { laps } = state.settings;

    // If last lap and can finish — race
    if (laps === player.lap && player.posonboard !== Board.CELLS) {
      if (player.goz + player.posonboard >= Board.CELLS) {
        return 'race';
      }
    }

    // If can bump an opponent — race
    if (state.flags.hardcoreEnabled && player.goz > 0) {
      if (!state.isPlayerFinished(player)) {
        const targetPos = player.posonboard + player.goz;
        const count = state.getPlayerCount();
        for (let i = 0; i < count; i++) {
          const other = state.getPlayer(i);
          if (other.posonboard === targetPos && i !== state.settings.curplayers) {
            if (!state.isPlayerFinished(other)) {
              // If many players and target is on first lap near start, skip
              if (count > 5 && other.lap === 1 && other.posonboard < 9) {
                continue;
              }
              return 'race';
            }
          }
        }
      }
    }

    // If 3+ overheats and has tonnage — race
    if (player.stopz >= 3 && player.goz > 0) {
      return 'race';
    }

    return 'roll';
  }
}
