import type { FullCellStatus } from 'engine';

export type CellHighlight = 'valid' | 'invalid';

interface CellProps {
  status: FullCellStatus;
  highlight?: CellHighlight;
  disabled?: boolean;
  label: string;
  onClick?: () => void;
  onMouseEnter?: () => void;
}

const STATUS_CLASSES: Record<FullCellStatus, string> = {
  empty: 'bg-sky-100',
  ship: 'bg-slate-500',
  hit: 'bg-red-500 text-white',
  miss: 'bg-slate-200 text-slate-500',
};

const HIGHLIGHT_CLASSES: Record<CellHighlight, string> = {
  valid: 'bg-emerald-300',
  invalid: 'bg-red-300',
};

const STATUS_MARKS: Record<FullCellStatus, string> = {
  empty: '',
  ship: '',
  hit: '✕',
  miss: '•',
};

// a single grid square, highlight (placement preview) takes precedence over status color
export function Cell({
  status,
  highlight,
  disabled,
  label,
  onClick,
  onMouseEnter,
}: CellProps) {
  const color = highlight
    ? HIGHLIGHT_CLASSES[highlight]
    : STATUS_CLASSES[status];
  const interactive = onClick && !disabled;

  return (
    <button
      type="button"
      aria-label={`${label} ${status}`}
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      className={`flex aspect-square items-center justify-center rounded-sm text-sm font-bold ${color} ${
        interactive ? 'cursor-pointer hover:brightness-90' : 'cursor-default'
      }`}
    >
      {STATUS_MARKS[status]}
    </button>
  );
}
