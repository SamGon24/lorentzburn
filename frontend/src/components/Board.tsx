import type { FullCell, VisibleCell } from 'engine';
import { Cell, type CellHighlight } from './Cell';
import { coordKey, formatCoord, rowLabel } from '../lib/coords';

type BoardCell = VisibleCell | FullCell;

interface BoardProps {
  cells: BoardCell[][];
  title?: string;
  highlights?: Map<string, CellHighlight>; // keyed by coordKey(row, col)
  isCellDisabled?: (cell: BoardCell) => boolean;
  onCellClick?: (row: number, col: number) => void;
  onCellHover?: (row: number, col: number) => void;
  onMouseLeave?: () => void;
}

// renders a square grid of cells from either a fog-of-war or an own-board view, with row/column labels
export function Board({
  cells,
  title,
  highlights,
  isCellDisabled,
  onCellClick,
  onCellHover,
  onMouseLeave,
}: BoardProps) {
  const size = cells.length;

  return (
    <div className="w-full max-w-md">
      {title && (
        <h2 className="mb-2 text-center text-lg font-semibold">{title}</h2>
      )}
      <div
        className="grid gap-0.5 text-xs text-slate-500"
        style={{
          gridTemplateColumns: `1.5rem repeat(${size}, minmax(0, 1fr))`,
        }}
        onMouseLeave={onMouseLeave}
      >
        <div />
        {Array.from({ length: size }, (_, col) => (
          <div key={col} className="text-center">
            {col + 1}
          </div>
        ))}

        {cells.map((row, rowIndex) => (
          <div key={rowIndex} className="contents">
            <div className="flex items-center justify-center">
              {rowLabel(rowIndex)}
            </div>
            {row.map((cell) => (
              <Cell
                key={cell.col}
                status={cell.status}
                label={formatCoord(cell.row, cell.col)}
                highlight={highlights?.get(coordKey(cell.row, cell.col))}
                disabled={isCellDisabled?.(cell)}
                onClick={onCellClick && (() => onCellClick(cell.row, cell.col))}
                onMouseEnter={
                  onCellHover && (() => onCellHover(cell.row, cell.col))
                }
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
