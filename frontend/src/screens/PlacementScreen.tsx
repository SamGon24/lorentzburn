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

const SECONDARY_BUTTON =
  'rounded-sm border border-grid px-3 py-1.5 text-sm hover:border-plot disabled:cursor-not-allowed disabled:opacity-40';

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
        `The ${nextShip.name} doesn't fit there. It would leave the grid or overlap another ship.`
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
    <div className="grid gap-10 md:grid-cols-[minmax(0,34rem)_minmax(0,20rem)]">
      <Board
        cells={buildCells(board.size, ships)}
        highlights={highlights}
        isCellDisabled={() => fullyPlaced}
        onCellClick={handleCellClick}
        onCellHover={(row, col) => setHover({ row, col })}
        onMouseLeave={() => setHover(null)}
      />

      <div className="space-y-6 md:pt-8">
        <div>
          <h2 className="font-display text-lg">Position your fleet</h2>
          <p className="mt-2 text-plot">
            {fullyPlaced
              ? 'Every ship is in place. Start the match when you are ready.'
              : `Click a square to place your ${nextShip.name}. Press R to rotate it.`}
          </p>
        </div>

        <ul className="space-y-2.5">
          {FLEET_COMPOSITION.map((def, index) => {
            const placed = index < ships.length;
            const current = index === ships.length;
            return (
              <li
                key={def.name}
                className={`flex items-center justify-between gap-4 ${
                  placed
                    ? 'text-plot'
                    : current
                      ? 'font-semibold'
                      : 'text-plot/70'
                }`}
              >
                <span>
                  {def.name}
                  {placed && <span className="sr-only">, placed</span>}
                </span>
                <span
                  aria-hidden="true"
                  className={`h-2 rounded-full ${
                    placed ? 'bg-plot' : current ? 'bg-bone' : 'bg-grid'
                  }`}
                  style={{ width: `${def.size * 1.25}rem` }}
                />
              </li>
            );
          })}
        </ul>

        {error && (
          <p role="alert" className="text-sm text-reactor">
            {error}
          </p>
        )}

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={rotate}
            disabled={fullyPlaced}
            className={SECONDARY_BUTTON}
          >
            Rotate to {orientation === 'horizontal' ? 'vertical' : 'horizontal'}
          </button>
          <button
            type="button"
            onClick={handleUndo}
            disabled={ships.length === 0}
            className={SECONDARY_BUTTON}
          >
            Undo
          </button>
          <button
            type="button"
            onClick={handleClear}
            disabled={ships.length === 0}
            className={SECONDARY_BUTTON}
          >
            Clear
          </button>
          <button
            type="button"
            onClick={handleRandomize}
            className={SECONDARY_BUTTON}
          >
            Place randomly
          </button>
        </div>

        <button
          type="button"
          onClick={() => onConfirm(ships)}
          disabled={!fullyPlaced}
          className="chamfer w-full bg-reactor px-4 py-3 font-semibold text-void hover:brightness-110 disabled:cursor-not-allowed disabled:bg-grid disabled:text-plot"
        >
          Start match
        </button>
      </div>
    </div>
  );
}
