import { describe, it, expect, beforeEach } from 'vitest';
import { GameState } from '../core/GameState.js';

describe('GameState', () => {
  let state: GameState;

  beforeEach(() => {
    state = new GameState();
  });

  it('should start with default settings', () => {
    expect(state.settings.laps).toBe(1);
    expect(state.settings.players).toEqual([]);
    expect(state.settings.curplayers).toBe(0);
  });

  it('should start with default flags', () => {
    expect(state.flags.soundEnabled).toBe(true);
    expect(state.flags.hardcoreEnabled).toBe(true);
    expect(state.flags.newGame).toBe(true);
  });

  it('should add a player', () => {
    state.addPlayer('fishkaS1', false, 'Test');
    expect(state.getPlayerCount()).toBe(1);
    expect(state.getPlayer(0).nameplayer).toBe('Test');
  });

  it('should remove a player', () => {
    state.addPlayer('fishkaS1', false, 'A');
    state.addPlayer('fishkaS2', true, 'B');
    state.removePlayer(0);
    expect(state.getPlayerCount()).toBe(1);
    expect(state.getPlayer(0).nameplayer).toBe('B');
  });

  it('should create default players (3 players)', () => {
    state.createDefaultPlayers();
    expect(state.getPlayerCount()).toBe(3);
    expect(state.getPlayer(0).robot).toBe(false);
    expect(state.getPlayer(1).robot).toBe(true);
    expect(state.getPlayer(2).robot).toBe(true);
  });

  it('should get current player', () => {
    state.createDefaultPlayers();
    state.settings.curplayers = 1;
    expect(state.getCurrentPlayer().nameplayer).toBe('Player1');
  });

  it('should track finished players', () => {
    state.createDefaultPlayers();
    const p = state.getPlayer(0);
    expect(state.isPlayerFinished(p)).toBe(false);
    state.settings.finishplayers.push(p);
    expect(state.isPlayerFinished(p)).toBe(true);
  });

  it('should reset for new game', () => {
    state.createDefaultPlayers();
    state.settings.curplayers = 2;
    const p = state.getPlayer(0);
    state.settings.finishplayers.push(p);
    state.flags.nextPlayerTurn = true;

    state.resetForNewGame();

    expect(state.settings.curplayers).toBe(0);
    expect(state.settings.finishplayers).toEqual([]);
    expect(state.flags.nextPlayerTurn).toBe(false);
  });

  it('should allow delete during new game', () => {
    state.createDefaultPlayers();
    state.flags.newGame = true;
    expect(state.allowDel(state.getPlayer(0))).toBe(true);
  });

  it('should allow delete for unfinished player', () => {
    state.createDefaultPlayers();
    state.flags.newGame = false;
    state.flags.gameFinished = false;
    expect(state.allowDel(state.getPlayer(0))).toBe(true);
  });

  it('should not allow delete for finished player during game', () => {
    state.createDefaultPlayers();
    state.flags.newGame = false;
    state.flags.gameFinished = false;
    const p = state.getPlayer(0);
    state.settings.finishplayers.push(p);
    expect(state.allowDel(p)).toBe(false);
  });
});
