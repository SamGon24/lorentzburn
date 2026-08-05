import { describe, it, expect } from 'vitest';
import { Board, CellStatus } from '../src/board';

describe('Board', () => {
  it('defaults to a 10x10 grid', () => {
    const board = new Board();
    expect(board.size).toBe(10);
    expect(board.getGrid().length).toBe(10);
    expect(board.getGrid()[0].length).toBe(10);
  });

  it('supports a custom size', () => {
    const board = new Board(5);
    expect(board.size).toBe(5);
    expect(board.getGrid().length).toBe(5);
  });

  it('initializes every cell as empty with matching coordinates', () => {
    const board = new Board(3);
    const cell = board.getCell(1, 2);
    expect(cell).toEqual({ row: 1, col: 2, status: CellStatus.Empty });
  });

  it('reports coordinates within bounds as in bounds', () => {
    const board = new Board(10);
    expect(board.isInBounds(0, 0)).toBe(true);
    expect(board.isInBounds(9, 9)).toBe(true);
  });

  it('reports coordinates outside bounds as out of bounds', () => {
    const board = new Board(10);
    expect(board.isInBounds(10, 0)).toBe(false);
    expect(board.isInBounds(0, 10)).toBe(false);
    expect(board.isInBounds(-1, 0)).toBe(false);
    expect(board.isInBounds(0, -1)).toBe(false);
  });

  it('throws when getting a cell out of bounds', () => {
    const board = new Board(10);
    expect(() => board.getCell(20, 20)).toThrow('Cell out of bounds: (20, 20)');
  });

  it('updates a cell status in place', () => {
    const board = new Board(10);
    board.setCellStatus(3, 4, CellStatus.Hit);
    expect(board.getCell(3, 4).status).toBe(CellStatus.Hit);
  });

  it('throws when setting a status out of bounds', () => {
    const board = new Board(10);
    expect(() => board.setCellStatus(20, 20, CellStatus.Hit)).toThrow();
  });

  it('leaves other cells untouched when updating one cell', () => {
    const board = new Board(10);
    board.setCellStatus(3, 4, CellStatus.Hit);
    expect(board.getCell(3, 5).status).toBe(CellStatus.Empty);
  });
});
