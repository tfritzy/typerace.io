import { useEffect, useState } from "react";

const BACK_TREE_DENSITY = 110 / 1920;
const FRONT_TREE_DENSITY = 120 / 1920;
const BACK_TREE_COLOR = "#0c0c0c";
const FRONT_TREE_COLOR = "0, 0, 0";

export const SPACE_BACKGROUNDS = [
  { id: "deep-field", file: "/backgrounds/deep-field.jpg", label: "Hubble Deep Field" },
  { id: "ngc-6397", file: "/backgrounds/starfield.jpg", label: "NGC 6397" },
  { id: "galaxy-cluster", file: "/backgrounds/galaxy-cluster.jpg", label: "Galaxy Cluster" },
  { id: "carina-nebula", file: "/backgrounds/carina-nebula.jpg", label: "Carina Nebula" },
  { id: "extreme-deep-field", file: "/backgrounds/extreme-deep-field.jpg", label: "Extreme Deep Field" },
  { id: "westerlund-2", file: "/backgrounds/star-cluster.jpg", label: "Westerlund 2" },
] as const;

export type SpaceBackgroundId = (typeof SPACE_BACKGROUNDS)[number]["id"];

interface TreePlacement {
  x: number;
  treeType: number;
  scale: number;
}

const TREE_PATHS = [
  "M0,-80 L6,-70 L14,-68 L6,-66 L10,-58 L20,-54 L9,-52 L14,-44 L26,-38 L11,-36 L17,-28 L30,-22 L13,-20 L20,-12 L34,-6 L4,-4 L4,0 L-4,0 L-4,-4 L-34,-6 L-20,-12 L-13,-20 L-30,-22 L-17,-28 L-11,-36 L-26,-38 L-14,-44 L-9,-52 L-20,-54 L-10,-58 L-6,-66 L-14,-68 L-6,-70 Z",
  "M0,-95 L4,-86 L10,-83 L4,-81 L7,-74 L15,-70 L6,-68 L10,-60 L20,-54 L8,-52 L13,-44 L24,-37 L9,-35 L14,-27 L28,-19 L10,-17 L17,-10 L32,-3 L4,-2 L4,0 L-4,0 L-4,-2 L-32,-3 L-17,-10 L-10,-17 L-28,-19 L-14,-27 L-9,-35 L-24,-37 L-13,-44 L-8,-52 L-20,-54 L-10,-60 L-6,-68 L-15,-70 L-7,-74 L-4,-81 L-10,-83 L-4,-86 Z",
  "M0,-68 L6,-60 L18,-56 L8,-54 L15,-46 L30,-40 L13,-38 L22,-28 L40,-20 L16,-18 L26,-10 L48,-3 L4,-2 L4,0 L-4,0 L-4,-2 L-48,-3 L-26,-10 L-16,-18 L-40,-20 L-22,-28 L-13,-38 L-30,-40 L-15,-46 L-8,-54 L-18,-56 L-6,-60 Z",
];

const generateTreeLayer = (width: number, density: number): TreePlacement[] => {
  const count = Math.round(density * width);
  return Array.from({ length: count }, () => ({
    x: Math.random() * width,
    treeType: Math.floor(Math.random() * TREE_PATHS.length),
    scale: 0.85 + Math.random() * 0.3,
  }));
};

interface StarryBackgroundProps {
  backgroundId?: SpaceBackgroundId;
}

export const StarryBackground = ({ backgroundId = "deep-field" }: StarryBackgroundProps) => {
  const [viewBoxWidth, setViewBoxWidth] = useState(window.innerWidth);
  const [backTrees, setBackTrees] = useState(() =>
    generateTreeLayer(window.innerWidth, BACK_TREE_DENSITY)
  );
  const [frontTrees, setFrontTrees] = useState(() =>
    generateTreeLayer(window.innerWidth, FRONT_TREE_DENSITY)
  );

  const bg = SPACE_BACKGROUNDS.find((b) => b.id === backgroundId) ?? SPACE_BACKGROUNDS[0];

  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      setViewBoxWidth(w);
      setBackTrees(generateTreeLayer(w, BACK_TREE_DENSITY));
      setFrontTrees(generateTreeLayer(w, FRONT_TREE_DENSITY));
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <div
        className="absolute inset-0 space-background"
        style={{ backgroundImage: `url(${bg.file})` }}
      />

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
