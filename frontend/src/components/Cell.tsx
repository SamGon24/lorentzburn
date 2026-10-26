import type { CSSProperties } from 'react';
import type { FullCellStatus } from 'engine';

export type CellHighlight = 'valid' | 'invalid';

// which orthogonal neighbors belong to the same hull, so a ship draws as one continuous shape
export interface HullSides {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
}

interface CellProps {
  status: FullCellStatus;
  label: string;
  hull?: HullSides; // set when this cell is part of a ship or a placement preview
  highlight?: CellHighlight;
  disabled?: boolean;
  animate?: boolean; // play the impact flare when a hit lands
  onClick?: () => void;
  onMouseEnter?: () => void;
}

const HULL_INSET = '22%';
const JOIN = '-1px'; // overlaps the grid line so neighboring segments meet

// connected sides run to the cell edge, free sides are inset, corners round only where both sides are free
function hullStyle(sides: HullSides): CSSProperties {
  const round = (a: boolean, b: boolean) => (!a && !b ? '999px' : '0');
  return {
    top: sides.up ? JOIN : HULL_INSET,
    bottom: sides.down ? JOIN : HULL_INSET,
    left: sides.left ? JOIN : HULL_INSET,
    right: sides.right ? JOIN : HULL_INSET,
    borderTopLeftRadius: round(sides.up, sides.left),
    borderTopRightRadius: round(sides.up, sides.right),
    borderBottomLeftRadius: round(sides.down, sides.left),
    borderBottomRightRadius: round(sides.down, sides.right),
  };
}

export function Cell({
  status,
  label,
  hull,
  highlight,
  disabled,
  animate,
  onClick,
  onMouseEnter,
}: CellProps) {
  const target = !!onClick && !disabled;
  const hullClass = highlight
    ? `hull hull-preview-${highlight}`
    : status === 'hit'
      ? 'hull hull-damaged'
      : 'hull';

  return (
    <button
      type="button"
      className="plot-cell"
      data-target={target || undefined}
      aria-label={`${label}, ${status}`}
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
    >
      {hull && <span className={hullClass} style={hullStyle(hull)} />}
      {status === 'hit' && (
        <span className={animate ? 'impact impact-animate' : 'impact'} />
      )}
      {status === 'miss' && <span className="miss-ring" />}
    </button>
  );
}
