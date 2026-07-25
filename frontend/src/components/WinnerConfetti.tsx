import confetti from "canvas-confetti";
import { useEffect } from "react";

const launchFromSides = (
  accentColor: string,
  particleCount: number,
  startVelocity: number,
) => {
  const sharedOptions = {
    particleCount,
    spread: 36,
    startVelocity,
    decay: 0.92,
    gravity: 0.75,
    scalar: 0.7,
    ticks: 180,
    colors: [accentColor],
    shapes: ["square", "circle"] as confetti.Shape[],
    disableForReducedMotion: true,
    zIndex: 60,
  };

  void confetti({
    ...sharedOptions,
    angle: 55,
    drift: -0.1,
    origin: { x: -0.02, y: 0.5 },
  });

  void confetti({
    ...sharedOptions,
    angle: 125,
    drift: 0.1,
    origin: { x: 1.02, y: 0.5 },
  });
};

export const WinnerConfetti = () => {
  useEffect(() => {
    const accentColor = getComputedStyle(document.documentElement)
      .getPropertyValue("--accent-primary")
      .trim();

    launchFromSides(accentColor || "#cba6f7", 30, 29);

    const followUpBurst = window.setTimeout(() => {
      launchFromSides(accentColor || "#cba6f7", 15, 25);
    }, 60);

    return () => {
      window.clearTimeout(followUpBurst);
      confetti.reset();
    };
  }, []);

  return null;
};
