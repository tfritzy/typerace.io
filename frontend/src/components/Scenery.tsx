import { useMemo } from "react";

const VIEW_WIDTH = 1920;
const VIEW_HEIGHT = 250;
const TREE_BASE_Y = 230;
const TREE_SEED = 137;

const seededRandom = (seed: number): [number, number] => {
  const next = (seed * 16807) % 2147483647;
  return [next / 2147483647, next];
};

export const Scenery = () => {
  const treePath = useMemo(() => {
    let path = `M0,${VIEW_HEIGHT} L0,${TREE_BASE_Y} `;
    let x = -5;
    let seed = TREE_SEED;

    while (x < VIEW_WIDTH + 50) {
      let val: number;
      [val, seed] = seededRandom(seed);
      const height = 12 + val * 35;
      [val, seed] = seededRandom(seed);
      const width = 8 + val * 18;
      [val, seed] = seededRandom(seed);
      const gap = val * 5;
      const peak = TREE_BASE_Y - height;
      const mid = x + width / 2;
      path += `L${mid.toFixed(1)},${peak.toFixed(1)} L${(x + width).toFixed(1)},${TREE_BASE_Y} `;
      x += width + gap;
    }

    path += `L${VIEW_WIDTH},${TREE_BASE_Y} L${VIEW_WIDTH},${VIEW_HEIGHT} Z`;
    return path;
  }, []);

  return (
    <div
      className="fixed bottom-0 left-0 right-0 pointer-events-none"
      style={{ zIndex: 0 }}
    >
      <svg
        viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
        preserveAspectRatio="xMidYMax slice"
        className="w-full block"
      >
        <path
          d="M0,250 L0,160 Q240,95 480,145 Q720,70 960,130 Q1200,60 1440,120 Q1680,90 1920,150 L1920,250 Z"
          fill="#272727"
        />
        <path
          d="M0,250 L0,210 Q160,175 360,205 Q540,165 720,198 Q920,170 1100,195 Q1300,168 1500,198 Q1700,180 1920,205 L1920,250 Z"
          fill="#242424"
        />
        <path d={treePath} fill="#2b2b2b" />
      </svg>
    </div>
  );
};
