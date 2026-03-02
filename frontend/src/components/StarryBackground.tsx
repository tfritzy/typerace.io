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

      <div className="absolute inset-x-0 bottom-0 h-[20%] horizon-glow" />

      <svg
        className="absolute inset-x-0 bottom-0"
        viewBox="0 0 1920 300"
        preserveAspectRatio="none"
        style={{ width: "100%", height: "120px" }}
      >
        <path
          d="M0,300 L0,258
             C 10,211 30,211 40,260
             C 51,215 73,215 85,260
             C 99,211 127,211 142,260
             C 154,215 180,215 193,260
             C 204,218 226,218 238,260
             C 253,226 283,226 298,260
             C 309,214 333,214 345,260
             C 361,229 393,229 410,260
             C 425,226 457,226 473,260
             C 485,217 509,217 521,260
             C 534,219 561,219 575,260
             C 587,225 611,225 623,260
             C 636,214 663,214 677,260
             C 691,215 720,215 735,260
             C 751,210 785,210 802,260
             C 814,215 840,215 853,260
             C 869,212 902,212 919,260
             C 933,225 962,225 977,260
             C 989,216 1013,216 1025,260
             C 1037,215 1063,215 1076,260
             C 1090,228 1118,228 1133,260
             C 1148,229 1178,229 1193,260
             C 1210,226 1244,226 1262,260
             C 1273,223 1295,223 1307,260
             C 1320,211 1346,211 1359,260
             C 1371,219 1395,219 1407,260
             C 1420,217 1448,217 1462,260
             C 1475,210 1502,210 1516,260
             C 1528,218 1552,218 1564,260
             C 1576,221 1600,221 1613,260
             C 1626,227 1652,227 1666,260
             C 1679,217 1706,217 1720,260
             C 1736,221 1768,221 1784,260
             C 1795,229 1819,229 1831,260
             C 1841,218 1861,218 1871,260
             C 1884,211 1910,211 1920,260
             L1920,300 Z"
          fill="#0c0c0c"
        />
        <path
          d="M0,300 L0,263
             C 10,237 30,237 41,265
             C 54,234 82,234 96,265
             C 105,224 124,224 134,265
             C 143,227 161,227 170,265
             C 184,235 214,235 229,265
             C 241,226 265,226 277,265
             C 286,235 305,235 315,265
             C 328,221 354,221 368,265
             C 380,221 405,221 418,265
             C 427,235 447,235 457,265
             C 471,224 499,224 514,265
             C 527,225 555,225 569,265
             C 582,230 608,230 621,265
             C 629,219 647,219 656,265
             C 670,223 698,223 712,265
             C 727,229 758,229 774,265
             C 785,218 809,218 821,265
             C 833,218 859,218 872,265
             C 882,226 902,226 913,265
             C 921,230 939,230 948,265
             C 958,219 979,219 990,265
             C 1001,234 1023,234 1035,265
             C 1048,232 1075,232 1089,265
             C 1098,218 1117,218 1127,265
             C 1139,224 1163,224 1175,265
             C 1185,237 1205,237 1215,265
             C 1224,228 1243,228 1253,265
             C 1264,234 1288,234 1300,265
             C 1313,223 1340,223 1354,265
             C 1364,225 1385,225 1396,265
             C 1404,233 1422,233 1431,265
             C 1441,234 1461,234 1472,265
             C 1485,230 1511,230 1525,265
             C 1540,232 1570,232 1586,265
             C 1598,232 1624,232 1637,265
             C 1650,237 1677,237 1691,265
             C 1700,230 1718,230 1727,265
             C 1738,232 1761,232 1773,265
             C 1788,232 1818,232 1833,265
             C 1845,226 1869,226 1881,265
             C 1892,237 1914,237 1920,265
             L1920,300 Z"
          fill="black"
        />
      </svg>
    </div>
  );
};
