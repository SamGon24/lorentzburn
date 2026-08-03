export type Orientation = 'horizontal' | 'vertical';

export interface ShipCoordinate {
  row: number;
  col: number;
}

export class Ship {
  readonly id: string;
  readonly name: string;
  readonly size: number;
  readonly orientation: Orientation;
  readonly coordinates: ShipCoordinate[];
  private hits: Set<string>;

  constructor(
    id: string,
    name: string,
    size: number,
    origin: ShipCoordinate,
    orientation: Orientation
  ) {
    this.id = id;
    this.name = name;
    this.size = size;
    this.orientation = orientation;
    this.coordinates = this.computeCoordinates(origin);
    this.hits = new Set();
  }

  private computeCoordinates(origin: ShipCoordinate): ShipCoordinate[] {
    const coords: ShipCoordinate[] = [];
    for (let i = 0; i < this.size; i++) {
      coords.push(
        this.orientation === 'horizontal'
          ? { row: origin.row, col: origin.col + i }
          : { row: origin.row + i, col: origin.col }
      );
    }
    return coords;
  }

  registerHit(row: number, col: number): boolean {
    const key = `${row},${col}`;
    const isPartOfShip = this.coordinates.some((c) => c.row === row && c.col === col);
    if (isPartOfShip) {
      this.hits.add(key);
      return true;
    }
    return false;
  }

  isSunk(): boolean {
    return this.hits.size === this.size;
  }
}