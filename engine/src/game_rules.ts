// Shared, toggleable rules for game variants
export interface GameRules {
  strictAdjacency: boolean; // true = no ships touching, even diagonally
}

// Default rules, adjacency permitted for now
export const DEFAULT_GAME_RULES: GameRules = {
  strictAdjacency: false,
};