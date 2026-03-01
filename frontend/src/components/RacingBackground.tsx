export const RacingBackground = () => {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        overflow: "hidden",
        pointerEvents: "none",
      }}
    >
      <svg
        viewBox="0 0 1920 1080"
        preserveAspectRatio="xMidYMid slice"
        style={{ width: "100%", height: "100%", display: "block" }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="sky-glow" cx="50%" cy="45%" r="55%">
            <stop offset="0%" stopColor="#3d2e10" />
            <stop offset="35%" stopColor="#28221a" />
            <stop offset="70%" stopColor="#1e1e1e" />
            <stop offset="100%" stopColor="#181818" />
          </radialGradient>

          <radialGradient id="horizon-amber" cx="50%" cy="46%" r="40%">
            <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.18" />
            <stop offset="30%" stopColor="#f59e0b" stopOpacity="0.08" />
            <stop offset="70%" stopColor="#f59e0b" stopOpacity="0.02" />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </radialGradient>

          <linearGradient id="road-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#333" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#1a1a1a" stopOpacity="0.6" />
          </linearGradient>

          <linearGradient id="edge-glow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.7" />
            <stop offset="40%" stopColor="#fbbf24" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
          </linearGradient>

          <linearGradient id="dash-fade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.6" />
            <stop offset="50%" stopColor="#fbbf24" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
          </linearGradient>

          <linearGradient id="speed-gold-l" x1="1" y1="0" x2="0" y2="0">
            <stop offset="0%" stopColor="#fbbf24" stopOpacity="0" />
            <stop offset="20%" stopColor="#fbbf24" stopOpacity="0.7" />
            <stop offset="80%" stopColor="#fbbf24" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
          </linearGradient>

          <linearGradient id="speed-amber-l" x1="1" y1="0" x2="0" y2="0">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0" />
            <stop offset="25%" stopColor="#f59e0b" stopOpacity="0.5" />
            <stop offset="75%" stopColor="#f59e0b" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
          </linearGradient>

          <linearGradient id="speed-white-l" x1="1" y1="0" x2="0" y2="0">
            <stop offset="0%" stopColor="#fff" stopOpacity="0" />
            <stop offset="30%" stopColor="#fff" stopOpacity="0.35" />
            <stop offset="70%" stopColor="#fff" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#fff" stopOpacity="0" />
          </linearGradient>

          <linearGradient id="speed-gold-r" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#fbbf24" stopOpacity="0" />
            <stop offset="20%" stopColor="#fbbf24" stopOpacity="0.7" />
            <stop offset="80%" stopColor="#fbbf24" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
          </linearGradient>

          <linearGradient id="speed-amber-r" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0" />
            <stop offset="25%" stopColor="#f59e0b" stopOpacity="0.5" />
            <stop offset="75%" stopColor="#f59e0b" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
          </linearGradient>

          <linearGradient id="speed-white-r" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#fff" stopOpacity="0" />
            <stop offset="30%" stopColor="#fff" stopOpacity="0.35" />
            <stop offset="70%" stopColor="#fff" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#fff" stopOpacity="0" />
          </linearGradient>

          <filter id="glow-sm">
            <feGaussianBlur stdDeviation="2" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="glow-md">
            <feGaussianBlur stdDeviation="6" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="glow-lg">
            <feGaussianBlur stdDeviation="14" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <rect width="1920" height="1080" fill="url(#sky-glow)" />
        <rect width="1920" height="1080" fill="url(#horizon-amber)" />

        <polygon
          points="960,420 200,1080 1720,1080"
          fill="url(#road-fill)"
          opacity="0.7"
        />

        <g filter="url(#glow-md)">
          <line x1="960" y1="420" x2="200" y2="1080" stroke="url(#edge-glow)" strokeWidth="2.5" />
          <line x1="960" y1="420" x2="1720" y2="1080" stroke="url(#edge-glow)" strokeWidth="2.5" />
        </g>

        <g>
          <line x1="960" y1="440" x2="700" y2="1080" stroke="url(#dash-fade)" strokeWidth="1.5" strokeDasharray="12 24" />
          <line x1="960" y1="440" x2="1220" y2="1080" stroke="url(#dash-fade)" strokeWidth="1.5" strokeDasharray="12 24" />
        </g>

        <g filter="url(#glow-lg)">
          <ellipse cx="960" cy="420" rx="250" ry="18" fill="#fbbf24" opacity="0.12" />
          <ellipse cx="960" cy="420" rx="100" ry="6" fill="#fbbf24" opacity="0.2" />
        </g>

        <g filter="url(#glow-md)">
          <line x1="100" y1="465" x2="720" y2="448" stroke="url(#speed-gold-l)" strokeWidth="2" strokeLinecap="round" />
          <line x1="1200" y1="460" x2="1820" y2="443" stroke="url(#speed-gold-r)" strokeWidth="2" strokeLinecap="round" />

          <line x1="50" y1="500" x2="580" y2="487" stroke="url(#speed-white-l)" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="1340" y1="495" x2="1870" y2="482" stroke="url(#speed-white-r)" strokeWidth="1.5" strokeLinecap="round" />

          <line x1="180" y1="530" x2="650" y2="520" stroke="url(#speed-amber-l)" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="1270" y1="525" x2="1740" y2="515" stroke="url(#speed-amber-r)" strokeWidth="1.5" strokeLinecap="round" />
        </g>

        <g filter="url(#glow-sm)">
          <line x1="30" y1="560" x2="450" y2="552" stroke="url(#speed-gold-l)" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
          <line x1="1470" y1="555" x2="1890" y2="547" stroke="url(#speed-gold-r)" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />

          <line x1="120" y1="590" x2="500" y2="583" stroke="url(#speed-white-l)" strokeWidth="1" strokeLinecap="round" opacity="0.5" />
          <line x1="1420" y1="585" x2="1800" y2="578" stroke="url(#speed-white-r)" strokeWidth="1" strokeLinecap="round" opacity="0.5" />

          <line x1="250" y1="620" x2="550" y2="615" stroke="url(#speed-amber-l)" strokeWidth="0.8" strokeLinecap="round" opacity="0.4" />
          <line x1="1370" y1="615" x2="1670" y2="610" stroke="url(#speed-amber-r)" strokeWidth="0.8" strokeLinecap="round" opacity="0.4" />

          <line x1="80" y1="650" x2="380" y2="646" stroke="url(#speed-white-l)" strokeWidth="0.7" strokeLinecap="round" opacity="0.3" />
          <line x1="1540" y1="645" x2="1840" y2="641" stroke="url(#speed-white-r)" strokeWidth="0.7" strokeLinecap="round" opacity="0.3" />
        </g>

        <g filter="url(#glow-lg)" opacity="0.25">
          <ellipse cx="350" cy="440" rx="280" ry="80" fill="#fbbf24" />
          <ellipse cx="1570" cy="440" rx="280" ry="80" fill="#f59e0b" />
        </g>

        <g opacity="0.5">
          <circle cx="280" cy="140" r="1.2" fill="#fff" opacity="0.7" />
          <circle cx="520" cy="90" r="1" fill="#fff" opacity="0.5" />
          <circle cx="780" cy="60" r="0.8" fill="#fbbf24" opacity="0.4" />
          <circle cx="1140" cy="80" r="0.9" fill="#fbbf24" opacity="0.35" />
          <circle cx="1400" cy="120" r="1.1" fill="#fff" opacity="0.6" />
          <circle cx="1640" cy="160" r="1" fill="#fff" opacity="0.4" />
          <circle cx="160" cy="260" r="0.8" fill="#fff" opacity="0.4" />
          <circle cx="1760" cy="240" r="0.9" fill="#fff" opacity="0.45" />
          <circle cx="420" cy="210" r="0.7" fill="#fff" opacity="0.35" />
          <circle cx="1520" cy="70" r="1" fill="#fff" opacity="0.55" />
          <circle cx="650" cy="170" r="0.6" fill="#fff" opacity="0.3" />
          <circle cx="1250" cy="190" r="0.7" fill="#fff" opacity="0.3" />
          <circle cx="100" cy="100" r="0.9" fill="#fff" opacity="0.45" />
          <circle cx="1850" cy="110" r="0.8" fill="#fff" opacity="0.35" />
          <circle cx="360" cy="40" r="0.7" fill="#fff" opacity="0.5" />
          <circle cx="1580" cy="30" r="0.8" fill="#fff" opacity="0.4" />
          <circle cx="900" cy="35" r="0.6" fill="#fbbf24" opacity="0.3" />
          <circle cx="1050" cy="50" r="0.5" fill="#fbbf24" opacity="0.25" />
          <circle cx="700" cy="300" r="0.5" fill="#fff" opacity="0.2" />
          <circle cx="1200" cy="310" r="0.6" fill="#fff" opacity="0.2" />
        </g>

        <g filter="url(#glow-md)" opacity="0.06">
          <rect x="0" y="415" width="1920" height="3" fill="#fbbf24" />
        </g>
      </svg>
    </div>
  );
};
