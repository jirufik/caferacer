import { describe, it, expect } from 'vitest';
import { shuffle } from '../utils/helpers.js';

describe('shuffle', () => {
  it('should return array with same length', () => {
    const arr = [1, 2, 3, 4, 5];
    const result = shuffle([...arr]);
    expect(result).toHaveLength(arr.length);
  });

  it('should contain all original elements', () => {
    const arr = [1, 2, 3, 4, 5];
    const result = shuffle([...arr]);
    expect(result.sort()).toEqual(arr.sort());
  });

  it('should handle empty array', () => {
    expect(shuffle([])).toEqual([]);
  });

  it('should handle single element', () => {
    expect(shuffle([42])).toEqual([42]);
  });

  it('should mutate the original array', () => {
    const arr = [1, 2, 3];
    const result = shuffle(arr);
    expect(result).toBe(arr);
  });
});
