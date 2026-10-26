import { useReducer, useState } from 'react';
import { getFogOfWarView, getOwnBoardView } from 'engine';
import type { Fleet, GameSession, Side } from 'engine';
import { Board } from '../components/Board';
import { AttackLog, type LogEntry } from '../components/AttackLog';

const AI_TURN_DELAY_MS = 500; // short pause so the player can see their shot land before the AI fires

interface GameScreenProps {
  session: GameSession; // player is side A, AI is side B
  onGameOver: (winner: Side, log: LogEntry[]) => void;
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// sunk ships are public knowledge, so this is safe to show for the enemy fleet too
function afloat(fleet: Fleet): string {
  const ships = fleet.getShips();
  const remaining = ships.filter((ship) => !ship.isSunk()).length;
  return `${remaining} of ${ships.length} ships afloat`;
}

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
    <div className="grid gap-10 md:grid-cols-[minmax(0,22rem)_minmax(0,34rem)]">
      <div className="space-y-8">
        <div aria-live="polite">
          <p className="flex items-center gap-3 font-display text-lg">
            <span
              aria-hidden="true"
              className={`size-2.5 rounded-full ${
                playerTurn ? 'bg-reactor' : 'bg-plot motion-safe:animate-pulse'
              }`}
            />
            {playerTurn ? 'Your shot' : 'Enemy is aiming'}
          </p>
          <p className="mt-1 pl-5.5 text-plot">
            {playerTurn
              ? 'Pick a square on the enemy grid.'
              : 'The enemy picks its target.'}
          </p>
        </div>

        <Board
          title="Your fleet"
          meta={afloat(session.fleetA)}
          cells={getOwnBoardView(session.boardA, session.fleetA)}
          animate
        />

        <AttackLog entries={log} className="hidden md:block" />
      </div>

      <div className="space-y-8 max-md:-order-1 md:pt-14">
        <Board
          title="Enemy fleet"
          meta={afloat(session.fleetB)}
          cells={getFogOfWarView(session.boardB)}
          animate
          // already-attacked cells are blocked here, the engine would otherwise still pass the turn
          isCellDisabled={(cell) => !playerTurn || cell.status !== 'empty'}
          onCellClick={handleAttack}
        />
        <AttackLog entries={log} className="md:hidden" />
      </div>
    </div>
  );
}
