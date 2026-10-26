import { FLEET_COMPOSITION } from 'engine';
import { placementHeatmap } from '../lib/heatmap';
import { formatCoord } from '../lib/coords';

const BOARD_SIZE = 10;
const HEAT = placementHeatmap(
  BOARD_SIZE,
  FLEET_COMPOSITION.map((ship) => ship.size)
);
const MIN_HEAT = Math.min(...HEAT.flat());
const MAX_HEAT = Math.max(...HEAT.flat());

const TURN_STEPS = [
  'You fire at a square on the enemy grid. The engine checks it against the enemy fleet and marks a hit or a miss.',
  'The enemy only gets the fog-of-war view of your grid: hits and misses, never ship positions. The board itself never stores where ships are, so nothing can leak.',
  'The AI scores every open square by counting how many ways each ship it hasn’t sunk could still fit over it. After a hit, only placements that pass through that hit count, so it closes in on the damaged ship.',
  'It fires at the highest-scoring square, learns whether it hit, and the turn passes back to you.',
];

const NEXT_STEPS = [
  {
    title: 'An opponent powered by Claude',
    body: 'An AI that reads the board each turn and reasons about where your ships are, using the Claude API.',
  },
  {
    title: 'Choose your opponent',
    body: 'Pick who you play against before a match. The engine already has three: random shots, hunt-and-target, and the probability-density AI you face now.',
  },
  {
    title: 'Rule variants',
    body: 'A stricter mode where ships can’t touch, not even diagonally. The engine and the AI already support it.',
  },
  {
    title: 'Online multiplayer',
    body: 'Play against another person in real time.',
  },
];

// explains the turn logic and the AI, and lists what's planned
export function HowItWorks() {
  return (
    <section
      aria-labelledby="how-it-works"
      className="mx-auto mt-24 max-w-6xl border-t border-grid pt-12"
    >
      <h2 id="how-it-works" className="font-display text-2xl">
        How it works
      </h2>

      <div className="mt-8 grid gap-12 md:grid-cols-[minmax(0,36rem)_minmax(0,18rem)] md:gap-16">
        <div>
          <h3 className="text-lg font-semibold">One turn</h3>
          <ol className="mt-4 space-y-4">
            {TURN_STEPS.map((step, index) => (
              <li key={index} className="grid grid-cols-[2rem_1fr] gap-2">
                <span className="font-display text-reactor">{index + 1}</span>
                <p className="leading-relaxed text-bone/90">{step}</p>
              </li>
            ))}
          </ol>
        </div>

        <figure>
          <div
            className="grid gap-px bg-void"
            style={{
              gridTemplateColumns: `repeat(${BOARD_SIZE}, minmax(0, 1fr))`,
            }}
            role="img"
            aria-label="Heatmap of the enemy grid. Squares near the center score highest, edges and corners lowest."
          >
            {HEAT.flatMap((row, r) =>
              row.map((value, c) => (
                <div
                  key={formatCoord(r, c)}
                  className="aspect-square"
                  style={{
                    background: `color-mix(in oklab, var(--color-reactor) ${Math.round(
                      ((value - MIN_HEAT) / (MAX_HEAT - MIN_HEAT)) * 100
                    )}%, var(--color-panel))`,
                  }}
                />
              ))
            )}
          </div>
          <figcaption className="mt-3 text-sm leading-relaxed text-plot">
            Where the AI expects your ships before its first shot. The brighter
            the square, the more ways a ship could cover it, so the center gets
            searched first and the corners last.
          </figcaption>
        </figure>
      </div>

      <div className="mt-16">
        <h3 className="text-lg font-semibold">What’s next</h3>
        <ul className="mt-4 grid gap-x-12 gap-y-6 md:grid-cols-2">
          {NEXT_STEPS.map((item) => (
            <li
              key={item.title}
              className="max-w-md border-l-2 border-grid pl-4"
            >
              <p className="font-semibold">{item.title}</p>
              <p className="mt-1 leading-relaxed text-plot">{item.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
