export const LobbyBackground = () => {
  return (
    <div className="lobby-bg">
      <div className="lobby-bg-glow" />
      <svg
        className="lobby-bg-svg"
        viewBox="0 0 1400 900"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
      >
        <defs>
          <linearGradient id="streak-fade" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0" />
            <stop offset="15%" stopColor="var(--color-accent)" stopOpacity="1" />
            <stop offset="85%" stopColor="var(--color-accent)" stopOpacity="1" />
            <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0" />
          </linearGradient>
        </defs>

        <path d="M0,340 Q350,310 700,335 T1400,300" stroke="url(#streak-fade)" strokeWidth="1.5" opacity="0.12" />
        <path d="M0,380 Q350,360 700,375 T1400,350" stroke="url(#streak-fade)" strokeWidth="2" opacity="0.18" />
        <path d="M0,420 Q350,400 700,415 T1400,390" stroke="url(#streak-fade)" strokeWidth="2.5" opacity="0.22" />
        <path d="M0,450 Q350,435 700,448 T1400,425" stroke="url(#streak-fade)" strokeWidth="3" opacity="0.28" />
        <path d="M0,475 Q350,465 700,473 T1400,455" stroke="url(#streak-fade)" strokeWidth="2.5" opacity="0.22" />
        <path d="M0,510 Q350,500 700,508 T1400,490" stroke="url(#streak-fade)" strokeWidth="2" opacity="0.18" />
        <path d="M0,550 Q350,535 700,545 T1400,525" stroke="url(#streak-fade)" strokeWidth="1.5" opacity="0.12" />

        <path d="M100,370 Q400,345 750,365 T1300,340" stroke="url(#streak-fade)" strokeWidth="1" opacity="0.08" />
        <path d="M50,490 Q400,475 750,488 T1350,470" stroke="url(#streak-fade)" strokeWidth="1" opacity="0.08" />

        <path d="M200,430 Q500,415 800,428 T1200,410" stroke="var(--color-accent)" strokeWidth="1" opacity="0.06" strokeDasharray="4 12" />
        <path d="M150,460 Q500,450 850,458 T1250,445" stroke="var(--color-accent)" strokeWidth="1" opacity="0.06" strokeDasharray="4 12" />
      </svg>
    </div>
  );
};
