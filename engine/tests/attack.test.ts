import { describe, it, expect } from 'vitest';
import { Board, CellStatus } from '../src/board';
import { Ship } from '../src/ship';
import { Fleet } from '../src/fleet';
import { resolveAttack } from '../src/attack';

function setup() {
  const board = new Board(10);
  const fleet = new Fleet(board);
  const interceptor = new Ship('s1', 'Interceptor', 2, { row: 0, col: 0 }, 'horizontal');
  fleet.placeShip(interceptor);
  return { board, fleet, interceptor };
}

describe('resolveAttack', () => {
  it('records a miss on a cell with no ship', () => {
    const { board, fleet } = setup();
    const outcome = resolveAttack(board, fleet, 5, 5);
    expect(outcome).toEqual({ result: 'miss', gameOver: false });
    expect(board.getCell(5, 5).status).toBe(CellStatus.Miss);
  });

  it('records a hit on a ship cell that is not yet sunk', () => {
    const { board, fleet } = setup();
    const outcome = resolveAttack(board, fleet, 0, 0);
    expect(outcome).toEqual({ result: 'hit', shipName: undefined, gameOver: false });
    expect(board.getCell(0, 0).status).toBe(CellStatus.Hit);
  });

  it('reports sunk with the ship name once the last cell is hit', () => {
    const { board, fleet } = setup();
    resolveAttack(board, fleet, 0, 0);
    const outcome = resolveAttack(board, fleet, 0, 1);
    expect(outcome).toEqual({ result: 'sunk', shipName: 'Interceptor', gameOver: true });
  });

  it('reports game over only when every ship in the fleet is sunk', () => {
    const board = new Board(10);
    const fleet = new Fleet(board);
    fleet.placeShip(new Ship('s1', 'Interceptor', 2, { row: 0, col: 0 }, 'horizontal'));
    fleet.placeShip(new Ship('s2', 'Corvette', 2, { row: 5, col: 5 }, 'horizontal'));

    resolveAttack(board, fleet, 0, 0);
    const firstSunk = resolveAttack(board, fleet, 0, 1);
    expect(firstSunk).toEqual({ result: 'sunk', shipName: 'Interceptor', gameOver: false });

    resolveAttack(board, fleet, 5, 5);
    const secondSunk = resolveAttack(board, fleet, 5, 6);
    expect(secondSunk).toEqual({ result: 'sunk', shipName: 'Corvette', gameOver: true });
  });

  it('returns already-attacked for a cell that was previously hit', () => {
    const { board, fleet } = setup();
    resolveAttack(board, fleet, 0, 0);
    const outcome = resolveAttack(board, fleet, 0, 0);
    expect(outcome).toEqual({ result: 'already-attacked', gameOver: false });
  });

  it('returns already-attacked for a cell that was previously missed', () => {
    const { board, fleet } = setup();
    resolveAttack(board, fleet, 5, 5);
    const outcome = resolveAttack(board, fleet, 5, 5);
    expect(outcome).toEqual({ result: 'already-attacked', gameOver: false });
  });

  it('propagates out-of-bounds errors from the board', () => {
    const { board, fleet } = setup();
    expect(() => resolveAttack(board, fleet, 20, 20)).toThrow('Cell out of bounds: (20, 20)');
  });
});
