import { Board } from '../board';
import { Ship } from '../ship';
import { Fleet } from '../fleet';
import { resolveAttack } from '../attack';
import { getFogOfWarView, getOwnBoardView } from '../fog_of_war';

const board = new Board(10);
const fleet = new Fleet(board);

const interceptor = new Ship('s1', 'Interceptor', 2, { row: 0, col: 0 }, 'horizontal');
fleet.placeShip(interceptor);

const corvette = new Ship('s2', 'Corvette', 3, { row: 3, col: 3 }, 'vertical');
fleet.placeShip(corvette);

resolveAttack(board, fleet, 0, 0); // hit on interceptor
resolveAttack(board, fleet, 5, 5); // miss

console.log('--- Fog of war view (opponent perspective) ---');
const fogView = getFogOfWarView(board);
console.log('Cell (0,0), expect status hit, no ship info:', fogView[0][0]);
console.log('Cell (0,1), expect status empty (ship hidden, not yet hit):', fogView[0][1]);
console.log('Cell (5,5), expect status miss:', fogView[5][5]);
console.log('Cell (3,3), expect status empty (ship hidden):', fogView[3][3]);

console.log('--- Own board view (player perspective) ---');
const ownView = getOwnBoardView(board, fleet);
console.log('Cell (0,0), expect status hit:', ownView[0][0]);
console.log('Cell (0,1), expect status ship (unhit ship cell visible):', ownView[0][1]);
console.log('Cell (5,5), expect status miss:', ownView[5][5]);
console.log('Cell (5,5), expect status miss:', ownView[5][5]);
console.log('Cell (3,3), expect status ship, shipId s2:', ownView[3][3]);
console.log('Cell (9,9), expect status empty:', ownView[9][9]);