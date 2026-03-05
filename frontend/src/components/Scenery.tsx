import { useMemo } from "react";

const VIEW_WIDTH = 1920;
const VIEW_HEIGHT = 200;

const seededRandom = (seed: number): [number, number] => {
  const next = (seed * 16807) % 2147483647;
  return [next / 2147483647, next];
};

const generateMountains = (
  baseY: number,
  minPeak: number,
  maxPeak: number,
  minWidth: number,
  maxWidth: number,
  initialSeed: number
): string => {
  let path = `M0,${VIEW_HEIGHT} L0,${baseY} `;
  let x = 0;
  let seed = initialSeed;

  while (x < VIEW_WIDTH) {
    let val: number;
    [val, seed] = seededRandom(seed);
    const peakHeight = minPeak + val * (maxPeak - minPeak);
    [val, seed] = seededRandom(seed);
    const width = minWidth + val * (maxWidth - minWidth);

    path += `L${(x + width / 2).toFixed(1)},${(baseY - peakHeight).toFixed(1)} `;
    x += width;
    path += `L${x.toFixed(1)},${baseY} `;
  }

  path += `L${VIEW_WIDTH},${VIEW_HEIGHT} Z`;
  return path;
};

const generateTreeLine = (
  baseY: number,
  minH: number,
  maxH: number,
  minW: number,
  maxW: number,
  spacing: number,
  initialSeed: number
): string => {
  let d = "";
  let x = -20;
  let seed = initialSeed;

  while (x < VIEW_WIDTH + 40) {
    let val: number;
    [val, seed] = seededRandom(seed);
    const h = minH + val * (maxH - minH);
    [val, seed] = seededRandom(seed);
    const w = minW + val * (maxW - minW);
    [val, seed] = seededRandom(seed);
    const cx = x + (val - 0.5) * spacing * 0.5;

    const tip = baseY - h;
    const t0 = baseY - h * 0.65;
    const t1 = baseY - h * 0.35;

    d += `M${cx.toFixed(1)},${tip.toFixed(1)} `;
    d += `L${(cx + w * 0.18).toFixed(1)},${t0.toFixed(1)} `;
    d += `L${(cx + w * 0.10).toFixed(1)},${t0.toFixed(1)} `;
    d += `L${(cx + w * 0.30).toFixed(1)},${t1.toFixed(1)} `;
    d += `L${(cx + w * 0.18).toFixed(1)},${t1.toFixed(1)} `;
    d += `L${(cx + w * 0.42).toFixed(1)},${baseY.toFixed(1)} `;
    d += `L${(cx - w * 0.42).toFixed(1)},${baseY.toFixed(1)} `;
    d += `L${(cx - w * 0.18).toFixed(1)},${t1.toFixed(1)} `;
    d += `L${(cx - w * 0.30).toFixed(1)},${t1.toFixed(1)} `;
    d += `L${(cx - w * 0.10).toFixed(1)},${t0.toFixed(1)} `;
    d += `L${(cx - w * 0.18).toFixed(1)},${t0.toFixed(1)} `;
    d += `Z `;

    x += spacing;
  }

  return d;
};

export const Scenery = () => {
  const farMountains = useMemo(
    () => generateMountains(155, 40, 100, 100, 250, 42), []);
  const nearMountains = useMemo(
    () => generateMountains(170, 25, 55, 60, 160, 137), []);
  const backTrees = useMemo(
    () => generateTreeLine(192, 18, 40, 20, 35, 14, 73), []);
  const frontTrees = useMemo(
    () => generateTreeLine(200, 14, 32, 18, 28, 11, 211), []);

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
        <path d={farMountains} fill="#222222" />
        <path d={nearMountains} fill="#242424" />
        <path d={backTrees} fill="#232323" />
        <path d={frontTrees} fill="#252525" />
      </svg>
    </div>
  );
};
