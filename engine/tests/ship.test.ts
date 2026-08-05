import { describe, it, expect } from 'vitest';
import { Ship } from '../src/ship';

describe('Ship', () => {
  it('computes horizontal coordinates from the origin', () => {
    const ship = new Ship('s1', 'Interceptor', 3, { row: 2, col: 4 }, 'horizontal');
    expect(ship.coordinates).toEqual([
      { row: 2, col: 4 },
      { row: 2, col: 5 },
      { row: 2, col: 6 },
    ]);
  });

  it('computes vertical coordinates from the origin', () => {
    const ship = new Ship('s1', 'Interceptor', 3, { row: 2, col: 4 }, 'vertical');
    expect(ship.coordinates).toEqual([
      { row: 2, col: 4 },
      { row: 3, col: 4 },
      { row: 4, col: 4 },
    ]);
  });

  it('registers a hit on a coordinate that belongs to the ship', () => {
    const ship = new Ship('s1', 'Interceptor', 2, { row: 0, col: 0 }, 'horizontal');
    expect(ship.registerHit(0, 0)).toBe(true);
  });

  it('does not register a hit on a coordinate outside the ship', () => {
    const ship = new Ship('s1', 'Interceptor', 2, { row: 0, col: 0 }, 'horizontal');
    expect(ship.registerHit(5, 5)).toBe(false);
  });

  it('is not sunk until every coordinate has been hit', () => {
    const ship = new Ship('s1', 'Interceptor', 2, { row: 0, col: 0 }, 'horizontal');
    ship.registerHit(0, 0);
    expect(ship.isSunk()).toBe(false);
  });

  it('is sunk once all coordinates have been hit', () => {
    const ship = new Ship('s1', 'Interceptor', 2, { row: 0, col: 0 }, 'horizontal');
    ship.registerHit(0, 0);
    ship.registerHit(0, 1);
    expect(ship.isSunk()).toBe(true);
  });

  it('does not double count repeated hits on the same coordinate', () => {
    const ship = new Ship('s1', 'Interceptor', 2, { row: 0, col: 0 }, 'horizontal');
    ship.registerHit(0, 0);
    ship.registerHit(0, 0);
    expect(ship.isSunk()).toBe(false);
  });
});
