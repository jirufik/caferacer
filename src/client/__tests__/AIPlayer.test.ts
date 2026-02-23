import { describe, it, expect, beforeEach } from 'vitest';
import { AIController } from '../ai/AIPlayer.js';
import { GameState } from '../core/GameState.js';

describe('AIController', () => {
  let state: GameState;

  beforeEach(() => {
    state = new GameState();
    state.createDefaultPlayers();
  });

  it('should roll by default', () => {
    const player = state.getPlayer(0);
    expect(AIController.decide(player, state)).toBe('roll');
  });

  it('should race if can finish on last lap', () => {
    state.settings.laps = 1;
    const player = state.getPlayer(0);
    player.lap = 1;
    player.posonboard = 30;
    player.goz = 6;

    expect(AIController.decide(player, state)).toBe('race');
  });

  it('should not race if cannot finish on last lap', () => {
    state.settings.laps = 1;
    const player = state.getPlayer(0);
    player.lap = 1;
    player.posonboard = 10;
    player.goz = 3;

    expect(AIController.decide(player, state)).toBe('roll');
  });

  it('should race if can bump opponent in hardcore mode', () => {
    state.flags.hardcoreEnabled = true;
    state.settings.curplayers = 0;
    const player = state.getPlayer(0);
    player.posonboard = 5;
    player.goz = 3;

    const opponent = state.getPlayer(1);
    opponent.posonboard = 8; // player.posonboard + player.goz

    expect(AIController.decide(player, state)).toBe('race');
  });

  it('should not bump in non-hardcore mode', () => {
    state.flags.hardcoreEnabled = false;
    state.settings.curplayers = 0;
    const player = state.getPlayer(0);
    player.posonboard = 5;
    player.goz = 3;

    const opponent = state.getPlayer(1);
    opponent.posonboard = 8;

    expect(AIController.decide(player, state)).toBe('roll');
  });

  it('should race if 3+ overheats and has tonnage', () => {
    const player = state.getPlayer(0);
    player.stopz = 3;
    player.goz = 2;

    expect(AIController.decide(player, state)).toBe('race');
  });

  it('should roll if 3+ overheats but no tonnage', () => {
    const player = state.getPlayer(0);
    player.stopz = 3;
    player.goz = 0;

    expect(AIController.decide(player, state)).toBe('roll');
  });

  it('should skip bumping near-start players in large games', () => {
    // Add extra players to have > 5
    for (let i = 0; i < 4; i++) {
      state.addPlayer(`fishkaS${i + 4}`, true, `Extra${i}`);
    }
    state.flags.hardcoreEnabled = true;
    state.settings.curplayers = 0;
    const player = state.getPlayer(0);
    player.posonboard = 5;
    player.goz = 3;

    const opponent = state.getPlayer(1);
    opponent.posonboard = 8;
    opponent.lap = 1;

    expect(AIController.decide(player, state)).toBe('roll');
  });
});
