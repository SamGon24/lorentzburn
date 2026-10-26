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
}

function describe(entry: LogEntry): string {
  const attacker = entry.side === 'A' ? 'You' : 'Enemy';
  const coord = formatCoord(entry.row, entry.col);

  if (entry.result === 'sunk') {
    const owner = entry.side === 'A' ? 'their' : 'your';
    return `${attacker} fired at ${coord}, sunk ${owner} ${entry.shipName}!`;
  }
  return `${attacker} fired at ${coord}, ${entry.result}`;
}

const RESULT_CLASSES: Record<AttackResult, string> = {
  hit: 'text-red-600',
  sunk: 'font-semibold text-red-700',
  miss: 'text-slate-500',
  'already-attacked': 'text-slate-400',
};

// running feed of attack results, newest first
export function AttackLog({ entries }: AttackLogProps) {
  return (
    <div className="w-full max-w-md">
      <h2 className="mb-2 text-lg font-semibold">Battle log</h2>
      {entries.length === 0 ? (
        <p className="text-sm text-slate-500">No shots fired yet.</p>
      ) : (
        <ol className="max-h-64 space-y-1 overflow-y-auto rounded border border-slate-200 bg-white p-2 text-sm">
          {entries
            .map((entry, index) => (
              <li key={index} className={RESULT_CLASSES[entry.result]}>
                <span className="mr-2 text-slate-400">{index + 1}.</span>
                {describe(entry)}
              </li>
            ))
            .reverse()}
        </ol>
      )}
    </div>
  );
}
