import { Board } from '../board';
import { Ship } from '../ship';
import { Fleet } from '../fleet';
import { resolveAttack } from '../attack';
import { getFogOfWarView } from '../fog_of_war';
import { ProbabilityDensityOpponent } from '../opponent/probability_density';
import { FLEET_COMPOSITION } from '../fleet';

// sets up a board with a fixed fleet layout to attack against
function setupTargetFleet(board: Board): Fleet {
  const fleet = new Fleet(board);
  fleet.placeShip(new Ship('s1', 'Dreadnought', 5, { row: 0, col: 0 }, 'horizontal'));
  fleet.placeShip(new Ship('s2', 'Cruiser', 4, { row: 2, col: 0 }, 'horizontal'));
  fleet.placeShip(new Ship('s3', 'Frigate', 3, { row: 4, col: 0 }, 'horizontal'));
  fleet.placeShip(new Ship('s4', 'Corvette', 3, { row: 6, col: 0 }, 'horizontal'));
  fleet.placeShip(new Ship('s5', 'Interceptor', 2, { row: 8, col: 0 }, 'horizontal'));
  return fleet;
}

async function runGame() {
  const board = new Board(10);
  const fleet = setupTargetFleet(board);

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