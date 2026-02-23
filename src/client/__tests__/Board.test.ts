import { describe, it, expect } from 'vitest';
import { Board } from '../entities/Board.js';

describe('Board', () => {
  it('should have 36 cells', () => {
    expect(Board.CELLS).toBe(36);
  });

  it('should return starting position for cell 0', () => {
    const pos = Board.getPosition(0);
    expect(pos).toEqual({ x: 298, y: 580 });
  });

  it('should move down for cell 0 offset (to cafe row)', () => {
    const offset = Board.getMoveOffset(0);
    expect(offset).toEqual({ x: 0, y: 80 });
  });

  it('should move left for cells 1-4', () => {
    for (let i = 1; i <= 4; i++) {
      const offset = Board.getMoveOffset(i);
      expect(offset).toEqual({ x: -72, y: 0 });
    }
  });

  it('should move up for cells 5-13', () => {
    for (let i = 5; i <= 13; i++) {
      const offset = Board.getMoveOffset(i);
      expect(offset).toEqual({ x: 0, y: -72 });
    }
  });

  it('should move right for cells 14-22', () => {
    for (let i = 14; i <= 22; i++) {
      const offset = Board.getMoveOffset(i);
      expect(offset).toEqual({ x: 72, y: 0 });
    }
  });

  it('should move down for cells 23-31', () => {
    for (let i = 23; i <= 31; i++) {
      const offset = Board.getMoveOffset(i);
      expect(offset).toEqual({ x: 0, y: 72 });
    }
  });

  it('should move left for cells 32-36', () => {
    for (let i = 32; i <= 36; i++) {
      const offset = Board.getMoveOffset(i);
      expect(offset).toEqual({ x: -72, y: 0 });
    }
  });

  it('should return (0,0) for out-of-range cell', () => {
    const offset = Board.getMoveOffset(37);
    expect(offset).toEqual({ x: 0, y: 0 });
  });

  it('should calculate positions consistently', () => {
    // Cells 1-4 go left, so x should decrease
    const pos1 = Board.getPosition(1);
    const pos4 = Board.getPosition(4);
    expect(pos4.x).toBeLessThan(pos1.x);
  });
});
