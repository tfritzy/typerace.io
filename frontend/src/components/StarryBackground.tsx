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
        style={{ width: "100%", height: "100px" }}
      >
        <path
          d="M0,200 L0,175
             L15,175 L15,170 L20,162 L25,170 L25,175
             L45,175 L45,168 L50,158 L55,168 L55,175
             L70,175 L70,165 L73,155 L76,148 L80,155 L83,165 L83,175
             L100,175 L100,170 L105,160 L110,170 L110,175
             L130,175 L130,168 L135,155 L140,168 L140,175
             L160,175 L160,170 L163,162 L165,155 L167,148 L170,155 L173,162 L175,170 L175,175
             L200,175 L200,168 L205,158 L210,168 L210,175
             L230,175 L230,172 L235,164 L240,172 L240,175
             L260,175 L260,168 L265,155 L268,145 L272,155 L275,168 L275,175
             L310,175 L310,170 L315,162 L318,155 L322,162 L325,170 L325,175
             L350,175 L350,168 L355,158 L360,168 L360,175
             L380,175 L380,172 L385,165 L390,172 L390,175
             L420,175 L420,168 L425,160 L430,155 L435,160 L440,168 L440,175
             L470,175 L470,165 L475,155 L478,148 L480,142 L482,148 L485,155 L490,165 L490,175

             L520,175 L520,170 L525,162 L528,155 L530,148 L533,155 L536,162 L540,170 L540,175
             L555,175 L555,165 L560,150 L565,165 L565,175
             L580,175 L580,158 L585,140 L590,158 L590,175
             L600,175 L600,168 L605,148 L608,138 L610,130 L612,138 L615,148 L620,168 L620,175
             L630,175 L630,162 L635,142 L637,132 L640,125 L643,132 L645,142 L650,162 L650,175
             L660,175 L660,155 L665,138 L668,128 L670,120 L672,128 L675,138 L680,155 L680,175

             L700,175 L700,165 L705,148 L708,138 L710,128 L712,120 L714,112 L716,105 L718,98
             L720,105 L722,112 L725,120 L728,128 L730,138 L735,148 L740,165 L740,175
             L748,175 L748,158 L752,138 L755,120 L758,108 L760,98 L762,90
             L764,82 L765,78 L766,82 L768,90 L770,98 L773,108 L776,120 L780,138 L784,158 L784,175
             L790,175 L790,160 L794,142 L797,125 L800,112 L802,100 L804,92
             L806,86 L808,82 L810,78 L812,82 L814,86 L816,92 L818,100 L820,112 L823,125 L826,142 L830,160 L830,175
             L838,175 L838,162 L842,145 L845,130 L848,118 L850,108 L852,100
             L854,94 L856,90 L858,87 L860,85 L862,87 L864,90 L866,94 L868,100
             L870,108 L872,118 L875,130 L878,145 L882,162 L882,175
             L890,175 L890,158 L894,140 L897,125 L900,115 L903,108 L905,102
             L907,98 L909,95 L911,93 L912,92 L914,93 L916,95 L918,98
             L920,102 L922,108 L925,115 L928,125 L931,140 L935,158 L935,175
             L942,175 L942,165 L946,148 L949,135 L952,125 L954,118 L956,112
             L958,108 L960,105 L962,108 L964,112 L966,118 L968,125
             L971,135 L974,148 L978,165 L978,175
             L988,175 L988,160 L992,145 L995,132 L998,122 L1000,114
             L1002,108 L1004,104 L1006,108 L1008,114 L1010,122
             L1013,132 L1016,145 L1020,160 L1020,175
             L1032,175 L1032,162 L1036,148 L1039,138 L1042,130 L1044,124
             L1046,120 L1048,124 L1050,130 L1053,138 L1056,148 L1060,162 L1060,175
             L1075,175 L1075,158 L1079,142 L1082,130 L1084,122
             L1086,116 L1088,112 L1090,110 L1092,112 L1094,116 L1096,122
             L1098,130 L1101,142 L1105,158 L1105,175
             L1118,175 L1118,165 L1122,150 L1125,140 L1128,132
             L1130,126 L1132,122 L1134,120 L1136,122 L1138,126
             L1140,132 L1143,140 L1146,150 L1150,165 L1150,175
             L1160,175 L1160,162 L1164,148 L1167,138 L1170,130 L1172,125
             L1174,130 L1177,138 L1180,148 L1184,162 L1184,175

             L1200,175 L1200,165 L1204,150 L1207,140 L1210,148 L1214,165 L1214,175
             L1230,175 L1230,162 L1234,148 L1237,138 L1240,148 L1244,162 L1244,175
             L1260,175 L1260,168 L1264,155 L1267,148 L1270,155 L1274,168 L1274,175
             L1290,175 L1290,165 L1294,152 L1297,145 L1300,152 L1304,165 L1304,175

             L1330,175 L1330,170 L1335,162 L1338,155 L1342,162 L1345,170 L1345,175
             L1370,175 L1370,168 L1375,158 L1378,150 L1382,158 L1385,168 L1385,175
             L1410,175 L1410,172 L1415,165 L1420,172 L1420,175
             L1440,175 L1440,170 L1443,162 L1445,155 L1447,148 L1450,155 L1453,162 L1455,170 L1455,175
             L1480,175 L1480,168 L1485,158 L1490,168 L1490,175
             L1510,175 L1510,172 L1513,165 L1515,158 L1518,165 L1520,172 L1520,175
             L1545,175 L1545,168 L1548,158 L1550,150 L1553,158 L1555,168 L1555,175
             L1580,175 L1580,170 L1585,162 L1590,170 L1590,175
             L1610,175 L1610,172 L1615,165 L1618,158 L1622,165 L1625,172 L1625,175
             L1650,175 L1650,168 L1655,155 L1660,168 L1660,175
             L1680,175 L1680,170 L1685,162 L1690,170 L1690,175
             L1710,175 L1710,172 L1715,165 L1720,172 L1720,175
             L1740,175 L1740,168 L1745,158 L1750,168 L1750,175
             L1775,175 L1775,170 L1778,162 L1780,155 L1783,162 L1785,170 L1785,175
             L1810,175 L1810,172 L1815,165 L1820,172 L1820,175
             L1845,175 L1845,168 L1850,158 L1855,168 L1855,175
             L1880,175 L1880,172 L1885,165 L1890,172 L1890,175
             L1910,175 L1910,170 L1915,162 L1920,170

             L1920,175 L1920,200 Z"
          fill="black"
        />
      </svg>
    </div>
  );
};
