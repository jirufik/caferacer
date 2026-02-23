import { describe, it, expect } from 'vitest';
import { Dice } from '../entities/Dice.js';

describe('Dice', () => {
  it('should return values from provided sides', () => {
    const dice = new Dice([1, 1, 1]);
    expect(dice.roll()).toBe(1);
  });

  it('should only return values within provided sides', () => {
    const sides = [0, 1];
    const dice = new Dice(sides);
    for (let i = 0; i < 100; i++) {
      expect(sides).toContain(dice.roll());
    }
  });

  it('should use default 1-6 sides when none provided', () => {
    const dice = new Dice();
    for (let i = 0; i < 100; i++) {
      const val = dice.roll();
      expect(val).toBeGreaterThanOrEqual(1);
      expect(val).toBeLessThanOrEqual(6);
    }
  });

  it('should handle single-sided dice', () => {
    const dice = new Dice([42]);
    expect(dice.roll()).toBe(42);
  });
});
