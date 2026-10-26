import { useReducer, useState } from 'react';
import { getFogOfWarView, getOwnBoardView } from 'engine';
import type { GameSession, Side } from 'engine';
import { Board } from '../components/Board';
import { AttackLog, type LogEntry } from '../components/AttackLog';

const AI_TURN_DELAY_MS = 500; // short pause so the player can see their shot land before the AI fires

interface GameScreenProps {
  session: GameSession; // player is side A, AI is side B
  onGameOver: (winner: Side, log: LogEntry[]) => void;
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function GameScreen({ session, onGameOver }: GameScreenProps) {
  const [log, setLog] = useState<LogEntry[]>([]);
  // GameSession mutates in place, so bump a counter to re-render after each attack
  const [, rerender] = useReducer((n: number) => n + 1, 0);

  const playerTurn = session.getCurrentTurn() === 'A' && !session.isGameOver();

  const handleAttack = async (row: number, col: number) => {
    // the engine's turn state is updated synchronously, so this also guards against double clicks
    if (!playerTurn || session.getCurrentTurn() !== 'A') return;

    const outcome = session.attackAsA(row, col);
    let entries: LogEntry[] = [
      ...log,
      {
        side: 'A',
        row,
        col,
        result: outcome.result,
        shipName: outcome.shipName,
      },
    ];
    setLog(entries);
    rerender();

    if (outcome.gameOver) {
      onGameOver('A', entries);
      return;
    }

    await wait(AI_TURN_DELAY_MS);
    const ai = await session.playAiTurn('B');
    entries = [
      ...entries,
      {
        side: 'B',
        ...ai.move,
        result: ai.outcome.result,
        shipName: ai.outcome.shipName,
      },
    ];
    setLog(entries);
    rerender();

    if (ai.outcome.gameOver) {
      onGameOver('B', entries);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <p
        className={`rounded px-4 py-2 font-semibold ${
          playerTurn ? 'bg-sky-100 text-sky-800' : 'bg-amber-100 text-amber-800'
        }`}
      >
        {playerTurn
          ? 'Your turn, pick a target on the enemy board'
          : 'Enemy is targeting…'}
      </p>

      <div className="flex w-full flex-col items-center gap-8 md:flex-row md:items-start md:justify-center">
        <Board
          title="Your fleet"
          cells={getOwnBoardView(session.boardA, session.fleetA)}
        />
        <Board
          title="Enemy waters"
          cells={getFogOfWarView(session.boardB)}
          // already-attacked cells are blocked here, the engine would otherwise still pass the turn
          isCellDisabled={(cell) => !playerTurn || cell.status !== 'empty'}
          onCellClick={handleAttack}
        />
      </div>

      <AttackLog entries={log} />
    </div>
  );
}
