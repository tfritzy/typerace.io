import { useMemo } from "react";

const seededRandom = (seed: number): [number, number] => {
  const next = (seed * 16807) % 2147483647;
  return [next / 2147483647, next];
};

export const Scenery = () => {
  const treePath = useMemo(() => {
    const viewWidth = 1920;
    const treeBaseY = 230;
    let path = `M0,250 L0,${treeBaseY} `;
    let x = -5;
    let seed = 137;

    while (x < viewWidth + 50) {
      let val: number;
      [val, seed] = seededRandom(seed);
      const height = 12 + val * 35;
      [val, seed] = seededRandom(seed);
      const width = 8 + val * 18;
      [val, seed] = seededRandom(seed);
      const gap = val * 5;
      const peak = treeBaseY - height;
      const mid = x + width / 2;
      path += `L${mid.toFixed(1)},${peak.toFixed(1)} L${(x + width).toFixed(1)},${treeBaseY} `;
      x += width + gap;
    }

    path += `L${viewWidth},${treeBaseY} L${viewWidth},250 Z`;
    return path;
  }, []);

  return (
    <div
      className="fixed bottom-0 left-0 right-0 pointer-events-none"
      style={{ zIndex: 0 }}
    >
      <svg
        viewBox="0 0 1920 250"
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
