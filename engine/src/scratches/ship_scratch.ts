import { Board } from '../board';
import { Ship } from '../ship';
import { Fleet, FLEET_COMPOSITION } from '../fleet';

const board = new Board(10);
const fleet = new Fleet(board);

const dreadnought = new Ship('s1', 'Dreadnought', 5, { row: 0, col: 0 }, 'horizontal');
fleet.placeShip(dreadnought);
console.log('Placed Dreadnought, ships count (expect 1):', fleet.getShips().length);

try {
  const overlapping = new Ship('s2', 'Cruiser', 4, { row: 0, col: 2 }, 'horizontal');
  fleet.placeShip(overlapping);
  console.log('ERROR: overlapping placement should have thrown');
} catch (e) {
  console.log('Correctly rejected overlap:', (e as Error).message);
}

try {
  const touching = new Ship('s3', 'Frigate', 3, { row: 1, col: 0 }, 'horizontal');
  fleet.placeShip(touching);
  console.log('ERROR: touching placement should have thrown');
} catch (e) {
  console.log('Correctly rejected adjacency:', (e as Error).message);
}

const cruiser = new Ship('s4', 'Cruiser', 4, { row: 3, col: 0 }, 'horizontal');
fleet.placeShip(cruiser);

const frigate = new Ship('s5', 'Frigate', 3, { row: 5, col: 0 }, 'horizontal');
fleet.placeShip(frigate);

const corvette = new Ship('s6', 'Corvette', 3, { row: 7, col: 0 }, 'horizontal');
fleet.placeShip(corvette);

console.log('Is fully placed (expect false, only 4/5):', fleet.isFullyPlaced());

const interceptor = new Ship('s7', 'Interceptor', 2, { row: 9, col: 0 }, 'horizontal');
fleet.placeShip(interceptor);

console.log('Is fully placed (expect true, 5/5):', fleet.isFullyPlaced());

console.log('All sunk before any hits (expect false):', fleet.allSunk());

for (const coord of dreadnought.coordinates) {
  dreadnought.registerHit(coord.row, coord.col);
}
console.log('All sunk with only 1/5 ships sunk (expect false):', fleet.allSunk());