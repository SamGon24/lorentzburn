import { Opponent, Move } from './opponent';
import { VisibleCell } from '../fog_of_war';
import { GameRules, DEFAULT_GAME_RULES } from '../game_rules';

export class ProbabilityDensityOpponent implements Opponent {
  private remainingShipSizes: number[]; // sizes of ships not yet confirmed sunk
  private activeHits: Move[] = []; // hits not yet tied to a sunk ship
  private deadZones: Set<string> = new Set(); // cells excluded due to adjacency around sunk ships
  private rules: GameRules;

  constructor(remainingShipSizes: number[], rules: GameRules = DEFAULT_GAME_RULES) {
    this.remainingShipSizes = [...remainingShipSizes];
    this.rules = rules;
  }

  async getMove(boardView: VisibleCell[][]): Promise<Move> {
    const heatmap = this.buildHeatmap(boardView);
    return this.pickHighestProbabilityCell(heatmap, boardView);
  }

  registerResult(move: Move, wasHit: boolean, shipSunk: boolean): void {
    if (wasHit) {
      this.activeHits.push(move);
    }

    if (shipSunk) {
      this.markDeadZones();
      this.activeHits = [];
      this.remainingShipSizes.sort((a, b) => b - a);
      this.remainingShipSizes.shift(); // simplification, see earlier note
    }
  }

  // marks the sunk ship's cells and neighbors as invalid, only when strictAdjacency is enabled
  private markDeadZones(): void {
    if (!this.rules.strictAdjacency) return;

    for (const hit of this.activeHits) {
      this.deadZones.add(`${hit.row},${hit.col}`);
      for (let dRow = -1; dRow <= 1; dRow++) {
        for (let dCol = -1; dCol <= 1; dCol++) {
          this.deadZones.add(`${hit.row + dRow},${hit.col + dCol}`);
        }
      }
    }
  }

  private buildHeatmap(boardView: VisibleCell[][]): number[][] {
    const size = boardView.length;
    const heatmap: number[][] = Array.from({ length: size }, () => new Array(size).fill(0));

    for (const shipSize of this.remainingShipSizes) {
      for (let row = 0; row < size; row++) {
        for (let col = 0; col < size; col++) {
          this.tryAddPlacement(heatmap, boardView, row, col, shipSize, 'horizontal');
          this.tryAddPlacement(heatmap, boardView, row, col, shipSize, 'vertical');
        }
      }
    }

    return heatmap;
  }

  private tryAddPlacement(
    heatmap: number[][],
    boardView: VisibleCell[][],
    row: number,
    col: number,
    shipSize: number,
    orientation: 'horizontal' | 'vertical'
  ): void {
    const size = boardView.length;
    const cells: Move[] = [];
    let coversActiveHit = false;

    for (let i = 0; i < shipSize; i++) {
      const r = orientation === 'horizontal' ? row : row + i;
      const c = orientation === 'horizontal' ? col + i : col;

      if (r < 0 || r >= size || c < 0 || c >= size) {
        return;
      }
      if (this.deadZones.has(`${r},${c}`)) {
        return;
      }

      const status = boardView[r][c].status;
      if (status === 'miss') {
        return;
      }
      if (status === 'hit') {
        coversActiveHit = true;
      }

      cells.push({ row: r, col: c });
    }

    if (this.activeHits.length > 0 && !coversActiveHit) {
      return;
    }

    for (const cell of cells) {
      if (boardView[cell.row][cell.col].status === 'empty') {
        heatmap[cell.row][cell.col] += 1;
      }
    }
  }

  private pickHighestProbabilityCell(heatmap: number[][], boardView: VisibleCell[][]): Move {
    let best: Move | null = null;
    let bestScore = -1;

    for (let row = 0; row < heatmap.length; row++) {
      for (let col = 0; col < heatmap[row].length; col++) {
        if (boardView[row][col].status !== 'empty') continue;
        if (heatmap[row][col] > bestScore) {
          bestScore = heatmap[row][col];
          best = { row, col };
        }
      }
    }

    if (!best) {
      throw new Error('No valid cells remaining to target');
    }
    return best;
  }
}