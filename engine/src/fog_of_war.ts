import { Board, CellStatus } from './board';
import { Fleet } from './fleet';

export type VisibleCellStatus = 'empty' | 'hit' | 'miss';

export interface VisibleCell {
  row: number;
  col: number;
  status: VisibleCellStatus;
}

// opponent-facing view of the board: hides unhit ships, only reveals hits/misses
export function getFogOfWarView(board: Board): VisibleCell[][] {
  return board.getGrid().map((row) =>
    row.map((cell) => ({
      row: cell.row,
      col: cell.col,
      status: mapToVisibleStatus(cell.status),
    }))
  );
}

// collapses the internal Ship status down to what an opponent is allowed to see
function mapToVisibleStatus(status: CellStatus): VisibleCellStatus {
  if (status === CellStatus.Hit) return 'hit';
  if (status === CellStatus.Miss) return 'miss';
  return 'empty';
}

export type FullCellStatus = 'empty' | 'ship' | 'hit' | 'miss';

export interface FullCell {
  row: number;
  col: number;
  status: FullCellStatus;
  shipId?: string;
}

// owner-facing view of the board: shows ships, hits, and misses
export function getOwnBoardView(board: Board, fleet: Fleet): FullCell[][] {
  const grid = board.getGrid();
  return grid.map((row) =>
    row.map((cell) => {
      const ship = fleet
        .getShips()
        .find((s) => s.coordinates.some((c) => c.row === cell.row && c.col === cell.col));

      const status: FullCellStatus =
        cell.status === CellStatus.Hit || cell.status === CellStatus.Miss
          ? cell.status
          : ship
          ? 'ship'
          : 'empty';

      return { row: cell.row, col: cell.col, status, shipId: ship?.id };
    })
  );
}