// counts, for every cell, how many legal placements of the given ships would cover it on an empty board,
// the same idea ProbabilityDensityOpponent uses before any shots have been fired
export function placementHeatmap(
  size: number,
  shipSizes: number[]
): number[][] {
  const heat = Array.from({ length: size }, () => Array<number>(size).fill(0));

  for (const shipSize of shipSizes) {
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        if (col + shipSize <= size) {
          for (let i = 0; i < shipSize; i++) heat[row][col + i]++;
        }
        if (row + shipSize <= size) {
          for (let i = 0; i < shipSize; i++) heat[row + i][col]++;
        }
      }
    }
  }

  return heat;
}
