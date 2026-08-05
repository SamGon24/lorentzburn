import { Board, CellStatus } from '../board';

const board = new Board(10);

console.log('Board size:', board.size);
console.log('In bounds (5,5):', board.isInBounds(5, 5));
console.log('In bounds (10,0):', board.isInBounds(10, 0));
console.log('In bounds (-1,3):', board.isInBounds(-1, 3));

const cell = board.getCell(3, 4);
console.log('Cell (3,4):', cell);
console.log('Status is Empty:', cell.status === CellStatus.Empty);

try {
  board.getCell(20, 20);
} catch (e) {
  console.log('Correctly threw error:', (e as Error).message);
}

const customBoard = new Board(12);
console.log('Custom board size:', customBoard.size);