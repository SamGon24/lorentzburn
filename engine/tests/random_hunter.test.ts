import { describe, it, expect } from 'vitest';
import { RandomHunterOpponent } from '../src/opponent/random_hunter';
import { VisibleCell } from '../src/fog_of_war';

// builds a boardView of the given size, all cells empty by default
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

describe('RandomHunterOpponent', () => {
  it('returns a move within board bounds', async () => {
    const board = createBoardView(10);
    const opponent = new RandomHunterOpponent();
    const move = await opponent.getMove(board);

    expect(move.row).toBeGreaterThanOrEqual(0);
    expect(move.row).toBeLessThan(10);
    expect(move.col).toBeGreaterThanOrEqual(0);
    expect(move.col).toBeLessThan(10);
  });

  it('never targets a cell that is already hit or missed', async () => {
    const board = createBoardView(2);
    board[0][0].status = 'hit';
    board[0][1].status = 'miss';
    board[1][0].status = 'hit';

    const opponent = new RandomHunterOpponent();
    const move = await opponent.getMove(board);

    expect(move).toEqual({ row: 1, col: 1 });
  });

  it('throws when no valid cells remain', async () => {
    const board = createBoardView(1);
    board[0][0].status = 'hit';

    const opponent = new RandomHunterOpponent();
    await expect(opponent.getMove(board)).rejects.toThrow('No valid cells remaining to target');
  });

  it('produces varied results across many calls', async () => {
    const board = createBoardView(10);
    const opponent = new RandomHunterOpponent();

    const results = new Set<string>();
    for (let i = 0; i < 20; i++) {
      const move = await opponent.getMove(board);
      results.add(`${move.row},${move.col}`);
    }

    expect(results.size).toBeGreaterThan(1);
  });
});