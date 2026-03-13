import { useMemo } from "react";

const CELL_SIZE = 10;
const GAP = 3;
const STEP = CELL_SIZE + GAP;
const ROWS = 40;
const COLS = Math.ceil(3840 / STEP);

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return s / 2147483647;
  };
}

export const GridBackground = () => {
  const cells = useMemo(() => {
    const rand = seededRandom(42);
    const result: { col: number; row: number }[] = [];

    for (let row = 0; row < ROWS; row++) {
      const rowFromBottom = ROWS - 1 - row;
      const density = Math.pow(rowFromBottom / (ROWS - 1), 2.5);

      for (let col = 0; col < COLS; col++) {
        if (rand() < density) {
          result.push({ col, row });
        }
      }
    }
    return result;
  }, []);

  return (
    <div className="grid-background">
      {cells.map((cell) => (
        <div
          key={`${cell.col}-${cell.row}`}
          className="grid-background-cell"
          style={{
            left: cell.col * STEP,
            bottom: cell.row * STEP,
          }}
        />
      ))}
    </div>
  );
};
