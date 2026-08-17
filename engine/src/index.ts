// public API surface for the engine package, the frontend and any future
// consumers should only ever import from here, never reach into individual files directly

export { Board, CellStatus } from './board';
export type { Cell } from './board';

export { Ship } from './ship';
export type { Orientation, ShipCoordinate } from './ship';

export { Fleet, FLEET_COMPOSITION, canPlaceShip } from './fleet';

export { randomlyPlaceFleet } from './fleet_setup';

export { resolveAttack } from './attack';
export type { AttackResult, AttackOutcome } from './attack';

export { getFogOfWarView, getOwnBoardView } from './fog_of_war';
export type { VisibleCell, VisibleCellStatus, FullCell, FullCellStatus } from './fog_of_war';

export { GameSession } from './game_session';
export type { Side, SideController, GameSessionConfig } from './game_session';

export { DEFAULT_GAME_RULES } from './game_rules';
export type { GameRules } from './game_rules';

export type { Opponent, Move } from './opponent/opponent';
export { RandomHunterOpponent } from './opponent/random_hunter';
export { HuntTargetOpponent } from './opponent/hunt_target';
export { ProbabilityDensityOpponent } from './opponent/probability_density';