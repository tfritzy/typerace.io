const KEYS: {
  x: number;
  y: number;
  w: number;
  h: number;
  r: number;
  o: number;
  l?: string;
}[] = [
  { x: 120, y: 80, w: 44, h: 44, r: -15, o: 0.07 },
  { x: 380, y: 55, w: 48, h: 48, r: 8, o: 0.09, l: "E" },
  { x: 700, y: 85, w: 46, h: 46, r: -6, o: 0.08, l: "T" },
  { x: 1000, y: 65, w: 44, h: 44, r: 12, o: 0.07 },
  { x: 1250, y: 90, w: 42, h: 42, r: -10, o: 0.06 },

  { x: 55, y: 250, w: 46, h: 46, r: -20, o: 0.06 },
  { x: 300, y: 225, w: 50, h: 50, r: 5, o: 0.11, l: "W" },
  { x: 580, y: 235, w: 48, h: 48, r: -3, o: 0.09, l: "R" },
  { x: 900, y: 215, w: 52, h: 52, r: 7, o: 0.11, l: "Y" },
  { x: 1200, y: 245, w: 44, h: 44, r: -12, o: 0.07 },

  { x: 180, y: 395, w: 52, h: 52, r: -8, o: 0.09, l: "A" },
  { x: 380, y: 375, w: 54, h: 54, r: 2, o: 0.13, l: "S" },
  { x: 560, y: 385, w: 56, h: 56, r: -1, o: 0.15, l: "D" },
  { x: 740, y: 380, w: 58, h: 58, r: 1, o: 0.18, l: "F" },
  { x: 920, y: 385, w: 56, h: 56, r: -2, o: 0.15, l: "J" },
  { x: 1100, y: 375, w: 52, h: 52, r: 4, o: 0.11, l: "K" },
  { x: 1280, y: 395, w: 48, h: 48, r: -6, o: 0.08, l: "L" },

  { x: 200, y: 555, w: 48, h: 48, r: 10, o: 0.09, l: "Z" },
  { x: 480, y: 545, w: 50, h: 50, r: -5, o: 0.11, l: "C" },
  { x: 750, y: 555, w: 48, h: 48, r: 6, o: 0.09, l: "V" },
  { x: 1050, y: 550, w: 46, h: 46, r: -8, o: 0.08 },

  { x: 100, y: 715, w: 42, h: 42, r: -18, o: 0.05 },
  { x: 420, y: 695, w: 46, h: 46, r: 12, o: 0.07 },
  { x: 650, y: 715, w: 140, h: 48, r: 1, o: 0.09 },
  { x: 1000, y: 705, w: 44, h: 44, r: -10, o: 0.06 },
  { x: 1300, y: 725, w: 40, h: 40, r: 14, o: 0.05 },
];

export const LobbyBackground = () => {
  return (
    <div className="lobby-bg">
      <div className="lobby-bg-glow" />
      <svg
        className="lobby-bg-keys"
        viewBox="0 0 1400 900"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
        style={{ color: "var(--color-accent)" }}
      >
        {KEYS.map((k, i) => (
          <g
            key={i}
            transform={`translate(${k.x}, ${k.y}) rotate(${k.r}, ${k.w / 2}, ${k.h / 2})`}
            opacity={k.o}
          >
            <rect
              width={k.w}
              height={k.h}
              rx={8}
              stroke="currentColor"
              strokeWidth={1.5}
              fill="currentColor"
              fillOpacity={0.15}
            />
            {k.l && (
              <text
                x={k.w / 2}
                y={k.h / 2 + 1}
                textAnchor="middle"
                dominantBaseline="central"
                fill="currentColor"
                fontSize={k.w > 100 ? 12 : 16}
                fontWeight={500}
                fontFamily="system-ui, sans-serif"
              >
                {k.l}
              </text>
            )}
          </g>
        ))}
      </svg>
    </div>
  );
};
