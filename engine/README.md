# Lorentzburn Engine

The core game engine for Lorentzburn, a framework-agnostic TypeScript module with no external dependencies. It implements board state, ship placement, attack resolution, and fog-of-war logic. Both the frontend and the AI opponents build on top of this module.

## Modules

### `board.ts`

- `CellStatus`, enum of `Empty`, `Ship`, `Hit`, `Miss`
- `Cell`, a single grid cell (`row`, `col`, `status`, optional `shipId`)
- `Board`, owns the grid
  - `new Board(size = 10)`
  - `isInBounds(row, col)`
  - `getCell(row, col)`, throws if out of bounds
  - `setCellStatus(row, col, status)`
  - `getGrid()`, read-only access to the full grid

### `ship.ts`

- `Orientation`, `'horizontal' | 'vertical'`
- `ShipCoordinate`, `{ row, col }`
- `Ship`, a single ship
  - `new Ship(id, name, size, origin, orientation)`
  - `coordinates`, the cells this ship occupies
  - `registerHit(row, col)`, returns `true` if the coordinate belongs to this ship
  - `isSunk()`

Note: `Ship` has no knowledge of `Board`, it's fully self-contained.

### `fleet.ts`

- `FLEET_COMPOSITION`, the standard Lorentzburn fleet lineup (Dreadnought, Cruiser, Frigate, Corvette, Interceptor)
- `canPlaceShip(board, ship, existingShips)`, validates bounds, overlap, and adjacency (ships may not touch, even diagonally, a deliberate stricter than classic variant)
- `Fleet`, tracks a player's placed ships
  - `new Fleet(board)`
  - `placeShip(ship)`, throws on invalid placement
  - `getShips()`
  - `isFullyPlaced()`
  - `allSunk()`

### `attack.ts`

- `AttackResult`, `'hit' | 'miss' | 'sunk' | 'already-attacked'`
- `AttackOutcome`, `{ result, shipName?, gameOver }`
- `resolveAttack(board, fleet, row, col)`, resolves an attack against a target board/fleet pair, updates board cell status, registers hits on ships, and reports the win condition

### `fog_of_war.ts`

- `getFogOfWarView(board)`, the opponent's board as seen by the player, only hit/miss ever visible, since `Board` never stores ship data directly
- `getOwnBoardView(board, fleet)`, the player's own board, including their ship positions

## Design notes

- `Board` never stores ship location data. Ship position is only known through `Fleet`/`Ship`. This keeps fog-of-war trivial and guarantees the opponent's board can never accidentally leak ship positions.
- Adjacency rule: ships cannot be placed touching another ship, including diagonally. This is a deliberate variant of classic Battleship rules, not an official rule, chosen to add strategic depth.
- All core types are exported and framework-agnostic, no React, no Node-specific APIs, so this module can be reused by the frontend, the heuristic AI, and the LLM-based AI opponents without modification.

## Testing

Run the test suite:

\`\`\`bash
npm run test --workspace=engine
\`\`\`

## Building

\`\`\`bash
npm run build --workspace=engine
\`\`\`