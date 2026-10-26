export enum CellStatus {
  Empty = 'empty',
  Ship = 'ship',
  Hit = 'hit',
  Miss = 'miss',
}

export interface Cell {
  row: number;
  col: number;
  status: CellStatus;
  shipId?: string;
}

export class Board {
  readonly size: number;
  private grid: Cell[][]; // size x size matrix of cells, indexed [row][col]

  constructor(size: number = 10) {
    this.size = size;
    this.grid = this.createEmptyGrid();
  }

  // builds a fresh size x size grid with every cell set to Empty
  private createEmptyGrid(): Cell[][] {
    return Array.from({ length: this.size }, (_, row) =>
      Array.from({ length: this.size }, (_, col) => ({
        row,
        col,
        status: CellStatus.Empty,
      }))
    );
  }

  // whether (row, col) falls within the grid
  isInBounds(row: number, col: number): boolean {
    return row >= 0 && row < this.size && col >= 0 && col < this.size;
  }

  // fetches the cell at (row, col), throws if out of bounds
  getCell(row: number, col: number): Cell {
    if (!this.isInBounds(row, col)) {
      throw new Error(`Cell out of bounds: (${row}, ${col})`);
    }
    return this.grid[row][col];
  }

  // read-only view of the full grid
  getGrid(): ReadonlyArray<ReadonlyArray<Cell>> {
    return this.grid;
  }

  // updates the status of a single cell in place
  setCellStatus(row: number, col: number, status: CellStatus): void {
  const cell = this.getCell(row, col);
  cell.status = status;
}
}