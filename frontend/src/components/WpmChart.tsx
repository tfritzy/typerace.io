import { useMemo } from "react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Area,
  ComposedChart,
  Scatter,
  ResponsiveContainer,
  Line,
} from "recharts";

interface GameRecord {
  wordCount: number;
  charCount: number;
  timeMs: bigint;
  placement: number;
  wpm: number;
}

interface WpmChartProps {
  games: GameRecord[];
}

interface ChartDataPoint {
  gameNumber: number;
  wpm: number;
  avgWpm: number;
  maxWpm: number;
  upperBound: number;
  lowerBound: number;
}

export const WpmChart = ({ games }: WpmChartProps) => {
  const chartData = useMemo(() => {
    if (!games || games.length === 0) return [];

    const wpmValues = games.map((game) => game.wpm);
    
    const avgWpm = wpmValues.reduce((sum, wpm) => sum + wpm, 0) / wpmValues.length;
    const maxWpm = Math.max(...wpmValues);

    const sortedWpms = [...wpmValues].sort((a, b) => a - b);
    const lowerIndex = Math.floor(sortedWpms.length * 0.125);
    const upperIndex = Math.ceil(sortedWpms.length * 0.875) - 1;
    const lowerBound = sortedWpms[lowerIndex];
    const upperBound = sortedWpms[upperIndex];

    const data: ChartDataPoint[] = games.map((game, index) => {
      return {
        gameNumber: index + 1,
        wpm: game.wpm,
        avgWpm,
        maxWpm,
        upperBound,
        lowerBound,
      };
    });

    return data;
  }, [games]);

  if (chartData.length === 0) {
    return (
      <div style={{ 
        padding: "20px", 
        textAlign: "center", 
        color: "var(--color-text-secondary)" 
      }}>
        No game data available
      </div>
    );
  }

  return (
    <div style={{ 
      width: "100%", 
      padding: "20px",
      backgroundColor: "var(--color-surface-elevated)",
      borderRadius: "8px",
      border: "1px solid var(--color-border-subtle)",
      boxShadow: "var(--shadow-elevated-surface)"
    }}>
      <h2 style={{ 
        color: "var(--color-text-primary)", 
        marginBottom: "20px",
        fontSize: "1.5rem",
        fontWeight: 600
      }}>
        Words Per Minute Over Time
      </h2>
      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
        >
          <defs>
            <linearGradient id="confidenceInterval" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-highlight-accent)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="var(--color-highlight-accent)" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-text-secondary)" />
          <XAxis 
            dataKey="gameNumber" 
            label={{ value: "Game Number", position: "insideBottom", offset: -10, fill: "var(--color-text-primary)" }}
            stroke="var(--color-text-primary)"
            tick={{ fill: "var(--color-text-primary)" }}
          />
          <YAxis 
            label={{ value: "WPM", angle: -90, position: "insideLeft", fill: "var(--color-text-primary)" }}
            stroke="var(--color-text-primary)"
            tick={{ fill: "var(--color-text-primary)" }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--color-surface-elevated)",
              border: "1px solid var(--color-border-subtle)",
              borderRadius: "4px",
              color: "var(--color-text-primary)",
            }}
            labelStyle={{ color: "var(--color-text-primary)" }}
          />
          <Legend 
            wrapperStyle={{ color: "var(--color-text-primary)" }}
          />
          
          <Area
            type="monotone"
            dataKey="upperBound"
            stroke="none"
            fill="url(#confidenceInterval)"
            name="75% Confidence Interval"
          />
          <Area
            type="monotone"
            dataKey="lowerBound"
            stroke="none"
            fill="var(--color-surface-elevated)"
            name=""
          />
          
          <Line
            type="monotone"
            dataKey="avgWpm"
            stroke="var(--color-text-primary)"
            strokeWidth={2}
            dot={false}
            name="Average WPM"
          />
          <Line
            type="monotone"
            dataKey="maxWpm"
            stroke="var(--color-alert-error)"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={false}
            name="Max WPM"
          />
          
          <Scatter
            dataKey="wpm"
            fill="var(--color-highlight-accent)"
            name="Game WPM"
          />
        </ComposedChart>
      </ResponsiveContainer>
      
      <div style={{
        marginTop: "20px",
        display: "flex",
        justifyContent: "space-around",
        color: "var(--color-text-primary)",
        fontSize: "0.9rem"
      }}>
        <div>
          <strong>Average WPM:</strong> {chartData[0]?.avgWpm.toFixed(1)}
        </div>
        <div>
          <strong>Max WPM:</strong> {chartData[0]?.maxWpm.toFixed(1)}
        </div>
        <div>
          <strong>Total Games:</strong> {chartData.length}
        </div>
      </div>
    </div>
  );
};
