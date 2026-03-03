import { useEffect, useRef } from "react";

const STAR_COUNT = 200;
const SHOOTING_STAR_INTERVAL_MIN = 4000;
const SHOOTING_STAR_INTERVAL_MAX = 10000;
const MIN_STAR_OPACITY = 0.6;
const STAR_OPACITY_RANGE = 0.4;
const BACK_TREE_COUNT = 110;
const FRONT_TREE_COUNT = 120;

interface Star {
  x: number;
  y: number;
  size: number;
  twinkleDelay: number;
  twinkleDuration: number;
}

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

const generateStars = (): Star[] => {
  return Array.from({ length: STAR_COUNT }, () => ({
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2 + 0.5,
    twinkleDelay: Math.random() * 5,
    twinkleDuration: 2 + Math.random() * 3,
  }));
};

const generateTreeLayer = (count: number): TreePlacement[] => {
  return Array.from({ length: count }, () => ({
    x: Math.random() * 1920,
    treeType: Math.floor(Math.random() * TREE_PATHS.length),
    scale: 0.85 + Math.random() * 0.3,
  }));
};

export const StarryBackground = () => {
  const shootingStarContainerRef = useRef<HTMLDivElement>(null);
  const starsRef = useRef<Star[]>(generateStars());
  const backTreesRef = useRef<TreePlacement[]>(generateTreeLayer(BACK_TREE_COUNT));
  const frontTreesRef = useRef<TreePlacement[]>(generateTreeLayer(FRONT_TREE_COUNT));

  useEffect(() => {
    const container = shootingStarContainerRef.current;
    if (!container) return;

    let timeoutId: ReturnType<typeof setTimeout>;

    const createShootingStar = () => {
      const star = document.createElement("div");
      star.className = "shooting-star";
      star.style.top = `${Math.random() * 50}%`;
      star.style.left = `${Math.random() * 30}%`;
      star.style.setProperty("--angle", `${Math.random() * 20 + 20}deg`);
      container.appendChild(star);

      setTimeout(() => {
        star.remove();
      }, 5500);

      const nextDelay =
        SHOOTING_STAR_INTERVAL_MIN +
        Math.random() * (SHOOTING_STAR_INTERVAL_MAX - SHOOTING_STAR_INTERVAL_MIN);
      timeoutId = setTimeout(createShootingStar, nextDelay);
    };

    const initialDelay =
      SHOOTING_STAR_INTERVAL_MIN +
      Math.random() * (SHOOTING_STAR_INTERVAL_MAX - SHOOTING_STAR_INTERVAL_MIN);
    timeoutId = setTimeout(createShootingStar, initialDelay);

    return () => {
      clearTimeout(timeoutId);
    };
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <div className="absolute inset-0 starry-sky" />

      {starsRef.current.map((star, i) => (
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
            backgroundColor: `rgba(251, 191, 36, ${MIN_STAR_OPACITY + Math.random() * STAR_OPACITY_RANGE})`,
          }}
        />
      ))}

      <div ref={shootingStarContainerRef} className="absolute inset-0" />

      <div className="absolute inset-x-0 bottom-0 h-[20%] horizon-glow" />

      <svg
        className="absolute inset-x-0 bottom-0"
        viewBox="0 0 1920 200"
        preserveAspectRatio="none"
        style={{ width: "100%", height: "150px" }}
      >
        <rect x="-50" y="185" width="2020" height="15" fill="#0c0c0c" />
        {backTreesRef.current.map((tree, i) => (
          <path
            key={`b${i}`}
            d={TREE_PATHS[tree.treeType]}
            fill="#0c0c0c"
            transform={`translate(${tree.x},185) scale(${tree.scale})`}
          />
        ))}
        <rect x="-50" y="187" width="2020" height="13" fill="black" />
        {frontTreesRef.current.map((tree, i) => (
          <path
            key={`f${i}`}
            d={TREE_PATHS[tree.treeType]}
            fill="black"
            transform={`translate(${tree.x},187) scale(${tree.scale})`}
          />
        ))}
      </svg>
    </div>
  );
};
