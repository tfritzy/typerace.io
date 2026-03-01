import { useEffect, useRef } from "react";

const AMBER = [251, 191, 36] as const;
const STREAK_COUNT = 22;
const SPAWN_X_OFFSET = 400;
const VERTICAL_PAD = 24;
const MIN_LENGTH = 24;
const MAX_LENGTH_DEPTH_SCALE = 320;
const MAX_LENGTH_RANDOM = 80;
const BASE_SPEED = 0.4;
const MAX_SPEED_DEPTH_SCALE = 9;
const MAX_SPEED_RANDOM = 2;
const MIN_OPACITY = 0.025;
const MAX_OPACITY_DEPTH_SCALE = 0.24;
const MAX_OPACITY_RANDOM = 0.05;
const MIN_WIDTH = 0.4;
const MAX_WIDTH_DEPTH_SCALE = 2.8;
const GRADIENT_MID_STOP = 0.55;
const MID_OPACITY_MULTIPLIER = 0.28;
const GLOW_OPACITY_THRESHOLD = 0.09;
const GLOW_RADIUS_MULTIPLIER = 5;
const GLOW_OPACITY_MULTIPLIER = 1.6;

type Streak = {
  x: number;
  y: number;
  length: number;
  speed: number;
  opacity: number;
  width: number;
};

function makeStreak(w: number, h: number): Streak {
  const depth = Math.pow(Math.random(), 1.5);
  return {
    x: Math.random() * (w + SPAWN_X_OFFSET),
    y: VERTICAL_PAD + Math.random() * (h - VERTICAL_PAD * 2),
    length: MIN_LENGTH + depth * MAX_LENGTH_DEPTH_SCALE + Math.random() * MAX_LENGTH_RANDOM,
    speed: BASE_SPEED + depth * MAX_SPEED_DEPTH_SCALE + Math.random() * MAX_SPEED_RANDOM,
    opacity: MIN_OPACITY + depth * MAX_OPACITY_DEPTH_SCALE + Math.random() * MAX_OPACITY_RANDOM,
    width: MIN_WIDTH + depth * MAX_WIDTH_DEPTH_SCALE,
  };
}

export const KeyboardBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0;
    let h = 0;
    let streaks: Streak[] = [];
    let animId: number;

    const init = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w;
      canvas.height = h;
      streaks = Array.from({ length: STREAK_COUNT }, () => makeStreak(w, h));
    };

    init();
    window.addEventListener("resize", init);

    const draw = () => {
      ctx.clearRect(0, 0, w, h);

      for (const s of streaks) {
        s.x += s.speed;

        if (s.x - s.length > w) {
          const next = makeStreak(w, h);
          next.x = -next.length;
          next.y = VERTICAL_PAD + Math.random() * (h - VERTICAL_PAD * 2);
          Object.assign(s, next);
        }

        const [r, g, b] = AMBER;
        const grad = ctx.createLinearGradient(s.x - s.length, s.y, s.x + 2, s.y);
        grad.addColorStop(0, `rgba(${r},${g},${b},0)`);
        grad.addColorStop(GRADIENT_MID_STOP, `rgba(${r},${g},${b},${s.opacity * MID_OPACITY_MULTIPLIER})`);
        grad.addColorStop(1, `rgba(${r},${g},${b},${s.opacity})`);

        ctx.beginPath();
        ctx.moveTo(s.x - s.length, s.y);
        ctx.lineTo(s.x, s.y);
        ctx.strokeStyle = grad;
        ctx.lineWidth = s.width;
        ctx.lineCap = "round";
        ctx.stroke();

        if (s.opacity > GLOW_OPACITY_THRESHOLD) {
          const glowR = s.width * GLOW_RADIUS_MULTIPLIER;
          const glow = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, glowR);
          glow.addColorStop(0, `rgba(${r},${g},${b},${s.opacity * GLOW_OPACITY_MULTIPLIER})`);
          glow.addColorStop(1, `rgba(${r},${g},${b},0)`);
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(s.x, s.y, glowR, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      animId = requestAnimationFrame(draw);
    };

    animId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", init);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      aria-hidden="true"
    />
  );
};

