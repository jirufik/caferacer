export class Dice {
  private sides: number[];

  constructor(sides: number[] = [1, 2, 3, 4, 5, 6]) {
    this.sides = sides;
  }

  roll(): number {
    return this.sides[Math.floor(Math.random() * this.sides.length)];
  }
}
