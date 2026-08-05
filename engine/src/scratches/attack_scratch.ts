import { Board, CellStatus } from './board';
import { Ship } from './ship';
import { Fleet } from './fleet';
import { resolveAttack } from './attack';

const board = new Board(10);
const fleet = new Fleet(board);

const interceptor = new Ship('s1', 'Interceptor', 2, { row: 0, col: 0 }, 'horizontal');
fleet.placeShip(interceptor);

console.log('--- Miss test ---');
const missResult = resolveAttack(board, fleet, 5, 5);
console.log('Attack (5,5), expect miss:', missResult);
console.log('Cell status (expect miss):', board.getCell(5, 5).status);

console.log('--- Hit test ---');
const hitResult = resolveAttack(board, fleet, 0, 0);
console.log('Attack (0,0), expect hit (not sunk yet):', hitResult);
console.log('Cell status (expect hit):', board.getCell(0, 0).status);

console.log('--- Already attacked test ---');
const repeatResult = resolveAttack(board, fleet, 0, 0);
console.log('Attack (0,0) again, expect already-attacked:', repeatResult);

console.log('--- Sunk + game over test ---');
const sunkResult = resolveAttack(board, fleet, 0, 1);
console.log('Attack (0,1), expect sunk + gameOver true:', sunkResult);

console.log('--- Out of bounds test ---');
try {
  resolveAttack(board, fleet, 20, 20);
  console.log('ERROR: should have thrown');
} catch (e) {
  console.log('Correctly threw:', (e as Error).message);
}