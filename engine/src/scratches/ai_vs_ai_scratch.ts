import { Board } from '../board';
import { FLEET_COMPOSITION } from '../fleet';
import { resolveAttack } from '../attack';
import { getFogOfWarView } from '../fog_of_war';
import { Opponent } from '../opponent/opponent';
import { RandomHunterOpponent } from '../opponent/random_hunter';
import { ProbabilityDensityOpponent } from '../opponent/probability_density';
import { setupRandomFleet } from './simulation_helpers';

// plays a fixed number of AI vs AI matches, alternating turns, and reports the winner and turn count
async function playMatch(nameA: string, opponentA: Opponent, nameB: string, opponentB: Opponent) {
  const boardA = new Board(10); // A's board, targeted by B
  const boardB = new Board(10); // B's board, targeted by A
  const fleetA = setupRandomFleet(boardA);
  const fleetB = setupRandomFleet(boardB);

  let turns = 0;
  const maxTurns = 400;
  let winner: string | null = null;

  while (turns < maxTurns) {
    // A attacks B's board
    const viewB = getFogOfWarView(boardB);
    const moveA = await opponentA.getMove(viewB);
    const outcomeA = resolveAttack(boardB, fleetB, moveA.row, moveA.col);
    opponentA.registerResult?.(moveA, outcomeA.result === 'hit' || outcomeA.result === 'sunk', outcomeA.result === 'sunk');
    turns++;
    if (fleetB.allSunk()) {
      winner = nameA;
      break;
    }

    // B attacks A's board
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

async function runMatches(numMatches: number) {
  const shipSizes = FLEET_COMPOSITION.map((s) => s.size);
  const wins: Record<string, number> = { RandomHunter: 0, ProbabilityDensity: 0 };
  let totalTurns = 0;

  for (let i = 0; i < numMatches; i++) {
    const result = await playMatch(
      'RandomHunter',
      new RandomHunterOpponent(),
      'ProbabilityDensity',
      new ProbabilityDensityOpponent(shipSizes)
    );
    if (result.winner) {
      wins[result.winner]++;
    }
    totalTurns += result.turns;
  }

  console.log(`\nRandomHunter vs ProbabilityDensity over ${numMatches} matches`);
  console.log(`RandomHunter wins: ${wins.RandomHunter} (${((wins.RandomHunter / numMatches) * 100).toFixed(1)}%)`);
  console.log(`ProbabilityDensity wins: ${wins.ProbabilityDensity} (${((wins.ProbabilityDensity / numMatches) * 100).toFixed(1)}%)`);
  console.log(`Average total turns per match: ${(totalTurns / numMatches).toFixed(1)}`);
}

runMatches(50);