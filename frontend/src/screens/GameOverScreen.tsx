import { getOwnBoardView } from 'engine';
import type { GameSession, Side } from 'engine';
import { Board } from '../components/Board';
import { AttackLog, type LogEntry } from '../components/AttackLog';

interface GameOverScreenProps {
  session: GameSession;
  winner: Side;
  log: LogEntry[];
  onRestart: () => void;
}

// final result, with both fleets revealed
export function GameOverScreen({
  session,
  winner,
  log,
  onRestart,
}: GameOverScreenProps) {
  const playerWon = winner === 'A';
  const playerShots = log.filter((entry) => entry.side === 'A');
  const playerHits = playerShots.filter(
    (entry) => entry.result === 'hit' || entry.result === 'sunk'
  ).length;
  const accuracy = playerShots.length
    ? Math.round((playerHits / playerShots.length) * 100)
    : 0;

  return (
    <div className="space-y-12">
      <div className="max-w-2xl">
        <h2
          className={`font-display text-3xl leading-tight md:text-5xl ${
            playerWon ? 'text-reactor' : 'text-bone'
          }`}
        >
          {playerWon ? 'Enemy fleet destroyed' : 'Your fleet was destroyed'}
        </h2>
        <p className="mt-4 text-lg text-plot">
          You fired {playerShots.length} shots and hit with {accuracy}% of them.
        </p>
        <button
          type="button"
          onClick={onRestart}
          className="chamfer mt-6 bg-reactor px-8 py-3 font-semibold text-void hover:brightness-110"
        >
          Play again
        </button>
      </div>

      <div className="grid gap-10 md:grid-cols-2">
        <Board
          title="Your fleet"
          cells={getOwnBoardView(session.boardA, session.fleetA)}
        />
        <Board
          title="Enemy fleet"
          meta="Positions revealed"
          cells={getOwnBoardView(session.boardB, session.fleetB)}
        />
      </div>

      <AttackLog entries={log} className="max-w-xl" />
    </div>
  );
}
