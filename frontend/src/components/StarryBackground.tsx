import { useEffect, useRef, useState } from "react";

const BACK_TREE_DENSITY = 110 / 1920;
const FRONT_TREE_DENSITY = 120 / 1920;
const BACK_TREE_COLOR = "#0c0c0c";
const FRONT_TREE_COLOR = "0, 0, 0";

const BASE_AREA = 1920 * 1080;
const BASE_STAR_COUNT = 800;
const STAR_DENSITY = BASE_STAR_COUNT / BASE_AREA;
const MIN_STAR_COUNT = 300;
const MAX_STAR_COUNT = 3000;

const SHOOTING_STAR_INTERVAL_MIN = 3000;
const SHOOTING_STAR_INTERVAL_MAX = 8000;

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

const pickStarColorRgb = (): [number, number, number] => {
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
  return [
    clamp(Math.round(selected.rgb[0] + (Math.random() * 2 - 1) * jitter)),
    clamp(Math.round(selected.rgb[1] + (Math.random() * 2 - 1) * jitter)),
    clamp(Math.round(selected.rgb[2] + (Math.random() * 2 - 1) * jitter)),
  ];
};

interface CanvasStar {
  x: number;
  y: number;
  size: number;
  r: number;
  g: number;
  b: number;
  baseOpacity: number;
  twinkleSpeed: number;
  twinkleOffset: number;
  isCross: boolean;
}

interface NebulaPatch {
  x: number;
  y: number;
  radiusX: number;
  radiusY: number;
  r: number;
  g: number;
  b: number;
  opacity: number;
  rotation: number;
  driftSpeed: number;
  driftAngle: number;
  pulseSpeed: number;
  pulseOffset: number;
}

interface ShootingStar {
  x: number;
  y: number;
  vx: number;
  vy: number;
  length: number;
  opacity: number;
  life: number;
  maxLife: number;
  size: number;
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

const NEBULA_COLORS: [number, number, number][] = [
  [80, 120, 200],
  [120, 80, 180],
  [60, 100, 160],
  [100, 60, 140],
  [70, 90, 170],
  [140, 80, 120],
];

const getStarCount = (width: number, height: number): number => {
  const countByArea = Math.round(width * height * STAR_DENSITY);
  return Math.max(MIN_STAR_COUNT, Math.min(MAX_STAR_COUNT, countByArea));
};

const generateCanvasStars = (width: number, height: number): CanvasStar[] => {
  const count = getStarCount(width, height);
  return Array.from({ length: count }, () => {
    const [r, g, b] = pickStarColorRgb();
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2.2 + 0.3,
      r,
      g,
      b,
      baseOpacity: 0.4 + Math.random() * 0.6,
      twinkleSpeed: 0.3 + Math.random() * 0.7,
      twinkleOffset: Math.random() * Math.PI * 2,
      isCross: Math.random() < 0.06,
    };
  });
};

const generateNebulaPatches = (width: number, height: number): NebulaPatch[] => {
  const count = 5 + Math.floor(Math.random() * 4);
  return Array.from({ length: count }, () => {
    const color = NEBULA_COLORS[Math.floor(Math.random() * NEBULA_COLORS.length)];
    return {
      x: Math.random() * width,
      y: Math.random() * height * 0.8,
      radiusX: 150 + Math.random() * 350,
      radiusY: 120 + Math.random() * 250,
      r: color[0],
      g: color[1],
      b: color[2],
      opacity: 0.025 + Math.random() * 0.035,
      rotation: Math.random() * Math.PI * 2,
      driftSpeed: 0.00002 + Math.random() * 0.00004,
      driftAngle: Math.random() * Math.PI * 2,
      pulseSpeed: 0.0002 + Math.random() * 0.0003,
      pulseOffset: Math.random() * Math.PI * 2,
    };
  });
};

const createShootingStar = (width: number, height: number): ShootingStar => {
  const angle = (Math.PI / 6) + Math.random() * (Math.PI / 4);
  const speed = 4 + Math.random() * 6;
  return {
    x: Math.random() * width * 0.8,
    y: Math.random() * height * 0.5,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    length: 40 + Math.random() * 80,
    opacity: 0.6 + Math.random() * 0.4,
    life: 0,
    maxLife: 30 + Math.random() * 40,
    size: 1 + Math.random() * 1.5,
  };
};

const generateTreeLayer = (width: number, density: number): TreePlacement[] => {
  const count = Math.round(density * width);
  return Array.from({ length: count }, () => ({
    x: Math.random() * width,
    treeType: Math.floor(Math.random() * TREE_PATHS.length),
    scale: 0.85 + Math.random() * 0.3,
  }));
};

const drawBackground = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
  const gradient = ctx.createRadialGradient(
    width * 0.5,
    height,
    0,
    width * 0.5,
    height * 0.5,
    Math.max(width, height)
  );
  gradient.addColorStop(0, "#12121e");
  gradient.addColorStop(0.5, "#0a0a15");
  gradient.addColorStop(1, "#050510");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
};

const drawNebulae = (
  ctx: CanvasRenderingContext2D,
  patches: NebulaPatch[],
  time: number
) => {
  for (const patch of patches) {
    const pulse = 1 + Math.sin(time * patch.pulseSpeed + patch.pulseOffset) * 0.15;
    const ox = Math.cos(time * patch.driftSpeed + patch.driftAngle) * 20;
    const oy = Math.sin(time * patch.driftSpeed * 0.7 + patch.driftAngle) * 15;
    const cx = patch.x + ox;
    const cy = patch.y + oy;
    const rx = patch.radiusX * pulse;
    const ry = patch.radiusY * pulse;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(patch.rotation);
    ctx.scale(1, ry / rx);

    const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, rx);
    grad.addColorStop(0, `rgba(${patch.r}, ${patch.g}, ${patch.b}, ${patch.opacity * 1.5})`);
    grad.addColorStop(0.3, `rgba(${patch.r}, ${patch.g}, ${patch.b}, ${patch.opacity})`);
    grad.addColorStop(0.7, `rgba(${patch.r}, ${patch.g}, ${patch.b}, ${patch.opacity * 0.3})`);
    grad.addColorStop(1, `rgba(${patch.r}, ${patch.g}, ${patch.b}, 0)`);

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, 0, rx, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
};

const drawStars = (
  ctx: CanvasRenderingContext2D,
  stars: CanvasStar[],
  time: number
) => {
  for (const star of stars) {
    const twinkle = 0.6 + 0.4 * Math.sin(time * star.twinkleSpeed + star.twinkleOffset);
    const opacity = star.baseOpacity * twinkle;

    if (star.isCross) {
      const armLen = star.size * 3;
      ctx.strokeStyle = `rgba(${star.r}, ${star.g}, ${star.b}, ${opacity})`;
      ctx.lineWidth = 0.6;
      ctx.beginPath();
      ctx.moveTo(star.x - armLen, star.y);
      ctx.lineTo(star.x + armLen, star.y);
      ctx.moveTo(star.x, star.y - armLen);
      ctx.lineTo(star.x, star.y + armLen);
      ctx.stroke();

      ctx.fillStyle = `rgba(${star.r}, ${star.g}, ${star.b}, ${opacity})`;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size * 0.6, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillStyle = `rgba(${star.r}, ${star.g}, ${star.b}, ${opacity})`;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      ctx.fill();

      if (star.size > 1.2) {
        ctx.fillStyle = `rgba(${star.r}, ${star.g}, ${star.b}, ${opacity * 0.15})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size * 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
};

const drawShootingStars = (
  ctx: CanvasRenderingContext2D,
  shootingStars: ShootingStar[]
) => {
  for (const ss of shootingStars) {
    const progress = ss.life / ss.maxLife;
    let alpha = ss.opacity;
    if (progress < 0.1) alpha *= progress / 0.1;
    else if (progress > 0.6) alpha *= 1 - (progress - 0.6) / 0.4;

    const tailX = ss.x - (ss.vx / Math.sqrt(ss.vx * ss.vx + ss.vy * ss.vy)) * ss.length;
    const tailY = ss.y - (ss.vy / Math.sqrt(ss.vx * ss.vx + ss.vy * ss.vy)) * ss.length;

    const grad = ctx.createLinearGradient(tailX, tailY, ss.x, ss.y);
    grad.addColorStop(0, `rgba(255, 255, 255, 0)`);
    grad.addColorStop(0.7, `rgba(220, 230, 255, ${alpha * 0.4})`);
    grad.addColorStop(1, `rgba(255, 255, 255, ${alpha})`);

    ctx.strokeStyle = grad;
    ctx.lineWidth = ss.size;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(tailX, tailY);
    ctx.lineTo(ss.x, ss.y);
    ctx.stroke();

    ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
    ctx.beginPath();
    ctx.arc(ss.x, ss.y, ss.size * 0.8, 0, Math.PI * 2);
    ctx.fill();
  }
};

const drawHorizonGlow = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
  const glowHeight = height * 0.2;
  const grad = ctx.createLinearGradient(0, height, 0, height - glowHeight);
  grad.addColorStop(0, "rgba(168, 183, 232, 0.06)");
  grad.addColorStop(0.32, "rgba(168, 183, 232, 0.02)");
  grad.addColorStop(1, "rgba(168, 183, 232, 0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, height - glowHeight, width, glowHeight);
};

export const StarryBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<CanvasStar[]>([]);
  const nebulaeRef = useRef<NebulaPatch[]>([]);
  const shootingStarsRef = useRef<ShootingStar[]>([]);
  const animFrameRef = useRef<number>(0);
  const lastShootingStarRef = useRef<number>(0);
  const nextShootingStarDelayRef = useRef<number>(
    SHOOTING_STAR_INTERVAL_MIN + Math.random() * (SHOOTING_STAR_INTERVAL_MAX - SHOOTING_STAR_INTERVAL_MIN)
  );

  const [viewBoxWidth, setViewBoxWidth] = useState(window.innerWidth);
  const [backTrees, setBackTrees] = useState(() =>
    generateTreeLayer(window.innerWidth, BACK_TREE_DENSITY)
  );
  const [frontTrees, setFrontTrees] = useState(() =>
    generateTreeLayer(window.innerWidth, FRONT_TREE_DENSITY)
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const initCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      starsRef.current = generateCanvasStars(w, h);
      nebulaeRef.current = generateNebulaPatches(w, h);
      shootingStarsRef.current = [];
      setViewBoxWidth(w);
      setBackTrees(generateTreeLayer(w, BACK_TREE_DENSITY));
      setFrontTrees(generateTreeLayer(w, FRONT_TREE_DENSITY));
    };

    initCanvas();

    let time = 0;
    const animate = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      time += 1;

      ctx.clearRect(0, 0, w, h);
      drawBackground(ctx, w, h);
      drawNebulae(ctx, nebulaeRef.current, time);
      drawStars(ctx, starsRef.current, time * 0.02);
      drawHorizonGlow(ctx, w, h);

      const now = performance.now();
      if (now - lastShootingStarRef.current > nextShootingStarDelayRef.current) {
        shootingStarsRef.current.push(createShootingStar(w, h));
        lastShootingStarRef.current = now;
        nextShootingStarDelayRef.current =
          SHOOTING_STAR_INTERVAL_MIN + Math.random() * (SHOOTING_STAR_INTERVAL_MAX - SHOOTING_STAR_INTERVAL_MIN);
      }

      shootingStarsRef.current = shootingStarsRef.current.filter((ss) => {
        ss.x += ss.vx;
        ss.y += ss.vy;
        ss.life += 1;
        return ss.life < ss.maxLife;
      });
      drawShootingStars(ctx, shootingStarsRef.current);

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);

    const handleResize = () => initCanvas();
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
        style={{ width: "100%", height: "100%" }}
      />

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
