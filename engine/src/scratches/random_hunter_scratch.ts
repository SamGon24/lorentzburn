import { RandomHunterOpponent } from '../opponent/random_hunter';
import { VisibleCell } from '../fog_of_war';;

function createBoardView(size: number): VisibleCell[][] {
  const grid: VisibleCell[][] = [];
  for (let row = 0; row < size; row++) {
    const rowCells: VisibleCell[] = [];
    for (let col = 0; col < size; col++) {
      rowCells.push({ row, col, status: 'empty' });
    }
    grid.push(rowCells);
  }
  return grid;
}

async function main() {
  const board = createBoardView(10);
  const opponent = new RandomHunterOpponent();

  const move = await opponent.getMove(board);
  console.log('Random move:', move);

  board[0][0].status = 'hit';
  board[0][1].status = 'miss';
  const move2 = await opponent.getMove(board);
  console.log('Move avoiding hit/miss cells (should never be 0,0 or 0,1):', move2);
}

main();