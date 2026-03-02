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
        viewBox="0 0 1920 200"
        preserveAspectRatio="none"
        style={{ width: "100%", height: "80px" }}
      >
        <path
          d="M0,200 L0,166
             Q 10,150 20,162 Q 31,154 43,162 Q 55,152 67,162
             Q 79,155 92,166 Q 103,151 115,166 Q 130,156 146,166
             Q 157,153 169,164 Q 181,152 194,165 Q 206,151 219,165
             Q 230,157 242,162 Q 254,152 266,166 Q 276,155 287,165
             Q 298,152 310,163 Q 321,154 333,166 Q 347,157 361,166
             Q 375,151 390,165 Q 402,150 414,163 Q 426,154 439,163
             Q 451,150 464,163 Q 476,152 489,164 Q 501,157 514,164
             Q 526,156 538,164 Q 549,157 560,162 Q 572,153 584,162
             Q 596,153 608,163 Q 623,153 639,163 Q 649,154 660,164
             Q 674,150 688,163 Q 700,154 713,162 Q 726,154 740,166
             Q 751,150 762,164 Q 773,153 785,162 Q 798,155 812,163
             Q 822,157 832,163 Q 845,156 859,164 Q 874,152 889,166
             Q 904,151 919,166 Q 932,152 946,163 Q 961,152 976,165
             Q 991,156 1007,164 Q 1022,151 1037,162 Q 1047,153 1058,164
             Q 1069,150 1081,162 Q 1092,157 1104,162 Q 1115,150 1127,166
             Q 1141,156 1155,166 Q 1167,155 1180,164 Q 1190,150 1201,162
             Q 1215,156 1230,162 Q 1242,152 1255,162 Q 1267,152 1280,165
             Q 1292,151 1304,165 Q 1317,153 1331,166 Q 1343,152 1355,162
             Q 1367,151 1380,163 Q 1390,154 1400,164 Q 1414,156 1429,163
             Q 1442,154 1455,163 Q 1469,152 1483,166 Q 1496,157 1510,164
             Q 1525,150 1540,163 Q 1554,150 1569,162 Q 1582,156 1596,166
             Q 1610,156 1625,165 Q 1638,155 1651,162 Q 1665,154 1680,166
             Q 1694,157 1708,166 Q 1722,154 1736,163 Q 1750,152 1764,164
             Q 1778,155 1793,164 Q 1805,155 1818,162 Q 1829,155 1841,163
             Q 1855,157 1870,164 Q 1882,155 1895,165 Q 1908,157 1920,166
             L1920,200 Z"
          fill="#0c0c0c"
        />
        <path
          d="M0,200 L0,168
             Q 10,159 20,167 Q 33,152 46,165 Q 55,155 64,168
             Q 77,155 90,166 Q 99,159 109,167 Q 118,156 128,164
             Q 137,159 147,167 Q 157,157 168,165 Q 179,156 191,164
             Q 200,157 209,165 Q 222,156 236,166 Q 245,156 254,164
             Q 264,155 274,164 Q 286,154 298,164 Q 308,158 319,167
             Q 331,152 344,164 Q 355,154 366,164 Q 379,153 393,166
             Q 404,158 415,167 Q 425,153 435,165 Q 444,158 453,165
             Q 466,156 479,167 Q 492,157 505,166 Q 517,157 530,168
             Q 539,157 548,165 Q 560,158 573,167 Q 584,155 595,165
             Q 608,159 622,164 Q 632,157 643,166 Q 654,156 665,167
             Q 675,158 685,166 Q 695,156 706,167 Q 717,152 728,168
             Q 739,154 751,168 Q 763,159 776,167 Q 785,158 794,165
             Q 806,156 818,166 Q 829,158 841,168 Q 852,153 864,167
             Q 874,152 884,164 Q 896,159 909,168 Q 920,152 932,167
             Q 945,153 959,168 Q 969,157 979,168 Q 989,158 999,167
             Q 1009,152 1020,166 Q 1030,158 1040,166 Q 1052,159 1065,166
             Q 1075,157 1085,166 Q 1097,156 1109,168 Q 1118,154 1128,166
             Q 1139,159 1150,168 Q 1159,158 1169,165 Q 1178,155 1187,168
             Q 1196,157 1206,164 Q 1217,153 1228,164 Q 1240,155 1252,165
             Q 1261,153 1271,166 Q 1280,154 1290,166 Q 1301,152 1313,166
             Q 1324,158 1335,168 Q 1347,152 1359,166 Q 1369,154 1380,167
             Q 1390,155 1400,168 Q 1409,152 1418,167 Q 1430,158 1443,165
             Q 1453,157 1464,164 Q 1475,154 1487,166 Q 1497,155 1508,165
             Q 1521,152 1535,166 Q 1547,159 1560,165 Q 1569,159 1578,168
             Q 1590,158 1603,166 Q 1614,154 1625,167 Q 1634,153 1644,165
             Q 1657,158 1670,166 Q 1682,157 1694,167 Q 1707,159 1721,167
             Q 1732,152 1744,168 Q 1756,156 1769,167 Q 1779,152 1789,164
             Q 1798,159 1807,167 Q 1819,157 1831,165 Q 1841,156 1851,167
             Q 1864,156 1877,166 Q 1886,154 1896,168 Q 1907,153 1920,166
             L1920,200 Z"
          fill="black"
        />
      </svg>
    </div>
  );
};
