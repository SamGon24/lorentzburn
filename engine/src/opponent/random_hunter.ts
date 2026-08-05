import { Opponent, Move } from './opponent';
import { VisibleCell } from '../fog_of_war';

// Simplest possible opponent, fires at a random unattacked cell every turn
export class RandomHunterOpponent implements Opponent {
  async getMove(boardView: VisibleCell[][]): Promise<Move> {
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