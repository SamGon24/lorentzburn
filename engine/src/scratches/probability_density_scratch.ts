import { Board } from '../board';
import { Ship } from '../ship';
import { Fleet } from '../fleet';
import { resolveAttack } from '../attack';
import { getFogOfWarView } from '../fog_of_war';
import { ProbabilityDensityOpponent } from '../opponent/probability_density';
import { FLEET_COMPOSITION } from '../fleet';

function setupRandomFleet(board: Board): Fleet {
  const fleet = new Fleet(board);
  for (const shipDef of FLEET_COMPOSITION) {
    let placed = false;
    while (!placed) {
      const row = Math.floor(Math.random() * board.size);
      const col = Math.floor(Math.random() * board.size);
      const orientation = Math.random() < 0.5 ? 'horizontal' : 'vertical';
      try {
        fleet.placeShip(new Ship(shipDef.name, shipDef.name, shipDef.size, { row, col }, orientation));
        placed = true;
      } catch {
        // invalid placement, try again
      }
    }
  }
  return fleet;
}

async function runGame() {
  const board = new Board(10);
  const fleet = setupRandomFleet(board);

  const shipSizes = FLEET_COMPOSITION.map((s) => s.size);
  const opponent = new ProbabilityDensityOpponent(shipSizes);

  let turns = 0;
  const maxTurns = 200; // safety cap in case something loops forever

  while (!fleet.allSunk() && turns < maxTurns) {
    const boardView = getFogOfWarView(board);
    const move = await opponent.getMove(boardView);
    const outcome = resolveAttack(board, fleet, move.row, move.col);

    opponent.registerResult?.(
      move,
      outcome.result === 'hit' || outcome.result === 'sunk',
      outcome.result === 'sunk'
    );

    turns++;
    console.log(
      `Turn ${turns}: fired at (${move.row},${move.col}) -> ${outcome.result}` +
        (outcome.shipName ? ` (${outcome.shipName})` : '')
    );
  }

  console.log(`\nGame over in ${turns} turns. All ships sunk: ${fleet.allSunk()}`);
}

runGame();