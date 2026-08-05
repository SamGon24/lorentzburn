import { Board } from '../board';
import { Ship } from '../ship';
import { Fleet, FLEET_COMPOSITION } from '../fleet';
import { resolveAttack } from '../attack';
import { getFogOfWarView } from '../fog_of_war';
import { ProbabilityDensityOpponent } from '../opponent/probability_density';

// places the full fleet at random valid positions
function setupRandomFleet(board: Board): Fleet {
  const fleet = new Fleet(board);
  for (const shipDef of FLEET_COMPOSITION) {
    let placed = false;
    while (!placed) {
      const row = Math.floor(Math.random() * board.size);
      const col = Math.floor(Math.random() * board.size);
      const orientation = Math.random() < 0.5 ? 'horizontal' : 'vertical';
      try {
        fleet.placeShip(
          new Ship(shipDef.name, shipDef.name, shipDef.size, { row, col }, orientation as 'horizontal' | 'vertical')
        );
        placed = true;
      } catch {
        // invalid spot, retry
      }
    }
  }
  return fleet;
}

interface GameResult {
  turns: number;
  sinkOrder: string[]; // ship names in the order they were sunk
}

// plays one full game and records the outcome
async function playGame(): Promise<GameResult> {
  const board = new Board(10);
  const fleet = setupRandomFleet(board);
  const shipSizes = FLEET_COMPOSITION.map((s) => s.size);
  const opponent = new ProbabilityDensityOpponent(shipSizes);

  let turns = 0;
  const sinkOrder: string[] = [];
  const maxTurns = 200;

  while (!fleet.allSunk() && turns < maxTurns) {
    const boardView = getFogOfWarView(board);
    const move = await opponent.getMove(boardView);
    const outcome = resolveAttack(board, fleet, move.row, move.col);

    opponent.registerResult?.(
      move,
      outcome.result === 'hit' || outcome.result === 'sunk',
      outcome.result === 'sunk'
    );

    if (outcome.result === 'sunk' && outcome.shipName) {
      sinkOrder.push(outcome.shipName);
    }

    turns++;
  }

  return { turns, sinkOrder };
}

async function runStats(numGames: number) {
  const results: GameResult[] = [];

  for (let i = 0; i < numGames; i++) {
    results.push(await playGame());
  }

  const turnCounts = results.map((r) => r.turns);
  const avgTurns = turnCounts.reduce((a, b) => a + b, 0) / numGames;
  const minTurns = Math.min(...turnCounts);
  const maxTurns = Math.max(...turnCounts);

  // count how often each ship was the FIRST one sunk
  const firstSunkCounts: Record<string, number> = {};
  for (const result of results) {
    const first = result.sinkOrder[0];
    if (first) {
      firstSunkCounts[first] = (firstSunkCounts[first] || 0) + 1;
    }
  }

  // count how often each ship was the LAST one sunk
  const lastSunkCounts: Record<string, number> = {};
  for (const result of results) {
    const last = result.sinkOrder[result.sinkOrder.length - 1];
    if (last) {
      lastSunkCounts[last] = (lastSunkCounts[last] || 0) + 1;
    }
  }

  console.log(`\n ProbabilityDensityOpponent stats over ${numGames} games`);
  console.log(`Average turns to win: ${avgTurns.toFixed(1)}`);
  console.log(`Min turns: ${minTurns}, Max turns: ${maxTurns}`);

  console.log('\nFirst ship sunk (frequency):');
  for (const [name, count] of Object.entries(firstSunkCounts).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${name}: ${count} (${((count / numGames) * 100).toFixed(1)}%)`);
  }

  console.log('\nLast ship sunk (frequency):');
  for (const [name, count] of Object.entries(lastSunkCounts).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${name}: ${count} (${((count / numGames) * 100).toFixed(1)}%)`);
  }
}

runStats(200);