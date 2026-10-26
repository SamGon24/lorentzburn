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
  const playerShots = log.filter((entry) => entry.side === 'A').length;

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="text-center">
        <h2
          className={`text-3xl font-bold ${playerWon ? 'text-emerald-600' : 'text-red-600'}`}
        >
          {playerWon ? 'Victory!' : 'Defeat'}
        </h2>
        <p className="mt-1 text-slate-600">
          {playerWon
            ? `You destroyed the enemy fleet in ${playerShots} shots.`
            : 'The enemy destroyed your fleet.'}
        </p>
        <button
          type="button"
          onClick={onRestart}
          className="mt-4 rounded bg-sky-600 px-6 py-2 font-semibold text-white hover:bg-sky-700"
        >
          Play again
        </button>
      </div>

      <div className="flex w-full flex-col items-center gap-8 md:flex-row md:items-start md:justify-center">
        <Board
          title="Your fleet"
          cells={getOwnBoardView(session.boardA, session.fleetA)}
        />
        <Board
          title="Enemy fleet"
          cells={getOwnBoardView(session.boardB, session.fleetB)}
        />
      </div>

      <AttackLog entries={log} />
    </div>
  );
}
