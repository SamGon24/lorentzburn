import { VisibleCell } from '../fog_of_war';

export interface Move {
  row: number;
  col: number;
}

export interface Opponent {
  getMove(boardView: VisibleCell[][]): Promise<Move>;
}