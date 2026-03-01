import { useEffect, useRef } from "react";

const AMBER_R = 251;
const AMBER_G = 191;
const AMBER_B = 36;
const LINE_ANGLE = (35 * Math.PI) / 180;
const PATTERN_CYCLE = 90;
const ANIM_SPEED = 0.18;
const VIGNETTE_INNER_RATIO = 0.35;
const VIGNETTE_OUTER_RATIO = 0.75;
const VIGNETTE_MAX_ALPHA = 0.82;
const GLOW_SHADOW_ALPHA = 0.4;
const GLOW_BLUR = 10;

type StripeDef = { offset: number; width: number; opacity: number; glow?: boolean };

const STRIPE_DEFS: StripeDef[] = [
  { offset: 0, width: 0.5, opacity: 0.03 },
  { offset: 16, width: 1.2, opacity: 0.055 },
  { offset: 32, width: 0.5, opacity: 0.02 },
  { offset: 60, width: 2.2, opacity: 0.1, glow: true },
  { offset: 70, width: 0.6, opacity: 0.035 },
];

export const KeyboardBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0;
    let h = 0;
    let offset = 0;
    let animId: number;

    const init = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w;
      canvas.height = h;
    };

    init();
    window.addEventListener("resize", init);

    const draw = () => {
      ctx.clearRect(0, 0, w, h);

      ctx.save();
      ctx.translate(w / 2, h / 2);
      ctx.rotate(LINE_ANGLE);

      const diagonal = Math.sqrt(w * w + h * h);
      const halfDiag = diagonal / 2;
      const numCycles = Math.ceil(diagonal / PATTERN_CYCLE) + 2;
      const animOffset = offset % PATTERN_CYCLE;

      for (let cycle = -numCycles; cycle <= numCycles; cycle++) {
        for (const stripe of STRIPE_DEFS) {
          const y = cycle * PATTERN_CYCLE + stripe.offset - animOffset;
          if (stripe.glow) {
            ctx.shadowColor = `rgba(${AMBER_R},${AMBER_G},${AMBER_B},${GLOW_SHADOW_ALPHA})`;
            ctx.shadowBlur = GLOW_BLUR;
          } else {
            ctx.shadowBlur = 0;
          }
          ctx.beginPath();
          ctx.moveTo(-halfDiag, y);
          ctx.lineTo(halfDiag, y);
          ctx.strokeStyle = `rgba(${AMBER_R},${AMBER_G},${AMBER_B},${stripe.opacity})`;
          ctx.lineWidth = stripe.width;
          ctx.stroke();
        }
      }

      ctx.shadowBlur = 0;
      ctx.restore();

      const vignette = ctx.createRadialGradient(
        w / 2, h / 2, Math.min(w, h) * VIGNETTE_INNER_RATIO,
        w / 2, h / 2, Math.max(w, h) * VIGNETTE_OUTER_RATIO
      );
      vignette.addColorStop(0, "rgba(32,32,32,0)");
      vignette.addColorStop(1, `rgba(32,32,32,${VIGNETTE_MAX_ALPHA})`);
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, w, h);

      offset += ANIM_SPEED;
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


