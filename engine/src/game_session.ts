import { Board } from './board';
import { Ship } from './ship';
import { Fleet } from './fleet';
import { GameRules, DEFAULT_GAME_RULES } from './game_rules';
import { resolveAttack, AttackOutcome } from './attack';
import { getFogOfWarView } from './fog_of_war';
import { Opponent, Move } from './opponent/opponent';
import { randomlyPlaceFleet } from './fleet_setup';

export type Side = 'A' | 'B';
export type SideController = Opponent | 'player'; // 'player' means externally controlled

export interface GameSessionConfig {
  boardSize?: number;
  rules?: GameRules;
  sideA: SideController;
  sideB: SideController;
}

// orchestrates a full match between two sides, each either player-controlled or AI-controlled
export class GameSession {
  readonly boardA: Board;
  readonly fleetA: Fleet;
  readonly boardB: Board;
  readonly fleetB: Fleet;

  private sideA: SideController;
  private sideB: SideController;
  private currentTurn: Side;
  private gameOver: boolean;
  private winner: Side | null;

  constructor(config: GameSessionConfig) {
    const boardSize = config.boardSize ?? 10;
    const rules = config.rules ?? DEFAULT_GAME_RULES;

    this.boardA = new Board(boardSize);
    this.boardB = new Board(boardSize);
    this.fleetA = new Fleet(this.boardA, rules);
    this.fleetB = new Fleet(this.boardB, rules);

    this.sideA = config.sideA;
    this.sideB = config.sideB;
    this.currentTurn = 'A';
    this.gameOver = false;
    this.winner = null;

    // AI-controlled sides get their fleet placed automatically
    if (this.sideA !== 'player') {
      randomlyPlaceFleet(this.fleetA, this.boardA, rules);
    }
    if (this.sideB !== 'player') {
      randomlyPlaceFleet(this.fleetB, this.boardB, rules);
    }
  }

  // for player-controlled sides, places their ships once they've been chosen externally
  placePlayerFleet(side: Side, ships: Ship[]): void {
    const fleet = side === 'A' ? this.fleetA : this.fleetB;
    for (const ship of ships) {
      fleet.placeShip(ship);
    }
  }

  // side A attacks side B's board
  attackAsA(row: number, col: number): AttackOutcome {
    this.assertTurn('A');
    const outcome = resolveAttack(this.boardB, this.fleetB, row, col);
    this.afterAttack('A', { row, col }, outcome);
    return outcome;
  }

  // side B attacks side A's board
  attackAsB(row: number, col: number): AttackOutcome {
    this.assertTurn('B');
    const outcome = resolveAttack(this.boardA, this.fleetA, row, col);
    this.afterAttack('B', { row, col }, outcome);
    return outcome;
  }

  // drives an AI-controlled side's turn automatically, throws if that side is player-controlled
  async playAiTurn(side: Side): Promise<{ move: Move; outcome: AttackOutcome }> {
    this.assertTurn(side);
    const controller = side === 'A' ? this.sideA : this.sideB;
    if (controller === 'player') {
      throw new Error(`Side ${side} is player-controlled, cannot auto-play`);
    }

    const targetBoard = side === 'A' ? this.boardB : this.boardA;
    const boardView = getFogOfWarView(targetBoard);
    const move = await controller.getMove(boardView);
    const outcome = side === 'A' ? this.attackAsA(move.row, move.col) : this.attackAsB(move.row, move.col);

    return { move, outcome };
  }

  isGameOver(): boolean {
    return this.gameOver;
  }

  getWinner(): Side | null {
    return this.winner;
  }

  getCurrentTurn(): Side {
    return this.currentTurn;
  }

  private assertTurn(side: Side): void {
    if (this.gameOver) {
      throw new Error('Game is already over');
    }
    if (this.currentTurn !== side) {
      throw new Error(`It is not side ${side}'s turn`);
    }
  }

  private afterAttack(attackingSide: Side, move: Move, outcome: AttackOutcome): void {
    // feed stateful AI opponents their result, if applicable
    const attacker = attackingSide === 'A' ? this.sideA : this.sideB;
    if (attacker !== 'player') {
      attacker.registerResult?.(
        move,
        outcome.result === 'hit' || outcome.result === 'sunk',
        outcome.result === 'sunk'
      );
    }

    if (outcome.gameOver) {
      this.gameOver = true;
      this.winner = attackingSide;
      return;
    }

    // only switch turns if the shot missed, hits earn another turn... actually keeping it simple:
    // always alternate turns regardless of hit/miss, matching classic Battleship turn order
    this.currentTurn = attackingSide === 'A' ? 'B' : 'A';
  }
}