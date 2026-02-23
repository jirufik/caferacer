import { describe, it, expect } from 'vitest';
import { Player } from '../entities/Player.js';

describe('Player', () => {
  it('should create with correct defaults', () => {
    const p = new Player('fishkaS1', false, 'TestPlayer');
    expect(p.namesprite).toBe('fishkaS1');
    expect(p.robot).toBe(false);
    expect(p.nameplayer).toBe('TestPlayer');
    expect(p.stopz).toBe(0);
    expect(p.goz).toBe(0);
    expect(p.posonboard).toBe(0);
    expect(p.lap).toBe(1);
    expect(p.medalsPos1).toBe(0);
  });

  it('should reset game stats without medals on partial reset', () => {
    const p = new Player('fishkaS1', true, 'Bot');
    p.stopz = 3;
    p.goz = 5;
    p.posonboard = 10;
    p.lap = 2;
    p.medalsPos1 = 5;
    p.sumAllStep = 100;

    p.reset(false);

    expect(p.stopz).toBe(0);
    expect(p.goz).toBe(0);
    expect(p.posonboard).toBe(0);
    expect(p.lap).toBe(1);
    expect(p.medalsPos1).toBe(5);
    expect(p.sumAllStep).toBe(100);
  });

  it('should reset everything including medals on full reset', () => {
    const p = new Player('fishkaS1', true, 'Bot');
    p.medalsPos1 = 5;
    p.medalsPos2 = 3;
    p.sumAllStep = 100;
    p.medalsfastPlayer = 2;

    p.reset(true);

    expect(p.medalsPos1).toBe(0);
    expect(p.medalsPos2).toBe(0);
    expect(p.sumAllStep).toBe(0);
    expect(p.medalsfastPlayer).toBe(0);
  });

  it('should send player to cafe (position 0, increment loser)', () => {
    const p = new Player('fishkaS1', false, 'Test');
    p.posonboard = 15;
    p.sumLoser = 0;

    p.sendToCafe();

    expect(p.posonboard).toBe(0);
    expect(p.sumLoser).toBe(1);
  });
});
