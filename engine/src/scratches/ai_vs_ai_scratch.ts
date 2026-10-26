// engine/src/scratches/ai_vs_ai_scratch.ts
import { Board } from '../board';
import { Fleet, FLEET_COMPOSITION } from '../fleet';
import { resolveAttack } from '../attack';
import { getFogOfWarView } from '../fog_of_war';
import { Opponent } from '../opponent/opponent';
import { RandomHunterOpponent } from '../opponent/random_hunter';
import { HuntTargetOpponent } from '../opponent/hunt_target';
import { ProbabilityDensityOpponent } from '../opponent/probability_density';
import { randomlyPlaceFleet } from '../fleet_setup';

// plays a single match, alternating turns, returns the winner's name and total turns taken
async function playMatch(nameA: string, opponentA: Opponent, nameB: string, opponentB: Opponent) {
  const boardA = new Board(10); // A's board, targeted by B
  const boardB = new Board(10); // B's board, targeted by A
  const fleetA = new Fleet(boardA);
  const fleetB = new Fleet(boardB);
  randomlyPlaceFleet(fleetA, boardA);
  randomlyPlaceFleet(fleetB, boardB);

  let turns = 0;
  const maxTurns = 400;
  let winner: string | null = null;

  while (turns < maxTurns) {
    const viewB = getFogOfWarView(boardB);
    const moveA = await opponentA.getMove(viewB);
    const outcomeA = resolveAttack(boardB, fleetB, moveA.row, moveA.col);
    opponentA.registerResult?.(moveA, outcomeA.result === 'hit' || outcomeA.result === 'sunk', outcomeA.result === 'sunk');
    turns++;
    if (fleetB.allSunk()) {
      winner = nameA;
      break;
    }

    const viewA = getFogOfWarView(boardA);
    const moveB = await opponentB.getMove(viewA);
    const outcomeB = resolveAttack(boardA, fleetA, moveB.row, moveB.col);
    opponentB.registerResult?.(moveB, outcomeB.result === 'hit' || outcomeB.result === 'sunk', outcomeB.result === 'sunk');
    turns++;
    if (fleetA.allSunk()) {
      winner = nameB;
      break;
    }
  }

  return { winner, turns };
}

// runs a full series between two named opponent factories, reports win rates and average turns
async function runSeries(
  nameA: string,
  makeA: () => Opponent,
  nameB: string,
  makeB: () => Opponent,
  numMatches: number
) {
  const wins: Record<string, number> = { [nameA]: 0, [nameB]: 0 };
  let totalTurns = 0;

  for (let i = 0; i < numMatches; i++) {
    const result = await playMatch(nameA, makeA(), nameB, makeB());
    if (result.winner) {
      wins[result.winner]++;
    }
    totalTurns += result.turns;
  }

  console.log(`\n=== ${nameA} vs ${nameB} (${numMatches} matches) ===`);
  console.log(`${nameA} wins: ${wins[nameA]} (${((wins[nameA] / numMatches) * 100).toFixed(1)}%)`);
  console.log(`${nameB} wins: ${wins[nameB]} (${((wins[nameB] / numMatches) * 100).toFixed(1)}%)`);
  console.log(`Average total turns per match: ${(totalTurns / numMatches).toFixed(1)}`);
}

async function runSemifinals(numMatches: number) {
  const shipSizes = FLEET_COMPOSITION.map((s) => s.size);

  // semifinal 1: ProbabilityDensity vs RandomHunter
  await runSeries(
    'ProbabilityDensity',
    () => new ProbabilityDensityOpponent(shipSizes),
    'RandomHunter',
    () => new RandomHunterOpponent(),
    numMatches
  );

  // semifinal 2: HuntTarget vs ProbabilityDensity
  await runSeries(
    'HuntTarget',
    () => new HuntTargetOpponent(),
    'ProbabilityDensity',
    () => new ProbabilityDensityOpponent(shipSizes),
    numMatches
  );
}

runSemifinals(50);