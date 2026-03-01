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
          <radialGradient id="sky-glow" cx="50%" cy="42%" r="60%">
            <stop offset="0%" stopColor="#4a3510" />
            <stop offset="25%" stopColor="#352818" />
            <stop offset="55%" stopColor="#252018" />
            <stop offset="100%" stopColor="#1a1a1a" />
          </radialGradient>

          <radialGradient id="horizon-amber" cx="50%" cy="42%" r="45%">
            <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.35" />
            <stop offset="20%" stopColor="#f59e0b" stopOpacity="0.18" />
            <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.06" />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </radialGradient>

          <linearGradient id="road-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#383838" stopOpacity="1" />
            <stop offset="100%" stopColor="#222" stopOpacity="0.8" />
          </linearGradient>

          <linearGradient id="edge-glow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.9" />
            <stop offset="30%" stopColor="#fbbf24" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
          </linearGradient>

          <linearGradient id="dash-fade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.8" />
            <stop offset="40%" stopColor="#fbbf24" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
          </linearGradient>

          <linearGradient id="speed-gold-l" x1="1" y1="0" x2="0" y2="0">
            <stop offset="0%" stopColor="#fbbf24" stopOpacity="0" />
            <stop offset="15%" stopColor="#fbbf24" stopOpacity="0.9" />
            <stop offset="85%" stopColor="#fbbf24" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
          </linearGradient>

          <linearGradient id="speed-amber-l" x1="1" y1="0" x2="0" y2="0">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0" />
            <stop offset="20%" stopColor="#f59e0b" stopOpacity="0.7" />
            <stop offset="80%" stopColor="#f59e0b" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
          </linearGradient>

          <linearGradient id="speed-white-l" x1="1" y1="0" x2="0" y2="0">
            <stop offset="0%" stopColor="#fff" stopOpacity="0" />
            <stop offset="25%" stopColor="#fff" stopOpacity="0.5" />
            <stop offset="75%" stopColor="#fff" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#fff" stopOpacity="0" />
          </linearGradient>

          <linearGradient id="speed-gold-r" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#fbbf24" stopOpacity="0" />
            <stop offset="15%" stopColor="#fbbf24" stopOpacity="0.9" />
            <stop offset="85%" stopColor="#fbbf24" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
          </linearGradient>

          <linearGradient id="speed-amber-r" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0" />
            <stop offset="20%" stopColor="#f59e0b" stopOpacity="0.7" />
            <stop offset="80%" stopColor="#f59e0b" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
          </linearGradient>

          <linearGradient id="speed-white-r" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#fff" stopOpacity="0" />
            <stop offset="25%" stopColor="#fff" stopOpacity="0.5" />
            <stop offset="75%" stopColor="#fff" stopOpacity="0.5" />
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
          points="960,400 100,1080 1820,1080"
          fill="url(#road-fill)"
          opacity="0.85"
        />

        <g filter="url(#glow-md)">
          <line x1="960" y1="400" x2="100" y2="1080" stroke="url(#edge-glow)" strokeWidth="3" />
          <line x1="960" y1="400" x2="1820" y2="1080" stroke="url(#edge-glow)" strokeWidth="3" />
        </g>

        <g>
          <line x1="960" y1="420" x2="650" y2="1080" stroke="url(#dash-fade)" strokeWidth="2" strokeDasharray="14 28" />
          <line x1="960" y1="420" x2="1270" y2="1080" stroke="url(#dash-fade)" strokeWidth="2" strokeDasharray="14 28" />
        </g>

        <g filter="url(#glow-lg)">
          <ellipse cx="960" cy="400" rx="300" ry="25" fill="#fbbf24" opacity="0.2" />
          <ellipse cx="960" cy="400" rx="120" ry="8" fill="#fbbf24" opacity="0.35" />
        </g>

        <g filter="url(#glow-md)">
          <line x1="80" y1="450" x2="740" y2="430" stroke="url(#speed-gold-l)" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="1180" y1="445" x2="1840" y2="425" stroke="url(#speed-gold-r)" strokeWidth="2.5" strokeLinecap="round" />

          <line x1="30" y1="490" x2="600" y2="475" stroke="url(#speed-white-l)" strokeWidth="2" strokeLinecap="round" />
          <line x1="1320" y1="485" x2="1890" y2="470" stroke="url(#speed-white-r)" strokeWidth="2" strokeLinecap="round" />

          <line x1="160" y1="525" x2="670" y2="513" stroke="url(#speed-amber-l)" strokeWidth="2" strokeLinecap="round" />
          <line x1="1250" y1="520" x2="1760" y2="508" stroke="url(#speed-amber-r)" strokeWidth="2" strokeLinecap="round" />
        </g>

        <g filter="url(#glow-sm)">
          <line x1="20" y1="555" x2="480" y2="545" stroke="url(#speed-gold-l)" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
          <line x1="1440" y1="550" x2="1900" y2="540" stroke="url(#speed-gold-r)" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />

          <line x1="100" y1="585" x2="520" y2="577" stroke="url(#speed-white-l)" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
          <line x1="1400" y1="580" x2="1820" y2="572" stroke="url(#speed-white-r)" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />

          <line x1="220" y1="615" x2="570" y2="609" stroke="url(#speed-amber-l)" strokeWidth="1" strokeLinecap="round" opacity="0.5" />
          <line x1="1350" y1="610" x2="1700" y2="604" stroke="url(#speed-amber-r)" strokeWidth="1" strokeLinecap="round" opacity="0.5" />

          <line x1="60" y1="645" x2="400" y2="640" stroke="url(#speed-white-l)" strokeWidth="0.8" strokeLinecap="round" opacity="0.4" />
          <line x1="1520" y1="640" x2="1860" y2="635" stroke="url(#speed-white-r)" strokeWidth="0.8" strokeLinecap="round" opacity="0.4" />
        </g>

        <g filter="url(#glow-lg)" opacity="0.35">
          <ellipse cx="350" cy="430" rx="300" ry="90" fill="#fbbf24" />
          <ellipse cx="1570" cy="430" rx="300" ry="90" fill="#f59e0b" />
        </g>

        <g opacity="0.6">
          <circle cx="280" cy="140" r="1.5" fill="#fff" opacity="0.8" />
          <circle cx="520" cy="90" r="1.2" fill="#fff" opacity="0.6" />
          <circle cx="780" cy="60" r="1" fill="#fbbf24" opacity="0.5" />
          <circle cx="1140" cy="80" r="1.1" fill="#fbbf24" opacity="0.45" />
          <circle cx="1400" cy="120" r="1.4" fill="#fff" opacity="0.7" />
          <circle cx="1640" cy="160" r="1.2" fill="#fff" opacity="0.5" />
          <circle cx="160" cy="260" r="1" fill="#fff" opacity="0.5" />
          <circle cx="1760" cy="240" r="1.1" fill="#fff" opacity="0.55" />
          <circle cx="420" cy="210" r="0.9" fill="#fff" opacity="0.45" />
          <circle cx="1520" cy="70" r="1.2" fill="#fff" opacity="0.65" />
          <circle cx="650" cy="170" r="0.8" fill="#fff" opacity="0.4" />
          <circle cx="1250" cy="190" r="0.9" fill="#fff" opacity="0.4" />
          <circle cx="100" cy="100" r="1.1" fill="#fff" opacity="0.55" />
          <circle cx="1850" cy="110" r="1" fill="#fff" opacity="0.45" />
          <circle cx="360" cy="40" r="0.9" fill="#fff" opacity="0.6" />
          <circle cx="1580" cy="30" r="1" fill="#fff" opacity="0.5" />
          <circle cx="900" cy="35" r="0.8" fill="#fbbf24" opacity="0.4" />
          <circle cx="1050" cy="50" r="0.7" fill="#fbbf24" opacity="0.35" />
          <circle cx="700" cy="300" r="0.7" fill="#fff" opacity="0.3" />
          <circle cx="1200" cy="310" r="0.8" fill="#fff" opacity="0.3" />
        </g>

        <g filter="url(#glow-md)" opacity="0.12">
          <rect x="0" y="395" width="1920" height="4" fill="#fbbf24" />
        </g>
      </svg>
    </div>
  );
};
