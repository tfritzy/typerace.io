import { useEffect, useState } from "react";

const MIN_STAR_OPACITY = 0.6;
const STAR_OPACITY_RANGE = 0.4;
const BACK_TREE_DENSITY = 110 / 1920;
const FRONT_TREE_DENSITY = 120 / 1920;
const BACK_TREE_COLOR = "#0c0c0c";
const FRONT_TREE_COLOR = "0, 0, 0";
const BASE_AREA = 1920 * 1080;
const BASE_STAR_COUNT = 600;
const STAR_DENSITY = BASE_STAR_COUNT / BASE_AREA;
const MIN_STAR_COUNT = 260;
const MAX_STAR_COUNT = 2400;

interface Star {
  x: number;
  y: number;
  size: number;
  twinkleDelay: number;
  twinkleDuration: number;
  opacity: number;
  isCross: boolean;
  color: string;
}

type WeightedStarColor = {
  rgb: [number, number, number];
  weight: number;
};

const STAR_COLOR_VARIANTS: WeightedStarColor[] = [
  { rgb: [255, 244, 234], weight: 24 },
  { rgb: [255, 236, 214], weight: 20 },
  { rgb: [255, 252, 244], weight: 24 },
  { rgb: [248, 251, 255], weight: 16 },
  { rgb: [230, 239, 255], weight: 8 },
  { rgb: [214, 228, 255], weight: 4 },
  { rgb: [255, 222, 201], weight: 3 },
  { rgb: [255, 205, 188], weight: 1 },
];

const TOTAL_STAR_COLOR_WEIGHT = STAR_COLOR_VARIANTS.reduce(
  (total, variant) => total + variant.weight,
  0
);

const clamp = (value: number): number => Math.max(0, Math.min(255, value));

const pickStarColor = (): string => {
  let threshold = Math.random() * TOTAL_STAR_COLOR_WEIGHT;
  let selected = STAR_COLOR_VARIANTS[0];

  for (const variant of STAR_COLOR_VARIANTS) {
    threshold -= variant.weight;
    if (threshold <= 0) {
      selected = variant;
      break;
    }
  }

  const jitter = 7;
  const red = clamp(Math.round(selected.rgb[0] + (Math.random() * 2 - 1) * jitter));
  const green = clamp(Math.round(selected.rgb[1] + (Math.random() * 2 - 1) * jitter));
  const blue = clamp(Math.round(selected.rgb[2] + (Math.random() * 2 - 1) * jitter));
  return `${red}, ${green}, ${blue}`;
};

interface TreePlacement {
  x: number;
  treeType: number;
  scale: number;
}

const TREE_PATHS = [
  "M0,-90 L5,-78 L12,-74 L4,-72 L9,-62 L18,-56 L7,-54 L13,-42 L24,-34 L9,-32 L16,-22 L28,-14 L4,-12 L4,0 L-4,0 L-4,-12 L-28,-14 L-16,-22 L-9,-32 L-24,-34 L-13,-42 L-7,-54 L-18,-56 L-9,-62 L-4,-72 L-12,-74 L-5,-78 Z",
  "M-3,0 L-3,-20 L-8,-22 Q-20,-26 -28,-36 Q-36,-46 -35,-58 Q-34,-70 -24,-76 Q-14,-82 0,-84 Q14,-82 24,-76 Q34,-70 35,-58 Q36,-46 28,-36 Q20,-26 8,-22 L3,-20 L3,0 Z",
  "M-3,0 L-3,-25 L-6,-28 Q-14,-34 -22,-44 Q-28,-54 -24,-64 Q-20,-74 -10,-78 Q0,-82 10,-78 Q20,-74 24,-64 Q28,-54 22,-44 Q14,-34 6,-28 L3,-25 L3,0 Z",
  "M-2,0 L-2,-15 Q-6,-25 -8,-40 Q-10,-55 -8,-70 Q-6,-85 -4,-92 Q0,-100 4,-92 Q6,-85 8,-70 Q10,-55 8,-40 Q6,-25 2,-15 L2,0 Z",
  "M-3,0 L-3,-30 Q-5,-35 -10,-42 Q-18,-52 -28,-58 Q-34,-62 -30,-70 Q-26,-78 -16,-82 Q-6,-86 0,-86 Q6,-86 16,-82 Q26,-78 30,-70 Q34,-62 28,-58 Q18,-52 10,-42 Q5,-35 3,-30 L3,0 Z",
  "M-3,0 L-3,-12 Q-10,-16 -18,-24 Q-24,-32 -20,-40 Q-16,-48 -8,-50 Q0,-52 8,-50 Q16,-48 20,-40 Q24,-32 18,-24 Q10,-16 3,-12 L3,0 Z",
];

const getStarCount = (width: number, height: number): number => {
  const countByArea = Math.round(width * height * STAR_DENSITY);
  return Math.max(MIN_STAR_COUNT, Math.min(MAX_STAR_COUNT, countByArea));
};

const generateStars = (count: number): Star[] => {
  return Array.from({ length: count }, () => ({
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2 + 0.5,
    twinkleDelay: Math.random() * 15,
    twinkleDuration: 8 + Math.random() * 8,
    opacity: MIN_STAR_OPACITY + Math.random() * STAR_OPACITY_RANGE,
    isCross: Math.random() < 0.08,
    color: pickStarColor(),
  }));
};

const generateTreeLayer = (width: number, density: number): TreePlacement[] => {
  const count = Math.round(density * width);
  return Array.from({ length: count }, () => ({
    x: Math.random() * width,
    treeType: Math.floor(Math.random() * TREE_PATHS.length),
    scale: 0.85 + Math.random() * 0.3,
  }));
};

export const StarryBackground = () => {
  const [stars, setStars] = useState<Star[]>(() =>
    generateStars(getStarCount(window.innerWidth, window.innerHeight))
  );
  const [viewBoxWidth, setViewBoxWidth] = useState(window.innerWidth);
  const [backTrees, setBackTrees] = useState(() =>
    generateTreeLayer(window.innerWidth, BACK_TREE_DENSITY)
  );
  const [frontTrees, setFrontTrees] = useState(() =>
    generateTreeLayer(window.innerWidth, FRONT_TREE_DENSITY)
  );

  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      setStars(generateStars(getStarCount(w, h)));
      setViewBoxWidth(w);
      setBackTrees(generateTreeLayer(w, BACK_TREE_DENSITY));
      setFrontTrees(generateTreeLayer(w, FRONT_TREE_DENSITY));
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <div className="absolute inset-0 starry-sky" />

      {stars.map((star, i) =>
        star.isCross ? (
          <div
            key={i}
            className="absolute star-cross star-twinkle"
            style={
              {
                left: `${star.x}%`,
                top: `${star.y}%`,
                animationDelay: `${star.twinkleDelay}s`,
                animationDuration: `${star.twinkleDuration}s`,
                "--cross-size": `${(star.size * 4 + 4) * 0.5}px`,
                "--cross-color": `rgba(${star.color}, ${star.opacity})`,
              } as React.CSSProperties
            }
          />
        ) : (
          <div
            key={i}
            className="absolute rounded-full star-twinkle"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              animationDelay: `${star.twinkleDelay}s`,
              animationDuration: `${star.twinkleDuration}s`,
              backgroundColor: `rgba(${star.color}, ${star.opacity})`,
              boxShadow: `0 0 ${Math.max(2, star.size * 1.8)}px rgba(${star.color}, ${
                star.opacity * 0.55
              })`,
            }}
          />
        ),
      )}
      <div className="absolute inset-x-0 bottom-0 h-[50%] atmosphere-glow" />
      <div className="absolute inset-x-0 bottom-0 h-[20%] horizon-glow" />

      <svg
        className="absolute inset-x-0 bottom-0"
        viewBox={`0 0 ${viewBoxWidth} 200`}
        preserveAspectRatio="none"
        style={{ width: "100%", height: "150px" }}
      >
        <rect x="-50" y="185" width={viewBoxWidth + 100} height="15" fill={BACK_TREE_COLOR} />
        {backTrees.map((tree, i) => (
          <path
            key={`b${i}`}
            d={TREE_PATHS[tree.treeType]}
            fill={BACK_TREE_COLOR}
            transform={`translate(${tree.x},185) scale(${tree.scale})`}
          />
        ))}
        <rect x="-50" y="187" width={viewBoxWidth + 100} height="13" fill={`rgb(${FRONT_TREE_COLOR})`} />
        {frontTrees.map((tree, i) => (
          <path
            key={`f${i}`}
            d={TREE_PATHS[tree.treeType]}
            fill={`rgb(${FRONT_TREE_COLOR})`}
            transform={`translate(${tree.x},187) scale(${tree.scale})`}
          />
        ))}
      </svg>
    </div>
  );
};
