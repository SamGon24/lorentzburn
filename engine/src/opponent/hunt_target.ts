import { Opponent, Move } from './opponent';
import { VisibleCell } from '../fog_of_war';

export class HuntTargetOpponent implements Opponent {
  private targetQueue: Move[] = []; // pending cells to try next, in target mode
  private lastHit: Move | null = null; // most recent confirmed hit
  private confirmedDirection: { dRow: number; dCol: number } | null = null; // locked-in ship direction, once known

  async getMove(boardView: VisibleCell[][]): Promise<Move> {
    this.pruneInvalidTargets(boardView); // drop queued targets that are no longer valid

    if (this.targetQueue.length > 0) {
      return this.targetQueue.shift()!; // prioritize targeting over random hunting
    }

    return this.randomHunt(boardView); // fall back to hunt mode
  }

  registerResult(move: Move, wasHit: boolean, shipSunk: boolean): void {
    if (shipSunk) {
      // ship destroyed, reset back to hunt mode
      this.targetQueue = [];
      this.lastHit = null;
      this.confirmedDirection = null;
      return;
    }

    if (!wasHit) {
      return; // miss, no state change needed
    }

    if (this.lastHit && !this.confirmedDirection) {
      // second hit, check if it lines up with the first to confirm a direction
      const dRow = move.row - this.lastHit.row;
      const dCol = move.col - this.lastHit.col;
      if (Math.abs(dRow) + Math.abs(dCol) === 1) {
        this.confirmedDirection = { dRow, dCol };
        this.targetQueue = [{ row: move.row + dRow, col: move.col + dCol }];
      }
    }

    if (!this.confirmedDirection) {
      // first hit, or direction not yet confirmed, probe all neighbors
      this.targetQueue = this.getNeighbors(move);
    } else {
      // direction known, keep pushing straight along it
      const { dRow, dCol } = this.confirmedDirection;
      this.targetQueue = [{ row: move.row + dRow, col: move.col + dCol }];
    }

    this.lastHit = move;
  }

  // returns the four orthogonal neighbors of a cell
  private getNeighbors(move: Move): Move[] {
    return [
      { row: move.row - 1, col: move.col },
      { row: move.row + 1, col: move.col },
      { row: move.row, col: move.col - 1 },
      { row: move.row, col: move.col + 1 },
    ];
  }

  // removes queued targets that are out of bounds or already attacked
  private pruneInvalidTargets(boardView: VisibleCell[][]): void {
    const size = boardView.length;
    this.targetQueue = this.targetQueue.filter((move) => {
      if (move.row < 0 || move.row >= size || move.col < 0 || move.col >= size) {
        return false;
      }
      return boardView[move.row][move.col].status === 'empty';
    });
  }

  // picks a random unattacked cell, used when there's nothing to target
  private randomHunt(boardView: VisibleCell[][]): Move {
    const validCells: Move[] = [];
    for (const row of boardView) {
      for (const cell of row) {
        if (cell.status === 'empty') {
          validCells.push({ row: cell.row, col: cell.col });
        }
      }
    }
    if (validCells.length === 0) {
      throw new Error('No valid cells remaining to target');
    }
    const randomIndex = Math.floor(Math.random() * validCells.length);
    return validCells[randomIndex];
  }
}