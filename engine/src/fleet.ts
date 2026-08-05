import { Board } from './board';
import { Ship, ShipCoordinate } from './ship';

export const FLEET_COMPOSITION = [
  { name: 'Dreadnought', size: 5 },
  { name: 'Cruiser', size: 4 },
  { name: 'Frigate', size: 3 },
  { name: 'Corvette', size: 3 },
  { name: 'Interceptor', size: 2 },
];

// returns the 8 surrounding cells of a coordinate, used to enforce spacing between ships
function getNeighbors(coord: ShipCoordinate): ShipCoordinate[] {
  const neighbors: ShipCoordinate[] = [];
  for (let dRow = -1; dRow <= 1; dRow++) {
    for (let dCol = -1; dCol <= 1; dCol++) {
      if (dRow === 0 && dCol === 0) continue;
      neighbors.push({ row: coord.row + dRow, col: coord.col + dCol });
    }
  }
  return neighbors;
}

// true if every cell of the ship is in bounds, unoccupied, and not adjacent to another ship
export function canPlaceShip(
  board: Board,
  ship: Ship,
  existingShips: Ship[]
): boolean {
  for (const coord of ship.coordinates) {
    if (!board.isInBounds(coord.row, coord.col)) {
      return false;
    }

    const occupiesCell = (row: number, col: number) =>
      existingShips.some((other) =>
        other.coordinates.some((c) => c.row === row && c.col === col)
      );

    if (occupiesCell(coord.row, coord.col)) {
      return false;
    }

    const neighbors = getNeighbors(coord);
    for (const n of neighbors) {
      if (occupiesCell(n.row, n.col)) {
        return false;
      }
    }
  }
  return true;
}

export class Fleet {
  private board: Board;
  private ships: Ship[]; // ships placed so far

  constructor(board: Board) {
    this.board = board;
    this.ships = [];
  }

  // validates and adds a ship to the fleet, throws if the placement is invalid
  placeShip(ship: Ship): void {
    if (!canPlaceShip(this.board, ship, this.ships)) {
      throw new Error(`Invalid placement for ship: ${ship.name}`);
    }
    this.ships.push(ship);
  }

  // read-only view of the placed ships
  getShips(): ReadonlyArray<Ship> {
    return this.ships;
  }

  // whether every ship in FLEET_COMPOSITION has been placed
  isFullyPlaced(): boolean {
    return this.ships.length === FLEET_COMPOSITION.length;
  }

  // whether every placed ship has been sunk
  allSunk(): boolean {
    return this.ships.every((ship) => ship.isSunk());
  }
}