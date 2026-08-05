import { VisibleCell } from '../fog_of_war';

// A single targeted cell
export interface Move {
  row: number;
  col: number;
}

// Shared contract for all AI opponents, heuristic and LLM-based alike
export interface Opponent {
  // Given the current board view, return the next cell to attack
  getMove(boardView: VisibleCell[][]): Promise<Move>;

  // Optional feedback hook, lets stateful strategies react to their own results
  registerResult?(move: Move, wasHit: boolean, shipSunk: boolean): void;
}