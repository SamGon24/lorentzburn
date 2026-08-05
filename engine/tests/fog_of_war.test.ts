import { describe, it, expect } from 'vitest';
import { Board } from '../src/board';
import { Ship } from '../src/ship';
import { Fleet } from '../src/fleet';
import { resolveAttack } from '../src/attack';
import { getFogOfWarView, getOwnBoardView } from '../src/fog_of_war';

function setup() {
  const board = new Board(10);
  const fleet = new Fleet(board);
  const interceptor = new Ship('s1', 'Interceptor', 2, { row: 0, col: 0 }, 'horizontal');
  fleet.placeShip(interceptor);
  const corvette = new Ship('s2', 'Corvette', 3, { row: 3, col: 3 }, 'vertical');
  fleet.placeShip(corvette);

  resolveAttack(board, fleet, 0, 0); // hit on interceptor
  resolveAttack(board, fleet, 5, 5); // miss

  return { board, fleet };
}

describe('getFogOfWarView', () => {
  it('has the same dimensions as the board', () => {
    const { board } = setup();
    const view = getFogOfWarView(board);
    expect(view.length).toBe(board.size);
    expect(view[0].length).toBe(board.size);
  });

  it('reveals hit cells', () => {
    const { board } = setup();
    const view = getFogOfWarView(board);
    expect(view[0][0].status).toBe('hit');
  });

  it('reveals missed cells', () => {
    const { board } = setup();
    const view = getFogOfWarView(board);
    expect(view[5][5].status).toBe('miss');
  });

  it('hides unhit ship cells as empty', () => {
    const { board } = setup();
    const view = getFogOfWarView(board);
    expect(view[0][1].status).toBe('empty');
    expect(view[3][3].status).toBe('empty');
  });

  it('does not expose ship identity information', () => {
    const { board } = setup();
    const view = getFogOfWarView(board);
    expect(view[0][0]).not.toHaveProperty('shipId');
  });
});

describe('getOwnBoardView', () => {
  it('shows unhit ship cells with status ship and the owning shipId', () => {
    const { board, fleet } = setup();
    const view = getOwnBoardView(board, fleet);
    expect(view[0][1]).toEqual({ row: 0, col: 1, status: 'ship', shipId: 's1' });
    expect(view[3][3]).toEqual({ row: 3, col: 3, status: 'ship', shipId: 's2' });
  });

  it('shows hit ship cells with status hit', () => {
    const { board, fleet } = setup();
    const view = getOwnBoardView(board, fleet);
    expect(view[0][0].status).toBe('hit');
  });

  it('shows missed cells with status miss', () => {
    const { board, fleet } = setup();
    const view = getOwnBoardView(board, fleet);
    expect(view[5][5].status).toBe('miss');
  });

  it('shows untouched, unoccupied cells as empty with no shipId', () => {
    const { board, fleet } = setup();
    const view = getOwnBoardView(board, fleet);
    expect(view[9][9]).toEqual({ row: 9, col: 9, status: 'empty', shipId: undefined });
  });
});
