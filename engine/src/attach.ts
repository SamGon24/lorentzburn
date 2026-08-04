import { Board, CellStatus } from './board';
import { Fleet } from './fleet';

export type AttackResult = 'hit' | 'miss' | 'sunk' | 'already-attacked';

export interface AttackOutcome {
  result: AttackResult;
  shipName?: string;
  gameOver: boolean;
}

export function resolveAttack(
  board: Board,
  fleet: Fleet,
  row: number,
  col: number
): AttackOutcome {
  const cell = board.getCell(row, col);

  if (cell.status === CellStatus.Hit || cell.status === CellStatus.Miss) {
    return { result: 'already-attacked', gameOver: false };
  }

  const ships = fleet.getShips();
  const targetShip = ships.find((ship) =>
    ship.coordinates.some((c) => c.row === row && c.col === col)
  );

  if (!targetShip) {
    board.setCellStatus(row, col, CellStatus.Miss);
    return { result: 'miss', gameOver: false };
  }

  targetShip.registerHit(row, col);
  board.setCellStatus(row, col, CellStatus.Hit);

  const sunk = targetShip.isSunk();
  const gameOver = fleet.allSunk();

  return {
    result: sunk ? 'sunk' : 'hit',
    shipName: sunk ? targetShip.name : undefined,
    gameOver,
  };
}