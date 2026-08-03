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
  private grid: Cell[][];

  constructor(size: number = 10) {
    this.size = size;
    this.grid = this.createEmptyGrid();
  }

  private createEmptyGrid(): Cell[][] {
    return Array.from({ length: this.size }, (_, row) =>
      Array.from({ length: this.size }, (_, col) => ({
        row,
        col,
        status: CellStatus.Empty,
      }))
    );
  }

  isInBounds(row: number, col: number): boolean {
    return row >= 0 && row < this.size && col >= 0 && col < this.size;
  }

  getCell(row: number, col: number): Cell {
    if (!this.isInBounds(row, col)) {
      throw new Error(`Cell out of bounds: (${row}, ${col})`);
    }
    return this.grid[row][col];
  }

  getGrid(): ReadonlyArray<ReadonlyArray<Cell>> {
    return this.grid;
  }
}