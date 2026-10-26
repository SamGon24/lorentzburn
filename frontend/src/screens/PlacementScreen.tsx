import { useEffect, useState } from 'react';
import {
  Board as EngineBoard,
  Fleet,
  FLEET_COMPOSITION,
  Ship,
  canPlaceShip,
  randomlyPlaceFleet,
} from 'engine';
import type { FullCell, GameRules, Orientation, ShipCoordinate } from 'engine';
import { Board } from '../components/Board';
import type { CellHighlight } from '../components/Cell';
import { coordKey } from '../lib/coords';

interface PlacementScreenProps {
  board: EngineBoard; // the player's session board, used for bounds checks
  rules: GameRules;
  onConfirm: (ships: Ship[]) => void;
}

// builds an own-board style view from the ships placed so far
function buildCells(size: number, ships: Ship[]): FullCell[][] {
  const occupied = new Map<string, string>();
  for (const ship of ships) {
    for (const c of ship.coordinates)
      occupied.set(coordKey(c.row, c.col), ship.id);
  }

  return Array.from({ length: size }, (_, row) =>
    Array.from({ length: size }, (_, col) => {
      const shipId = occupied.get(coordKey(row, col));
      return { row, col, status: shipId ? 'ship' : 'empty', shipId };
    })
  );
}

// lets the player place the standard fleet one ship at a time, in FLEET_COMPOSITION order
export function PlacementScreen({
  board,
  rules,
  onConfirm,
}: PlacementScreenProps) {
  const [ships, setShips] = useState<Ship[]>([]);
  const [orientation, setOrientation] = useState<Orientation>('horizontal');
  const [hover, setHover] = useState<ShipCoordinate | null>(null);
  const [error, setError] = useState<string | null>(null);

  const nextShip = FLEET_COMPOSITION[ships.length];
  const fullyPlaced = ships.length === FLEET_COMPOSITION.length;

  const rotate = () =>
    setOrientation((o) => (o === 'horizontal' ? 'vertical' : 'horizontal'));

  // 'r' toggles orientation, same as the rotate button
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'r' || e.key === 'R') rotate();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const buildShip = (origin: ShipCoordinate) =>
    new Ship(
      `player-${nextShip.name}`,
      nextShip.name,
      nextShip.size,
      origin,
      orientation
    );

  // preview of the next ship at the hovered cell, validated with the engine's own rules
  const preview = hover && nextShip ? buildShip(hover) : null;
  const previewValid = preview
    ? canPlaceShip(board, preview, ships, rules)
    : false;
  const highlights = new Map<string, CellHighlight>();
  if (preview) {
    for (const c of preview.coordinates) {
      if (board.isInBounds(c.row, c.col)) {
        highlights.set(
          coordKey(c.row, c.col),
          previewValid ? 'valid' : 'invalid'
        );
      }
    }
  }

  const handleCellClick = (row: number, col: number) => {
    if (!nextShip) return;
    const ship = buildShip({ row, col });
    if (!canPlaceShip(board, ship, ships, rules)) {
      setError(
        `The ${nextShip.name} can't go there, it's out of bounds or overlapping another ship.`
      );
      return;
    }
    setShips([...ships, ship]);
    setError(null);
  };

  const handleRandomize = () => {
    const tempBoard = new EngineBoard(board.size);
    const tempFleet = new Fleet(tempBoard, rules);
    randomlyPlaceFleet(tempFleet, tempBoard, rules);
    setShips([...tempFleet.getShips()]);
    setError(null);
  };

  const handleUndo = () => {
    setShips(ships.slice(0, -1));
    setError(null);
  };

  const handleClear = () => {
    setShips([]);
    setError(null);
  };

  return (
    <div className="flex flex-col items-center gap-6 md:flex-row md:items-start md:justify-center">
      <Board
        title="Place your fleet"
        cells={buildCells(board.size, ships)}
        highlights={highlights}
        isCellDisabled={() => fullyPlaced}
        onCellClick={handleCellClick}
        onCellHover={(row, col) => setHover({ row, col })}
        onMouseLeave={() => setHover(null)}
      />

      <div className="w-full max-w-xs space-y-4">
        <div>
          <h2 className="mb-2 text-lg font-semibold">Fleet</h2>
          <ul className="space-y-1 text-sm">
            {FLEET_COMPOSITION.map((def, index) => (
              <li
                key={def.name}
                className={
                  index < ships.length
                    ? 'text-slate-400 line-through'
                    : index === ships.length
                      ? 'font-semibold text-sky-700'
                      : ''
                }
              >
                {def.name} ({def.size})
              </li>
            ))}
          </ul>
        </div>

        {!fullyPlaced && (
          <p className="text-sm">
            Placing <span className="font-semibold">{nextShip.name}</span>,{' '}
            {orientation}.
          </p>
        )}
        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={rotate}
            disabled={fullyPlaced}
            className="rounded bg-slate-200 px-3 py-1.5 text-sm hover:bg-slate-300 disabled:opacity-50"
          >
            Rotate (R)
          </button>
          <button
            type="button"
            onClick={handleUndo}
            disabled={ships.length === 0}
            className="rounded bg-slate-200 px-3 py-1.5 text-sm hover:bg-slate-300 disabled:opacity-50"
          >
            Undo
          </button>
          <button
            type="button"
            onClick={handleClear}
            disabled={ships.length === 0}
            className="rounded bg-slate-200 px-3 py-1.5 text-sm hover:bg-slate-300 disabled:opacity-50"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={handleRandomize}
            className="rounded bg-slate-200 px-3 py-1.5 text-sm hover:bg-slate-300"
          >
            Randomize
          </button>
        </div>

        <button
          type="button"
          onClick={() => onConfirm(ships)}
          disabled={!fullyPlaced}
          className="w-full rounded bg-sky-600 px-4 py-2 font-semibold text-white hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {fullyPlaced ? 'Start match' : 'Place all ships to start'}
        </button>
      </div>
    </div>
  );
}
