import { Board } from '../board';
import { Ship } from '../ship';
import { Fleet, FLEET_COMPOSITION } from '../fleet';
import { GameRules, DEFAULT_GAME_RULES } from '../game_rules';

// places the full fleet at random valid positions, retrying on invalid spots
export function setupRandomFleet(board: Board, rules: GameRules = DEFAULT_GAME_RULES): Fleet {
  const fleet = new Fleet(board, rules);
  for (const shipDef of FLEET_COMPOSITION) {
    let placed = false;
    while (!placed) {
      const row = Math.floor(Math.random() * board.size);
      const col = Math.floor(Math.random() * board.size);
      const orientation = Math.random() < 0.5 ? 'horizontal' : 'vertical';
      try {
        fleet.placeShip(
          new Ship(shipDef.name, shipDef.name, shipDef.size, { row, col }, orientation as 'horizontal' | 'vertical')
        );
        placed = true;
      } catch {
        // invalid spot, retry
      }
    }
  }
  return fleet;
}