import type { AttackResult, Side } from 'engine';
import { formatCoord } from '../lib/coords';

export interface LogEntry {
  side: Side;
  row: number;
  col: number;
  result: AttackResult;
  shipName?: string;
}

interface AttackLogProps {
  entries: LogEntry[];
  className?: string;
}

function describe(entry: LogEntry): string {
  if (entry.result === 'sunk') {
    const owner = entry.side === 'A' ? 'their' : 'your';
    return `Sank ${owner} ${entry.shipName}`;
  }
  if (entry.result === 'hit') return 'Hit';
  if (entry.result === 'miss') return 'Miss';
  return 'Already targeted';
}

const RESULT_CLASSES: Record<AttackResult, string> = {
  hit: 'text-reactor',
  sunk: 'font-semibold text-reactor',
  miss: 'text-plot',
  'already-attacked': 'text-plot',
};

// running feed of attack results, newest first
export function AttackLog({ entries, className = '' }: AttackLogProps) {
  return (
    <section className={`w-full ${className}`}>
      <h2 className="mb-3 text-lg font-semibold">Combat log</h2>
      {entries.length === 0 ? (
        <p className="text-sm text-plot">
          Shots from both fleets show up here.
        </p>
      ) : (
        <ol className="max-h-72 overflow-y-auto border-t border-grid text-sm">
          {entries
            .map((entry, index) => (
              <li
                key={index}
                className="grid grid-cols-[3.5rem_2.5rem_1fr] gap-2 border-b border-grid/60 py-1.5 tabular-nums"
              >
                <span
                  className={entry.side === 'A' ? 'text-bone' : 'text-plot'}
                >
                  {entry.side === 'A' ? 'You' : 'Enemy'}
                </span>
                <span>{formatCoord(entry.row, entry.col)}</span>
                <span className={RESULT_CLASSES[entry.result]}>
                  {describe(entry)}
                </span>
              </li>
            ))
            .reverse()}
        </ol>
      )}
    </section>
  );
}
