import { describe, it, expect } from 'vitest';
import { ProbabilityDensityOpponent } from '../src/opponent/probability_density';
import { VisibleCell } from '../src/fog_of_war';

function createBoardView(size: number): VisibleCell[][] {
  const grid: VisibleCell[][] = [];
  for (let row = 0; row < size; row++) {
    const rowCells: VisibleCell[] = [];
    for (let col = 0; col < size; col++) {
      rowCells.push({ row, col, status: 'empty' });
    }
    grid.push(rowCells);
  }
  return grid;
}

describe('ProbabilityDensityOpponent', () => {
  it('returns a move within board bounds on an empty board', async () => {
    const board = createBoardView(10);
    const opponent = new ProbabilityDensityOpponent([5, 4, 3, 3, 2]);
    const move = await opponent.getMove(board);

    expect(move.row).toBeGreaterThanOrEqual(0);
    expect(move.row).toBeLessThan(10);
    expect(move.col).toBeGreaterThanOrEqual(0);
    expect(move.col).toBeLessThan(10);
  });

  it('prioritizes cells adjacent to an active, unresolved hit', async () => {
    const board = createBoardView(10);
    board[5][5].status = 'hit'; // active hit, not yet sunk

    const opponent = new ProbabilityDensityOpponent([5, 4, 3, 3, 2]);
    opponent.registerResult!({ row: 5, col: 5 }, true, false);

    const move = await opponent.getMove(board);

    // must be orthogonally adjacent to the active hit, since placements
    // must pass through it once an active hit exists
    const validNextMoves = [
      { row: 4, col: 5 },
      { row: 6, col: 5 },
      { row: 5, col: 4 },
      { row: 5, col: 6 },
    ];
    expect(validNextMoves).toContainEqual(move);
  });

  it('never targets an already attacked cell', async () => {
    const board = createBoardView(3);
    board[0][0].status = 'hit';
    board[0][1].status = 'miss';
    board[0][2].status = 'miss';
    board[1][0].status = 'miss';
    board[1][1].status = 'miss';
    board[1][2].status = 'miss';
    board[2][0].status = 'miss';
    board[2][1].status = 'miss';
    // only (2,2) remains empty

    const opponent = new ProbabilityDensityOpponent([2]);
    const move = await opponent.getMove(board);

    expect(move).toEqual({ row: 2, col: 2 });
  });

  it('excludes dead zones around a sunk ship when strictAdjacency is enabled', async () => {
    const board = createBoardView(5);
    board[0][0].status = 'hit';
    board[0][1].status = 'hit';

    const opponent = new ProbabilityDensityOpponent([2, 3], { strictAdjacency: true });
    opponent.registerResult!({ row: 0, col: 0 }, true, false);
    opponent.registerResult!({ row: 0, col: 1 }, true, true); // sinks the 2-cell ship

    const move = await opponent.getMove(board);

    // (0,2), (1,0), (1,1), (1,2) are all adjacent to the sunk ship's cells, must be excluded
    const deadZoneCells = [
      { row: 0, col: 2 },
      { row: 1, col: 0 },
      { row: 1, col: 1 },
      { row: 1, col: 2 },
    ];
    expect(deadZoneCells).not.toContainEqual(move);
  });

  it('does not exclude dead zones when strictAdjacency is disabled (default)', async () => {
    const board = createBoardView(3);
    board[0][0].status = 'hit';
    board[0][1].status = 'hit';
    // mark every other cell as attacked except (1,0), which is adjacent to the sunk ship
    board[0][2].status = 'miss';
    board[1][1].status = 'miss';
    board[1][2].status = 'miss';
    board[2][0].status = 'miss';
    board[2][1].status = 'miss';
    board[2][2].status = 'miss';
    // only (1,0) remains empty, and it is adjacent to the sunk ship

    const opponent = new ProbabilityDensityOpponent([2]);
    opponent.registerResult!({ row: 0, col: 0 }, true, false);
    opponent.registerResult!({ row: 0, col: 1 }, true, true); // sinks the ship

    const move = await opponent.getMove(board);

    // with strictAdjacency off (default), (1,0) is still a valid target
    expect(move).toEqual({ row: 1, col: 0 });
  });

  it('throws when no valid cells remain', async () => {
    const board = createBoardView(1);
    board[0][0].status = 'miss';

    const opponent = new ProbabilityDensityOpponent([2]);
    await expect(opponent.getMove(board)).rejects.toThrow('No valid cells remaining to target');
  });
});