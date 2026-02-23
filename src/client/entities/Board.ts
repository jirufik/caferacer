import type { BoardPosition } from '../types/index.js';

export class Board {
  static readonly CELLS = 36;
  static readonly START: BoardPosition = { x: 286, y: 580 };
  static readonly FINISH: BoardPosition = { x: 286, y: 180 };

  static getPosition(cellIndex: number): BoardPosition {
    let x = 298;
    let y = 580;

    if (cellIndex === 0) {
      return { x, y };
    }

    let pos = 0;
    while (pos < cellIndex) {
      if (pos === 0) {
        y += 80;
      } else if (pos >= 1 && pos <= 4) {
        x -= 72;
      } else if (pos >= 5 && pos <= 13) {
        y -= 72;
      } else if (pos >= 14 && pos <= 22) {
        x += 72;
      } else if (pos >= 23 && pos <= 31) {
        y += 72;
      } else if (pos >= 32 && pos <= 36) {
        x -= 72;
      }
      pos++;
    }

    return { x, y };
  }

  static getMoveOffset(cellIndex: number): BoardPosition {
    if (cellIndex === 0) {
      return { x: 0, y: 80 };
    } else if (cellIndex >= 1 && cellIndex <= 4) {
      return { x: -72, y: 0 };
    } else if (cellIndex >= 5 && cellIndex <= 13) {
      return { x: 0, y: -72 };
    } else if (cellIndex >= 14 && cellIndex <= 22) {
      return { x: 72, y: 0 };
    } else if (cellIndex >= 23 && cellIndex <= 31) {
      return { x: 0, y: 72 };
    } else if (cellIndex >= 32 && cellIndex <= 36) {
      return { x: -72, y: 0 };
    }
    return { x: 0, y: 0 };
  }
}
