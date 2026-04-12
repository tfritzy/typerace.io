const BAR_WIDTH = 120;

export const PlanetHealthBar = ({ ratio }: { ratio: number }) => {
  const pct = Math.max(0, Math.min(100, ratio * 100));
  const barColor = pct > 60 ? "#4ade80" : pct > 30 ? "#fbbf24" : "#ef4444";

  return (
    <div
      className="absolute top-3 left-3 z-10 flex items-center gap-2"
      style={{ opacity: 0.85 }}
    >
      <div
        style={{
          background: "#0f0f23",
          border: "1px solid #4a5568",
          height: 6,
          width: BAR_WIDTH,
          borderRadius: 3,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            background: barColor,
            height: "100%",
            width: `${pct}%`,
            transition: "width 0.3s, background-color 0.5s",
            borderRadius: 3,
          }}
        />
      </div>
      <span
        style={{
          fontSize: 10,
          color: "#a6adc8",
        }}
      >
        {Math.round(pct)}%
      </span>
    </div>
  );
};
