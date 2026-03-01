import { useEffect, useRef } from "react";

const STAR_COUNT = 200;
const SHOOTING_STAR_INTERVAL_MIN = 4000;
const SHOOTING_STAR_INTERVAL_MAX = 10000;
const MIN_STAR_OPACITY = 0.6;
const STAR_OPACITY_RANGE = 0.4;

interface Star {
  x: number;
  y: number;
  size: number;
  twinkleDelay: number;
  twinkleDuration: number;
}

const generateStars = (): Star[] => {
  return Array.from({ length: STAR_COUNT }, () => ({
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2 + 0.5,
    twinkleDelay: Math.random() * 5,
    twinkleDuration: 2 + Math.random() * 3,
  }));
};

export const StarryBackground = () => {
  const shootingStarContainerRef = useRef<HTMLDivElement>(null);
  const starsRef = useRef<Star[]>(generateStars());

  useEffect(() => {
    const container = shootingStarContainerRef.current;
    if (!container) return;

    let timeoutId: ReturnType<typeof setTimeout>;

    const createShootingStar = () => {
      const star = document.createElement("div");
      star.className = "shooting-star";
      star.style.top = `${Math.random() * 40}%`;
      star.style.left = `${Math.random() * 70 + 10}%`;
      star.style.setProperty("--angle", `${Math.random() * 20 + 20}deg`);
      container.appendChild(star);

      setTimeout(() => {
        star.remove();
      }, 1500);

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

      <div className="absolute inset-x-0 bottom-0 h-[30%] horizon-glow" />
    </div>
  );
};
