import confetti from "canvas-confetti";
import { useEffect, useRef, useState } from "react";
import bufoConfetti from "../assets/bufo-confetti.png";

interface WinnerConfettiProps {
  active: boolean;
}

const BUFO_FADE_MS = 400;

const launchFromSides = (
  cannon: ReturnType<typeof confetti.create>,
  color: string,
) => {
  const sharedOptions = {
    particleCount: 45,
    spread: 36,
    startVelocity: 29,
    decay: 0.92,
    gravity: 0.75,
    scalar: 0.7,
    ticks: 180,
    colors: [color],
    shapes: ["square", "circle"] as confetti.Shape[],
  };

  void cannon({
    ...sharedOptions,
    angle: 55,
    drift: -0.1,
    origin: { x: 0, y: 0.45 },
  });
  void cannon({
    ...sharedOptions,
    angle: 125,
    drift: 0.1,
    origin: { x: 1, y: 0.45 },
  });
};

export const WinnerConfetti = ({ active }: WinnerConfettiProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [bufosEntered, setBufosEntered] = useState(false);
  const [bufosVisible, setBufosVisible] = useState(false);

  useEffect(() => {
    if (!active || !canvasRef.current) {
      setBufosEntered(false);
      setBufosVisible(false);
      return;
    }

    const cannon = confetti.create(canvasRef.current, {
      resize: true,
      disableForReducedMotion: true,
    });
    const color =
      getComputedStyle(document.documentElement)
        .getPropertyValue("--accent-primary")
        .trim() || "#cba6f7";

    setBufosEntered(false);
    setBufosVisible(false);

    launchFromSides(cannon, color);

    let startFadeOut: number | undefined;
    const revealBufos = window.requestAnimationFrame(() => {
      setBufosEntered(true);
      setBufosVisible(true);
      startFadeOut = window.setTimeout(
        () => setBufosVisible(false),
        BUFO_FADE_MS,
      );
    });

    return () => {
      window.cancelAnimationFrame(revealBufos);
      if (startFadeOut !== undefined) window.clearTimeout(startFadeOut);
      cannon.reset();
    };
  }, [active]);

  const visibility = bufosVisible ? "opacity-100" : "opacity-0";
  const bufoClasses = `absolute top-[45%] z-[61] h-10 w-10 transition-[opacity,translate] duration-[400ms] ease-out sm:h-14 sm:w-14 ${visibility}`;
  const leftPosition = bufosEntered
    ? "-translate-x-full -translate-y-[65%]"
    : "-translate-x-[115%] -translate-y-[50%]";
  const rightPosition = bufosEntered
    ? "translate-x-full -translate-y-[65%]"
    : "translate-x-[115%] -translate-y-[50%]";

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 z-[60] h-full w-full"
      />
      <img
        src={bufoConfetti}
        alt=""
        className={`${bufoClasses} ${leftPosition} left-0 -scale-x-100`}
      />
      <img
        src={bufoConfetti}
        alt=""
        className={`${bufoClasses} ${rightPosition} right-0`}
      />
    </div>
  );
};
