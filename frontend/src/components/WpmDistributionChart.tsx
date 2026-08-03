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
          label: "Recent 25%",
          data: distribution.buckets.map((bucket) => bucket.cohorts.newest25),
          backgroundColor: colors.recency[0],
          hoverBackgroundColor: colors.recency[0],
          stack: "distribution",
        },
        {
          label: "Previous 25%",
          data: distribution.buckets.map((bucket) =>
            bucket.cohorts.recent25To50
          ),
          backgroundColor: `${colors.recency[1]}CC`,
          hoverBackgroundColor: `${colors.recency[1]}CC`,
          stack: "distribution",
        },
        {
          label: "Oldest 50%",
          data: distribution.buckets.map((bucket) => bucket.cohorts.oldest50),
          backgroundColor: `${colors.recency[2]}99`,
          hoverBackgroundColor: `${colors.recency[2]}99`,
          stack: "distribution",
        },
      ].map((dataset) => ({
        ...dataset,
        barPercentage: 1,
        borderRadius: 0,
        borderWidth: 0,
        categoryPercentage: 0.94,
        hoverBorderWidth: 0,
      })),
    }),
    [colors, distribution.buckets, distribution.total],
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
          backgroundColor: colors.card,
          bodyColor: colors.secondaryForeground,
          borderColor: colors.border,
          borderWidth: 1,
          boxHeight: 8,
          boxPadding: 6,
          boxWidth: 8,
          caretPadding: 12,
          caretSize: 8,
          cornerRadius: 8,
          displayColors: true,
          filter: (item) => item.parsed.y > 0,
          padding: 14,
          titleColor: colors.foreground,
          usePointStyle: true,
          callbacks: {
            title: (items) => `${items[0]?.label ?? ""} WPM`,
            label: (context) =>
              `${context.dataset.label}: ${context.parsed.y} race${
                context.parsed.y === 1 ? "" : "s"
              }`,
            labelPointStyle: () => ({
              pointStyle: "circle",
              rotation: 0,
            }),
          },
        },
      },
      scales: {
        x: {
          stacked: true,
          border: { display: false },
          grid: { display: false, drawTicks: false },
          ticks: {
            color: colors.muted,
            font: { size: 11 },
            padding: 8,
          },
        },
        y: {
          stacked: true,
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
    [colors],
  );

  return (
    <div className="w-full rounded-lg border border-border bg-card px-6 pb-4 pt-5 box-shadow">
      <div className="mb-3 flex flex-wrap items-baseline gap-x-5 gap-y-2 text-xs">
        <span className="text-muted-foreground">
          Total{" "}
          <strong className="font-semibold text-secondary-foreground">
            {distribution.total} race{distribution.total === 1 ? "" : "s"}
          </strong>
        </span>
        {distribution.total > 0 && (
          <>
            <span aria-hidden className="ml-auto" />
            <span className="text-muted-foreground">
              Recent median{" "}
              <strong className="font-semibold text-secondary-foreground">
                {Math.round(distribution.recentMedian)} WPM
              </strong>
            </span>
            <span className="text-muted-foreground">
              Overall median{" "}
              <strong className="font-semibold text-secondary-foreground">
                {Math.round(distribution.median)} WPM
              </strong>
            </span>
            <span className="text-muted-foreground">
              Best{" "}
              <strong className="font-semibold text-secondary-foreground">
                {Math.round(distribution.best)} WPM
              </strong>
            </span>
          </>
        )}
      </div>
      {distribution.total === 0 ? (
        <div className="flex h-[260px] items-center justify-center text-sm text-muted-foreground">
          No races match these filters yet.
        </div>
      ) : (
        <>
          <div className="relative h-[300px] w-full">
            <Bar data={chartData} options={options} />
          </div>
          <div className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
            {distribution.cohortTotals.newest25 > 0 && (
              <span className="flex items-center gap-1.5">
                <span
                  className="h-2.5 w-2.5 rounded-sm"
                  style={{ backgroundColor: colors.recency[0] }}
                />
                Recent 25%
              </span>
            )}
            {distribution.cohortTotals.recent25To50 > 0 && (
              <span className="flex items-center gap-1.5">
                <span
                  className="h-2.5 w-2.5 rounded-sm"
                  style={{ backgroundColor: `${colors.recency[1]}CC` }}
                />
                Previous 25%
              </span>
            )}
            {distribution.cohortTotals.oldest50 > 0 && (
              <span className="flex items-center gap-1.5">
                <span
                  className="h-2.5 w-2.5 rounded-sm"
                  style={{ backgroundColor: `${colors.recency[2]}99` }}
                />
                Oldest 50%
              </span>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export const WpmDistributionChart = memo(WpmDistributionChartComponent);
