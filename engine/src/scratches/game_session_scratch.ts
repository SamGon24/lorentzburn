import { GameSession } from '../game_session';
import { RandomHunterOpponent } from '../opponent/random_hunter';
import { ProbabilityDensityOpponent } from '../opponent/probability_density';
import { FLEET_COMPOSITION } from '../fleet';

// scenario 1: AI vs AI, fully automatic
async function runAiVsAi() {
  console.log('--- AI vs AI ---');
  const shipSizes = FLEET_COMPOSITION.map((s) => s.size);

  const session = new GameSession({
    sideA: new RandomHunterOpponent(),
    sideB: new ProbabilityDensityOpponent(shipSizes),
  });

  let turns = 0;
  while (!session.isGameOver() && turns < 400) {
    const side = session.getCurrentTurn();
    const { move, outcome } = await session.playAiTurn(side);
    console.log(`Turn ${turns + 1} (side ${side}): fired at (${move.row},${move.col}) -> ${outcome.result}`);
    turns++;
  }

  console.log(`Game over. Winner: side ${session.getWinner()}, total turns: ${turns}\n`);
}

// scenario 2: simulated player vs AI, player moves driven manually
async function runPlayerVsAi() {
  console.log('--- Player vs AI ---');
  const shipSizes = FLEET_COMPOSITION.map((s) => s.size);

  const session = new GameSession({
    sideA: 'player',
    sideB: new ProbabilityDensityOpponent(shipSizes),
  });

  // side A is player-controlled, so its fleet must be placed manually
  // reuse the AI's random placement helper just for this scratch test's convenience
  const { randomlyPlaceFleet } = await import('../fleet_setup');
  randomlyPlaceFleet(session.fleetA, session.boardA);

  let turns = 0;
  while (!session.isGameOver() && turns < 400) {
    const side = session.getCurrentTurn();

    if (side === 'A') {
      // simulate the "player" firing at a random cell on the AI's board
      let row: number, col: number;
      do {
        row = Math.floor(Math.random() * session.boardB.size);
        col = Math.floor(Math.random() * session.boardB.size);
      } while (session.boardB.getCell(row, col).status !== 'empty');

      const outcome = session.attackAsA(row, col);
      console.log(`Turn ${turns + 1} (player): fired at (${row},${col}) -> ${outcome.result}`);
    } else {
      const { move, outcome } = await session.playAiTurn('B');
      console.log(`Turn ${turns + 1} (AI): fired at (${move.row},${move.col}) -> ${outcome.result}`);
    }

    turns++;
  }

  console.log(`Game over. Winner: side ${session.getWinner()}, total turns: ${turns}\n`);
}

// scenario 3: confirm turn enforcement actually throws when violated
async function testTurnEnforcement() {
  console.log('--- Turn enforcement check ---');
  const session = new GameSession({
    sideA: 'player',
    sideB: 'player',
  });

  const { randomlyPlaceFleet } = await import('../fleet_setup');
  randomlyPlaceFleet(session.fleetA, session.boardA);
  randomlyPlaceFleet(session.fleetB, session.boardB);

  session.attackAsA(0, 0); // valid, it's A's turn

  try {
    session.attackAsA(1, 1); // invalid, should now be B's turn
    console.log('ERROR: should have thrown');
  } catch (e) {
    console.log('Correctly threw on out-of-turn attack:', (e as Error).message);
  }
}

async function main() {
  await runAiVsAi();
  await runPlayerVsAi();
  await testTurnEnforcement();
}

main();