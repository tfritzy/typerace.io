const STARS = [
  { cx: 200, cy: 100, r: 1.5, o: 0.7 },
  { cx: 450, cy: 60, r: 1.2, o: 0.6 },
  { cx: 680, cy: 170, r: 1.3, o: 0.55 },
  { cx: 780, cy: 40, r: 1.0, o: 0.5 },
  { cx: 1100, cy: 120, r: 1.4, o: 0.65 },
  { cx: 1300, cy: 70, r: 1.2, o: 0.6 },
  { cx: 1500, cy: 150, r: 1.1, o: 0.55 },
  { cx: 1700, cy: 90, r: 1.3, o: 0.7 },
  { cx: 350, cy: 220, r: 0.9, o: 0.45 },
  { cx: 900, cy: 260, r: 1.0, o: 0.4 },
  { cx: 1200, cy: 240, r: 1.1, o: 0.45 },
  { cx: 1600, cy: 260, r: 0.9, o: 0.4 },
  { cx: 150, cy: 310, r: 0.8, o: 0.35 },
  { cx: 550, cy: 280, r: 1.0, o: 0.4 },
  { cx: 1450, cy: 300, r: 0.9, o: 0.38 },
  { cx: 100, cy: 30, r: 1.6, o: 0.75 },
  { cx: 1820, cy: 25, r: 1.4, o: 0.7 },
  { cx: 960, cy: 110, r: 1.2, o: 0.5 },
  { cx: 620, cy: 350, r: 0.8, o: 0.3 },
  { cx: 1350, cy: 340, r: 0.8, o: 0.3 },
  { cx: 50, cy: 180, r: 1.0, o: 0.5 },
  { cx: 1870, cy: 160, r: 1.1, o: 0.5 },
  { cx: 300, cy: 140, r: 0.7, o: 0.4 },
  { cx: 1050, cy: 50, r: 0.9, o: 0.45 },
  { cx: 1750, cy: 220, r: 0.8, o: 0.35 },
  { cx: 500, cy: 380, r: 0.7, o: 0.25 },
  { cx: 1400, cy: 180, r: 1.0, o: 0.45 },
  { cx: 820, cy: 320, r: 0.6, o: 0.25 },
];

const CONVERGING_LINES = [
  { endX: 300, o: 0.06, w: 1.5 },
  { endX: 500, o: 0.10, w: 1.2 },
  { endX: 680, o: 0.14, w: 1.0 },
  { endX: 820, o: 0.10, w: 0.8 },
  { endX: 1100, o: 0.10, w: 0.8 },
  { endX: 1240, o: 0.14, w: 1.0 },
  { endX: 1420, o: 0.10, w: 1.2 },
  { endX: 1620, o: 0.06, w: 1.5 },
];

const SPEED_LINES = [
  { x1: 60, y1: 720, x2: 440, y2: 738, o: 0.06 },
  { x1: 120, y1: 820, x2: 520, y2: 840, o: 0.08 },
  { x1: 30, y1: 920, x2: 450, y2: 942, o: 0.07 },
  { x1: 80, y1: 1010, x2: 500, y2: 1030, o: 0.06 },
  { x1: 1480, y1: 740, x2: 1860, y2: 758, o: 0.06 },
  { x1: 1400, y1: 845, x2: 1800, y2: 865, o: 0.08 },
  { x1: 1470, y1: 940, x2: 1870, y2: 960, o: 0.07 },
  { x1: 1420, y1: 1020, x2: 1850, y2: 1040, o: 0.06 },
  { x1: 180, y1: 620, x2: 460, y2: 630, o: 0.04 },
  { x1: 1480, y1: 640, x2: 1760, y2: 650, o: 0.04 },
];

export const RoadBackground = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
      <svg
        viewBox="0 0 1920 1080"
        preserveAspectRatio="xMidYMid slice"
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0a0e17" />
            <stop offset="40%" stopColor="#131921" />
            <stop offset="70%" stopColor="#1a1a24" />
            <stop offset="100%" stopColor="#202020" />
          </linearGradient>

          <radialGradient id="horizonAmbience" cx="50%" cy="58%" r="45%" fx="50%" fy="58%">
            <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.14" />
            <stop offset="25%" stopColor="#f59e0b" stopOpacity="0.07" />
            <stop offset="50%" stopColor="#d97706" stopOpacity="0.03" />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </radialGradient>

          <linearGradient id="roadHint" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0a0e17" stopOpacity="0" />
            <stop offset="30%" stopColor="#0a0e17" stopOpacity="0" />
            <stop offset="60%" stopColor="#0a0e17" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#0a0e17" stopOpacity="0.5" />
          </linearGradient>

          <linearGradient id="roadEdge" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fbbf24" stopOpacity="0" />
            <stop offset="40%" stopColor="#fbbf24" stopOpacity="0" />
            <stop offset="70%" stopColor="#fbbf24" stopOpacity="0.04" />
            <stop offset="100%" stopColor="#fbbf24" stopOpacity="0.08" />
          </linearGradient>

          <linearGradient id="convergeLine" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fbbf24" stopOpacity="0" />
            <stop offset="30%" stopColor="#fbbf24" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#fbbf24" stopOpacity="0.25" />
          </linearGradient>

          <filter id="wideGlow">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="starGlow" x="-300%" y="-300%" width="700%" height="700%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <rect width="1920" height="1080" fill="url(#skyGrad)" />

        <rect width="1920" height="1080" fill="url(#horizonAmbience)" />

        {STARS.map((star, i) => (
          <circle
            key={`s${i}`}
            cx={star.cx}
            cy={star.cy}
            r={star.r}
            fill="#ffffff"
            opacity={star.o}
            filter="url(#starGlow)"
          />
        ))}

        {CONVERGING_LINES.map((cl, i) => (
          <line
            key={`cl${i}`}
            x1={960}
            y1={400}
            x2={cl.endX}
            y2={1080}
            stroke="url(#convergeLine)"
            strokeWidth={cl.w}
            opacity={cl.o}
            filter="url(#wideGlow)"
          />
        ))}

        {[0.2, 0.4, 0.6, 0.8].map((t, i) => {
          const y = 680 + t * 400;
          const halfW = t * 320;
          return (
            <line
              key={`h${i}`}
              x1={960 - halfW}
              y1={y}
              x2={960 + halfW}
              y2={y}
              stroke="#fbbf24"
              strokeWidth="0.5"
              opacity={0.03 + t * 0.04}
            />
          );
        })}

        {SPEED_LINES.map((sl, i) => (
          <line
            key={`sp${i}`}
            x1={sl.x1}
            y1={sl.y1}
            x2={sl.x2}
            y2={sl.y2}
            stroke="#fbbf24"
            strokeWidth="1.5"
            opacity={sl.o}
            strokeLinecap="round"
          />
        ))}

        <polygon
          points="930,680 990,680 1160,1080 760,1080"
          fill="url(#roadHint)"
        />

        <line x1="930" y1="680" x2="760" y2="1080" stroke="url(#roadEdge)" strokeWidth="1" />
        <line x1="990" y1="680" x2="1160" y2="1080" stroke="url(#roadEdge)" strokeWidth="1" />
      </svg>
    </div>
  );
};
