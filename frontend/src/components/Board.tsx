import type { FullCell, VisibleCell } from 'engine';
import { Cell, type CellHighlight, type HullSides } from './Cell';
import { coordKey, formatCoord, rowLabel } from '../lib/coords';

type BoardCell = VisibleCell | FullCell;

interface BoardProps {
  cells: BoardCell[][];
  title?: string;
  meta?: string; // short status shown beside the title, e.g. ships remaining
  className?: string;
  highlights?: Map<string, CellHighlight>; // keyed by coordKey(row, col)
  animate?: boolean;
  isCellDisabled?: (cell: BoardCell) => boolean;
  onCellClick?: (row: number, col: number) => void;
  onCellHover?: (row: number, col: number) => void;
  onMouseLeave?: () => void;
}

// cells sharing a group are drawn as one hull, a placement preview counts as its own group
function groupAt(
  cells: BoardCell[][],
  highlights: Map<string, CellHighlight> | undefined,
  row: number,
  col: number
): string | undefined {
  const cell = cells[row]?.[col];
  if (!cell) return undefined;
  if (highlights?.has(coordKey(row, col))) return 'preview';
  return 'shipId' in cell ? cell.shipId : undefined;
}

function hullSides(
  cells: BoardCell[][],
  highlights: Map<string, CellHighlight> | undefined,
  row: number,
  col: number
): HullSides | undefined {
  const group = groupAt(cells, highlights, row, col);
  if (!group) return undefined;
  const same = (r: number, c: number) =>
    groupAt(cells, highlights, r, c) === group;
  return {
    up: same(row - 1, col),
    down: same(row + 1, col),
    left: same(row, col - 1),
    right: same(row, col + 1),
  };
}

// renders a square tactical plot from either a fog-of-war or an own-board view, with row/column labels
export function Board({
  cells,
  title,
  meta,
  className = '',
  highlights,
  animate,
  isCellDisabled,
  onCellClick,
  onCellHover,
  onMouseLeave,
}: BoardProps) {
  const size = cells.length;
  const columns = { gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` };

  return (
    <section className={`w-full ${className}`}>
      {(title || meta) && (
        <div className="mb-3 flex items-baseline justify-between gap-4 pl-6">
          {title && <h2 className="text-lg font-semibold">{title}</h2>}
          {meta && <p className="text-sm text-plot">{meta}</p>}
        </div>
      )}

      <div className="grid grid-cols-[1.25rem_1fr] gap-x-1.5 gap-y-1 text-xs text-plot tabular-nums">
        <div />
        <div className="grid" style={columns}>
          {Array.from({ length: size }, (_, col) => (
            <div key={col} className="text-center">
              {col + 1}
            </div>
          ))}
        </div>

        <div
          className="grid"
          style={{ gridTemplateRows: `repeat(${size}, minmax(0, 1fr))` }}
        >
          {Array.from({ length: size }, (_, row) => (
            <div key={row} className="flex items-center justify-center">
              {rowLabel(row)}
            </div>
          ))}
        </div>

        <div
          className="grid border-t border-l border-grid bg-panel"
          style={columns}
          onMouseLeave={onMouseLeave}
        >
          {cells.flat().map((cell) => {
            const key = coordKey(cell.row, cell.col);
            return (
              <Cell
                key={key}
                status={cell.status}
                label={formatCoord(cell.row, cell.col)}
                hull={hullSides(cells, highlights, cell.row, cell.col)}
                highlight={highlights?.get(key)}
                animate={animate}
                disabled={!onCellClick || isCellDisabled?.(cell)}
                onClick={onCellClick && (() => onCellClick(cell.row, cell.col))}
                onMouseEnter={
                  onCellHover && (() => onCellHover(cell.row, cell.col))
                }
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
