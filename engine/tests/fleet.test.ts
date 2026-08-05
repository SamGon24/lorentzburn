import { describe, it, expect } from 'vitest';
import { Board } from '../src/board';
import { Ship } from '../src/ship';
import { Fleet, FLEET_COMPOSITION, canPlaceShip } from '../src/fleet';

describe('canPlaceShip', () => {
  it('allows placement fully within bounds with no conflicts', () => {
    const board = new Board(10);
    const ship = new Ship('s1', 'Interceptor', 2, { row: 0, col: 0 }, 'horizontal');
    expect(canPlaceShip(board, ship, [])).toBe(true);
  });

  it('rejects placement that runs off the board', () => {
    const board = new Board(10);
    const ship = new Ship('s1', 'Interceptor', 3, { row: 0, col: 8 }, 'horizontal');
    expect(canPlaceShip(board, ship, [])).toBe(false);
  });

  it('rejects placement overlapping an existing ship', () => {
    const board = new Board(10);
    const existing = new Ship('s1', 'Interceptor', 2, { row: 0, col: 0 }, 'horizontal');
    const overlapping = new Ship('s2', 'Corvette', 3, { row: 0, col: 1 }, 'vertical');
    expect(canPlaceShip(board, overlapping, [existing])).toBe(false);
  });

  it('rejects placement directly adjacent to an existing ship', () => {
    const board = new Board(10);
    const existing = new Ship('s1', 'Interceptor', 2, { row: 0, col: 0 }, 'horizontal');
    const adjacent = new Ship('s2', 'Corvette', 3, { row: 1, col: 0 }, 'horizontal');
    expect(canPlaceShip(board, adjacent, [existing])).toBe(false);
  });

  it('rejects placement diagonally adjacent to an existing ship', () => {
    const board = new Board(10);
    const existing = new Ship('s1', 'Interceptor', 2, { row: 0, col: 0 }, 'horizontal');
    const diagonal = new Ship('s2', 'Corvette', 3, { row: 1, col: 2 }, 'vertical');
    expect(canPlaceShip(board, diagonal, [existing])).toBe(false);
  });

  it('allows placement with a gap between ships', () => {
    const board = new Board(10);
    const existing = new Ship('s1', 'Interceptor', 2, { row: 0, col: 0 }, 'horizontal');
    const farAway = new Ship('s2', 'Corvette', 3, { row: 2, col: 0 }, 'horizontal');
    expect(canPlaceShip(board, farAway, [existing])).toBe(true);
  });
});

describe('Fleet', () => {
  it('places a valid ship and returns it via getShips', () => {
    const board = new Board(10);
    const fleet = new Fleet(board);
    const ship = new Ship('s1', 'Interceptor', 2, { row: 0, col: 0 }, 'horizontal');
    fleet.placeShip(ship);
    expect(fleet.getShips()).toEqual([ship]);
  });

  it('throws when placing a ship with an invalid position', () => {
    const board = new Board(10);
    const fleet = new Fleet(board);
    const offBoard = new Ship('s1', 'Interceptor', 3, { row: 0, col: 8 }, 'horizontal');
    expect(() => fleet.placeShip(offBoard)).toThrow('Invalid placement for ship: Interceptor');
  });

  it('throws when placing a ship that overlaps an already-placed ship', () => {
    const board = new Board(10);
    const fleet = new Fleet(board);
    fleet.placeShip(new Ship('s1', 'Interceptor', 2, { row: 0, col: 0 }, 'horizontal'));
    const overlapping = new Ship('s2', 'Corvette', 3, { row: 0, col: 1 }, 'vertical');
    expect(() => fleet.placeShip(overlapping)).toThrow();
  });

  it('is not fully placed until every ship in the composition is placed', () => {
    const board = new Board(10);
    const fleet = new Fleet(board);
    fleet.placeShip(new Ship('s1', 'Interceptor', 2, { row: 0, col: 0 }, 'horizontal'));
    expect(fleet.isFullyPlaced()).toBe(false);
  });

  it('is fully placed once all ships in FLEET_COMPOSITION are placed', () => {
    const board = new Board(10);
    const fleet = new Fleet(board);
    let row = 0;
    for (const spec of FLEET_COMPOSITION) {
      fleet.placeShip(new Ship(spec.name, spec.name, spec.size, { row, col: 0 }, 'horizontal'));
      row += 2;
    }
    expect(fleet.isFullyPlaced()).toBe(true);
  });

  it('is not all sunk when no ships have been hit', () => {
    const board = new Board(10);
    const fleet = new Fleet(board);
    fleet.placeShip(new Ship('s1', 'Interceptor', 2, { row: 0, col: 0 }, 'horizontal'));
    expect(fleet.allSunk()).toBe(false);
  });

  it('is all sunk once every placed ship is sunk', () => {
    const board = new Board(10);
    const fleet = new Fleet(board);
    const ship = new Ship('s1', 'Interceptor', 2, { row: 0, col: 0 }, 'horizontal');
    fleet.placeShip(ship);
    ship.registerHit(0, 0);
    ship.registerHit(0, 1);
    expect(fleet.allSunk()).toBe(true);
  });

  it('treats an empty fleet as all sunk', () => {
    const board = new Board(10);
    const fleet = new Fleet(board);
    expect(fleet.allSunk()).toBe(true);
  });
});
