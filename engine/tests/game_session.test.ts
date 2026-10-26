import { describe, it, expect } from 'vitest';
import { GameSession } from '../src/game_session';
import { RandomHunterOpponent } from '../src/opponent/random_hunter';
import { Opponent, Move } from '../src/opponent/opponent';
import { VisibleCell } from '../src/fog_of_war';

// a deterministic opponent for precise test assertions, always fires at the next cell in a fixed list
class ScriptedOpponent implements Opponent {
  private moves: Move[];
  private index = 0;

  constructor(moves: Move[]) {
    this.moves = moves;
  }

  async getMove(_boardView: VisibleCell[][]): Promise<Move> {
    const move = this.moves[this.index];
    this.index++;
    return move;
  }
}

describe('GameSession', () => {
  it('AI-controlled sides start with a fully placed fleet', () => {
    const session = new GameSession({
      sideA: new RandomHunterOpponent(),
      sideB: new RandomHunterOpponent(),
    });

    expect(session.fleetA.isFullyPlaced()).toBe(true);
    expect(session.fleetB.isFullyPlaced()).toBe(true);
  });

  it('player-controlled sides start with an empty fleet until placed manually', () => {
    const session = new GameSession({
      sideA: 'player',
      sideB: new RandomHunterOpponent(),
    });

    expect(session.fleetA.isFullyPlaced()).toBe(false);
  });

  it('enforces turn order, side A goes first by default', () => {
    const session = new GameSession({
      sideA: 'player',
      sideB: 'player',
    });

    expect(() => session.attackAsB(0, 0)).toThrow("It is not side B's turn");
  });

  it('alternates turns after each attack', () => {
    const session = new GameSession({
      sideA: 'player',
      sideB: 'player',
    });

    session.attackAsA(0, 0);
    expect(() => session.attackAsA(1, 1)).toThrow("It is not side A's turn");

    session.attackAsB(0, 0);
    expect(() => session.attackAsB(1, 1)).toThrow("It is not side B's turn");
  });

  it('throws when attacking after the game is over', async () => {
    // Interceptor is the smallest ship, size 2, easiest to fully script a win against
    const session = new GameSession({
      sideA: 'player',
      sideB: 'player',
    });

    // manually shrink side B's fleet to a single, known ship for a fully deterministic win
    const { Ship } = await import('../src/ship');
    session.fleetB.placeShip(new Ship('s1', 'Interceptor', 2, { row: 0, col: 0 }, 'horizontal'));

    session.attackAsA(0, 0); // hit
    session.attackAsB(5, 5); // B's turn, arbitrary miss on A's empty board
    session.attackAsA(0, 1); // sinks the only ship, game over

    expect(session.isGameOver()).toBe(true);
    expect(session.getWinner()).toBe('A');
    expect(() => session.attackAsB(1, 1)).toThrow('Game is already over');
  });

  it('playAiTurn throws for a player-controlled side', async () => {
    const session = new GameSession({
      sideA: 'player',
      sideB: new RandomHunterOpponent(),
    });

    await expect(session.playAiTurn('A')).rejects.toThrow("Side A is player-controlled, cannot auto-play");
  });

  it('playAiTurn correctly attacks the opposing board and switches turns', async () => {
    const session = new GameSession({
      sideA: new ScriptedOpponent([{ row: 0, col: 0 }]),
      sideB: new RandomHunterOpponent(),
    });

    expect(session.getCurrentTurn()).toBe('A');
    const { move } = await session.playAiTurn('A');

    expect(move).toEqual({ row: 0, col: 0 });
    expect(session.getCurrentTurn()).toBe('B');
  });

  it('runs a full AI vs AI game to completion', async () => {
    const session = new GameSession({
      sideA: new RandomHunterOpponent(),
      sideB: new RandomHunterOpponent(),
    });

    let turns = 0;
    while (!session.isGameOver() && turns < 500) {
      await session.playAiTurn(session.getCurrentTurn());
      turns++;
    }

    expect(session.isGameOver()).toBe(true);
    expect(['A', 'B']).toContain(session.getWinner());
    expect(turns).toBeLessThan(500); // sanity check it actually finished, didn't hit the safety cap
  });
});