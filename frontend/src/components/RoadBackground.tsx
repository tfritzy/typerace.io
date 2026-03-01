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

const DASHES = [
  { y: 640, len: 10, w: 1.5 },
  { y: 690, len: 16, w: 1.8 },
  { y: 750, len: 24, w: 2.2 },
  { y: 820, len: 34, w: 2.6 },
  { y: 900, len: 46, w: 3.0 },
  { y: 990, len: 58, w: 3.4 },
  { y: 1060, len: 50, w: 3.6 },
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
            <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.18" />
            <stop offset="25%" stopColor="#f59e0b" stopOpacity="0.10" />
            <stop offset="50%" stopColor="#d97706" stopOpacity="0.04" />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </radialGradient>

          <radialGradient id="vanishGlow" cx="50%" cy="56%" r="12%" fx="50%" fy="56%">
            <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.35" />
            <stop offset="40%" stopColor="#f59e0b" stopOpacity="0.15" />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </radialGradient>

          <linearGradient id="roadSurface" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1e1e1e" />
            <stop offset="100%" stopColor="#161616" />
          </linearGradient>

          <linearGradient id="edgeLine" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
            <stop offset="30%" stopColor="#ffffff" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.35" />
          </linearGradient>

          <linearGradient id="shoulderGradL" x1="1" y1="0" x2="0" y2="0">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.04" />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </linearGradient>

          <linearGradient id="shoulderGradR" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.04" />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </linearGradient>

          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="bigGlow">
            <feGaussianBlur stdDeviation="12" result="blur" />
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

        <circle cx="960" cy="600" r="250" fill="#fbbf24" opacity="0.04" filter="url(#bigGlow)" />

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

        <polygon
          points="960,580 340,1080 1580,1080"
          fill="url(#roadSurface)"
          opacity="0.9"
        />

        <polygon
          points="960,580 340,1080 200,1080 960,560"
          fill="url(#shoulderGradL)"
        />
        <polygon
          points="960,580 1580,1080 1720,1080 960,560"
          fill="url(#shoulderGradR)"
        />

        <line x1="960" y1="580" x2="650" y2="1080" stroke="url(#edgeLine)" strokeWidth="2.5" />
        <line x1="960" y1="580" x2="1270" y2="1080" stroke="url(#edgeLine)" strokeWidth="2.5" />

        {DASHES.map((dash, i) => {
          const t = (dash.y - 580) / 500;
          return (
            <line
              key={`d${i}`}
              x1={960}
              y1={dash.y}
              x2={960}
              y2={dash.y + dash.len}
              stroke="#fbbf24"
              strokeWidth={dash.w}
              opacity={0.2 + t * 0.5}
              strokeLinecap="round"
              filter="url(#glow)"
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

        <rect x="0" y="580" width="1920" height="500" fill="url(#vanishGlow)" opacity="0.5" />

        <circle cx="920" cy="558" r="3" fill="#fbbf24" opacity="0.4" filter="url(#glow)" />
        <circle cx="1000" cy="560" r="3" fill="#fbbf24" opacity="0.4" filter="url(#glow)" />
        <circle cx="870" cy="565" r="2" fill="#ff6b35" opacity="0.2" filter="url(#glow)" />
        <circle cx="1050" cy="563" r="2" fill="#ff6b35" opacity="0.2" filter="url(#glow)" />
        <circle cx="940" cy="555" r="1.5" fill="#ffffff" opacity="0.15" filter="url(#glow)" />
        <circle cx="980" cy="556" r="1.5" fill="#ffffff" opacity="0.15" filter="url(#glow)" />
        <circle cx="830" cy="570" r="1.5" fill="#fbbf24" opacity="0.12" filter="url(#glow)" />
        <circle cx="1090" cy="568" r="1.5" fill="#fbbf24" opacity="0.12" filter="url(#glow)" />
      </svg>
    </div>
  );
};
