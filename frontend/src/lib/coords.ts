const ROW_LABELS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

// row letter for a 0-based row index, A, B, C...
export function rowLabel(row: number): string {
  return ROW_LABELS[row] ?? String(row);
}

// human-readable coordinate, (2, 4) -> "C5"
export function formatCoord(row: number, col: number): string {
  return `${rowLabel(row)}${col + 1}`;
}

// stable key for coordinate lookups
export function coordKey(row: number, col: number): string {
  return `${row},${col}`;
}
