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

      <svg
        className="absolute inset-x-0 bottom-0"
        viewBox="0 0 1920 200"
        preserveAspectRatio="none"
        style={{ width: "100%", height: "120px" }}
      >
        <path
          d="M0,200 L0,160 L40,160 L40,140 L55,140 L55,130 L60,125 L65,130 L65,140 L80,140 L80,160
             L120,160 L120,110 L130,110 L130,100 L140,100 L140,110 L160,110 L160,160
             L200,160 L200,130 L210,130 L210,80 L215,75 L220,80 L220,130 L240,130 L240,160
             L280,160 L280,140 L300,140 L300,120 L310,120 L310,90 L320,90 L320,85 L325,80 L330,85 L330,90 L340,90 L340,120 L350,120 L350,140 L370,140 L370,160
             L420,160 L420,100 L430,100 L430,70 L435,65 L440,70 L440,100 L460,100 L460,160
             L500,160 L500,145 L520,145 L520,130 L540,130 L540,145 L560,145 L560,160
             L600,160 L600,120 L610,120 L610,60 L615,55 L620,60 L620,120 L640,120 L640,160
             L680,160 L680,135 L700,135 L700,110 L710,110 L710,105 L720,105 L720,110 L730,110 L730,135 L750,135 L750,160
             L800,160 L800,140 L820,140 L820,95 L825,90 L830,95 L830,140 L850,140 L850,160
             L890,160 L890,125 L910,125 L910,115 L930,115 L930,125 L950,125 L950,160
             L990,160 L990,105 L1000,105 L1000,75 L1005,70 L1010,75 L1010,105 L1030,105 L1030,160
             L1070,160 L1070,130 L1090,130 L1090,100 L1100,100 L1100,90 L1110,90 L1110,100 L1120,100 L1120,130 L1140,130 L1140,160
             L1180,160 L1180,140 L1200,140 L1200,85 L1205,80 L1210,85 L1210,140 L1230,140 L1230,160
             L1270,160 L1270,120 L1290,120 L1290,110 L1310,110 L1310,120 L1330,120 L1330,160
             L1370,160 L1370,100 L1380,100 L1380,55 L1385,50 L1390,55 L1390,100 L1410,100 L1410,160
             L1450,160 L1450,135 L1470,135 L1470,115 L1480,115 L1480,110 L1490,110 L1490,115 L1500,115 L1500,135 L1520,135 L1520,160
             L1560,160 L1560,120 L1580,120 L1580,90 L1585,85 L1590,90 L1590,120 L1610,120 L1610,160
             L1650,160 L1650,145 L1670,145 L1670,130 L1690,130 L1690,145 L1710,145 L1710,160
             L1750,160 L1750,110 L1760,110 L1760,65 L1765,60 L1770,65 L1770,110 L1790,110 L1790,160
             L1830,160 L1830,140 L1850,140 L1850,125 L1860,125 L1860,120 L1870,120 L1870,125 L1880,125 L1880,140 L1900,140 L1900,160
             L1920,160 L1920,200 Z"
          fill="black"
        />
      </svg>
    </div>
  );
};
