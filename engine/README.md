# Lorentzburn Engine

The core game engine for Lorentzburn, a framework-agnostic TypeScript module with no external dependencies. It implements board state, ship placement, attack resolution, fog-of-war logic, heuristic AI opponents, and full match orchestration. Both the frontend and the LLM-based AI opponents build on top of this module.

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

### `game_rules.ts`

- `GameRules`, `{ strictAdjacency: boolean }`, toggleable rules for game variants
- `DEFAULT_GAME_RULES`, defaults to `strictAdjacency: false`, ships may touch by default

Shared across `fleet.ts` (placement validation), `opponent/probability_density.ts` (heatmap dead zones), and `game_session.ts` (passed through to both fleets).

### `fleet.ts`

- `FLEET_COMPOSITION`, the standard Lorentzburn fleet lineup (Dreadnought, Cruiser, Frigate, Corvette, Interceptor)
- `canPlaceShip(board, ship, existingShips, rules?)`, validates bounds, overlap, and (if `rules.strictAdjacency` is true) adjacency, ships may not touch another ship, including diagonally
- `Fleet`, tracks a player's placed ships
  - `new Fleet(board, rules?)`
  - `placeShip(ship)`, throws on invalid placement
  - `getShips()`
  - `isFullyPlaced()`
  - `allSunk()`

### `fleet_setup.ts`

- `randomlyPlaceFleet(fleet, board, rules?)`, places the full standard fleet at random valid positions on the given board, retrying until each ship finds a legal spot. Used by `GameSession` for AI-controlled sides, and by benchmark scratch scripts.

### `attack.ts`

- `AttackResult`, `'hit' | 'miss' | 'sunk' | 'already-attacked'`
- `AttackOutcome`, `{ result, shipName?, gameOver }`
- `resolveAttack(board, fleet, row, col)`, resolves an attack against a target board/fleet pair, updates board cell status, registers hits on ships, and reports the win condition

### `fog_of_war.ts`

- `getFogOfWarView(board)`, the opponent's board as seen by the player, only hit/miss ever visible, since `Board` never stores ship data directly
- `getOwnBoardView(board, fleet)`, the player's own board, including their ship positions

### `opponent/`

Heuristic AI opponent strategies, all implementing a shared interface so they, and future LLM-based opponents, can be used interchangeably by the game loop.

- `opponent.ts`
  - `Move`, `{ row, col }`
  - `Opponent`, the shared contract
    - `getMove(boardView)`, returns `Promise<Move>`
    - `registerResult?(move, wasHit, shipSunk)`, optional feedback hook for stateful strategies
- `random_hunter.ts`
  - `RandomHunterOpponent`, fires at a random unattacked cell, no state, no feedback needed
- `hunt_target.ts`
  - `HuntTargetOpponent`, hunts randomly until a hit lands, then probes orthogonal neighbors, locks a direction once two hits align, and reverts to hunting once the ship sinks
- `probability_density.ts`
  - `ProbabilityDensityOpponent`, builds a heatmap of placement likelihood per cell from the remaining ship sizes, requires placements to pass through any active unresolved hit, and (when `strictAdjacency` is enabled) excludes dead zones around sunk ships, fires at the highest-scoring cell

### `game_session.ts`

Orchestrates a full match between two sides, each either player-controlled (`'player'`) or AI-controlled (an `Opponent` instance). Supports both player-vs-AI and AI-vs-AI.

- `GameSession`
  - `new GameSession({ boardSize?, rules?, sideA, sideB })`, AI-controlled sides get a randomly placed fleet automatically
  - `placePlayerFleet(side, ships)`, places ships for a player-controlled side
  - `attackAsA(row, col)` / `attackAsB(row, col)`, resolves an attack for that side, enforces turn order, throws if called out of turn or after the game has ended
  - `playAiTurn(side)`, automatically fetches a move from an AI-controlled side and executes it, throws if that side is player-controlled
  - `isGameOver()`, `getWinner()`, `getCurrentTurn()`

Turns always alternate regardless of hit or miss, classic Battleship turn order, no bonus turn on hit (a possible future `GameRules` addition, not implemented yet).

## Design notes

- `Board` never stores ship location data. Ship position is only known through `Fleet`/`Ship`. This keeps fog-of-war trivial and guarantees the opponent's board can never accidentally leak ship positions.
- Adjacency rule: by default, ships may touch, including diagonally. Setting `strictAdjacency: true` in `GameRules` enforces the stricter, non-touching variant. This is a deliberate toggle, not an official Battleship rule, meant to support a future difficulty/settings option.
- All core types are exported and framework-agnostic, no React, no Node-specific APIs, so this module can be reused by the frontend, the heuristic AI, and the LLM-based AI opponents without modification.
- All `Opponent` implementations are async by design, even the heuristic ones that resolve instantly, so the game loop can treat heuristic and network-bound LLM opponents identically.
- `GameSession` uses generic side labels (`A`/`B`) rather than `player`/`ai` naming, this is what allows the same class to support both player-vs-AI and AI-vs-AI without a separate code path.

## Testing

Run the test suite:

```bash
npm run test --workspace=engine
```

## Building

```bash
npm run build --workspace=engine
```