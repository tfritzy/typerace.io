import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  LinearScale,
  Tooltip,
} from "chart.js";
import type { ChartData, ChartOptions } from "chart.js";
import { memo, useMemo } from "react";
import { Bar } from "react-chartjs-2";
import type { GameRecord } from "../types/stdb";
import { useChartColors } from "./useChartColors";
import { prepareWpmDistribution } from "./wpmDistributionData";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

interface WpmDistributionChartProps {
  data: GameRecord[];
}

const WpmDistributionChartComponent = ({ data }: WpmDistributionChartProps) => {
  const colors = useChartColors();
  const distribution = useMemo(() => prepareWpmDistribution(data), [data]);

  const chartData = useMemo<ChartData<"bar">>(
    () => ({
      labels: distribution.buckets.map((bucket) => bucket.label),
      datasets: [
        {
          label: "Races",
          data: distribution.buckets.map((bucket) => bucket.count),
          backgroundColor: `${colors.accent}99`,
          barPercentage: 1,
          borderRadius: 0,
          borderWidth: 0,
          categoryPercentage: 0.94,
          hoverBackgroundColor: colors.accent,
          hoverBorderWidth: 0,
        },
      ],
    }),
    [colors, distribution.buckets],
  );

  const options = useMemo<ChartOptions<"bar">>(
    () => ({
      animation: false,
      interaction: {
        axis: "x",
        intersect: false,
        mode: "index",
      },
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: colors.input,
          bodyColor: colors.secondaryForeground,
          borderColor: colors.border,
          borderWidth: 1,
          caretPadding: 12,
          caretSize: 8,
          cornerRadius: 8,
          displayColors: false,
          padding: 14,
          titleColor: colors.foreground,
          callbacks: {
            title: (items) => `${items[0]?.label ?? ""} WPM`,
            label: (context) => {
              const count = context.parsed.y;
              const percent = distribution.total === 0
                ? 0
                : Math.round((count / distribution.total) * 100);
              return `${count} race${count === 1 ? "" : "s"} (${percent}%)`;
            },
          },
        },
      },
      scales: {
        x: {
          border: { display: false },
          grid: { display: false, drawTicks: false },
          title: {
            color: colors.muted,
            display: true,
            text: "WPM range",
          },
          ticks: {
            color: colors.muted,
            font: { size: 11 },
            padding: 8,
          },
        },
        y: {
          beginAtZero: true,
          border: { display: false },
          grid: { color: colors.grid, drawTicks: false },
          ticks: {
            color: colors.muted,
            font: { size: 11 },
            padding: 8,
            precision: 0,
          },
          title: {
            color: colors.muted,
            display: true,
            text: "Races",
          },
        },
      },
    }),
    [colors, distribution.total],
  );

  return (
    <div className="w-full rounded-lg border border-border bg-card px-6 pb-4 pt-5 box-shadow">
      <div className="mb-3 flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <span className="text-sm text-secondary-foreground">
          {distribution.total} race{distribution.total === 1 ? "" : "s"}
        </span>
        {distribution.total > 0 && (
          <span className="text-xs text-muted-foreground">
            Best {Math.round(distribution.best)} WPM · Median {Math.round(distribution.median)} WPM
          </span>
        )}
      </div>
      {distribution.total === 0 ? (
        <div className="flex h-[260px] items-center justify-center text-sm text-muted-foreground">
          No races match these filters yet.
        </div>
      ) : (
        <div className="relative h-[300px] w-full">
          <Bar data={chartData} options={options} />
        </div>
      )}
    </div>
  );
};

export const WpmDistributionChart = memo(WpmDistributionChartComponent);
