import { describe, it, expect } from 'vitest';
import { HuntTargetOpponent } from '../src/opponent/hunt_target';
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

describe('HuntTargetOpponent', () => {
  it('hunts randomly when there is no active hit', async () => {
    const board = createBoardView(10);
    const opponent = new HuntTargetOpponent();
    const move = await opponent.getMove(board);

    expect(move.row).toBeGreaterThanOrEqual(0);
    expect(move.row).toBeLessThan(10);
  });

  it('queues orthogonal neighbors after a hit', async () => {
    const board = createBoardView(10);
    const opponent = new HuntTargetOpponent();

    opponent.registerResult!({ row: 5, col: 5 }, true, false);
    board[4][5].status = 'hit'; // pretend cells outside queue are untouched, this just simulates state
    const move = await opponent.getMove(board);

    const expectedNeighbors = [
      { row: 4, col: 5 },
      { row: 6, col: 5 },
      { row: 5, col: 4 },
      { row: 5, col: 6 },
    ];
    expect(expectedNeighbors).toContainEqual(move);
  });

  it('locks direction after two aligned hits and continues along it', async () => {
    const board = createBoardView(10);
    const opponent = new HuntTargetOpponent();

    // first hit
    opponent.registerResult!({ row: 5, col: 5 }, true, false);
    // second hit, one cell to the right, confirms horizontal direction
    opponent.registerResult!({ row: 5, col: 6 }, true, false);

    const move = await opponent.getMove(board);
    expect(move).toEqual({ row: 5, col: 7 });
  });

  it('resets to hunt mode once the ship is sunk', async () => {
    const board = createBoardView(10);
    const opponent = new HuntTargetOpponent();

    opponent.registerResult!({ row: 5, col: 5 }, true, false);
    opponent.registerResult!({ row: 5, col: 6 }, true, true); // sunk

    // after reset, targetQueue should be empty, so getMove should fall back to random hunt
    // we can't directly inspect private state, but we can confirm it doesn't blindly
    // continue the old direction (5,7), by checking many calls produce varied results
    const results = new Set<string>();
    for (let i = 0; i < 20; i++) {
      const move = await opponent.getMove(board);
      results.add(`${move.row},${move.col}`);
    }
    expect(results.size).toBeGreaterThan(1);
  });

  it('ignores misses, does not enter target mode', async () => {
    const board = createBoardView(10);
    const opponent = new HuntTargetOpponent();

    opponent.registerResult!({ row: 5, col: 5 }, false, false); // miss

    const results = new Set<string>();
    for (let i = 0; i < 20; i++) {
      const move = await opponent.getMove(board);
      results.add(`${move.row},${move.col}`);
    }
    expect(results.size).toBeGreaterThan(1); // still behaving randomly, not fixated
  });
});