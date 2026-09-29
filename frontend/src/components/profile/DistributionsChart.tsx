import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  LinearScale,
  Tooltip,
} from "chart.js";
import type { ChartData, ChartOptions, Plugin } from "chart.js";
import { useMemo, useState } from "react";
import { Bar } from "react-chartjs-2";
import type { StatDistribution } from "@/types/stdb";
import { useChartColors } from ".././useChartColors";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

function formatStatName(statType: string) {
  return statType
    .replace(/[_-]+/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatNumber(value: number) {
  return Number.isInteger(value)
    ? value.toLocaleString()
    : value.toLocaleString(undefined, { maximumFractionDigits: 1 });
}

export function DistributionsChart({
  distributions: distributionMap,
  statValues,
}: {
  distributions: Map<string, StatDistribution>;
  statValues: Map<string, number>;
}) {
  const distributions = Array.from(distributionMap.values());
  const colors = useChartColors();
  const [selected, setSelected] = useState<string | null>(null);

  const active =
    distributions.find((d) => d.statType === selected) ?? distributions[0];

  const stats = useMemo(() => {
    if (!active) return null;
    const size = Math.max(Number(active.bucketSize), 1);
    const counts = active.buckets.map(Number);
    const total = counts.reduce((a, b) => a + b, 0);
    const value = statValues.get(active.statType);

    let percentile: number | null = null;
    let markerPosition: number | null = null;
    let userBucket: number | null = null;

    if (value !== undefined && counts.length > 0) {
      markerPosition = Math.min(Math.max(value / size, 0), counts.length);
      const idx = Math.min(Math.floor(markerPosition), counts.length - 1);
      const frac = markerPosition - idx;
      userBucket = idx;
      if (total > 0) {
        let below = 0;
        for (let i = 0; i < idx; i++) below += counts[i];
        percentile = Math.min(
          Math.max(((below + counts[idx] * frac) / total) * 100, 0),
          100,
        );
      }
    }

    return {
      size,
      counts,
      total,
      value,
      percentile,
      markerPosition,
      userBucket,
    };
  }, [active, statValues]);

  const chartData = useMemo<ChartData<"bar">>(() => {
    if (!stats) return { labels: [], datasets: [] };
    return {
      labels: stats.counts.map((_, i) => {
        const start = i * stats.size;
        return stats.size === 1
          ? `${start}`
          : `${start}-${start + stats.size - 1}`;
      }),
      datasets: [
        {
          label: "Players",
          data: stats.counts.map((count) => (count > 0 ? count : null)),
          minBarLength: 2,
          backgroundColor: stats.counts.map((_, i) =>
            i === stats.userBucket
              ? colors.recency[0]
              : `${colors.recency[0]}99`,
          ),
          hoverBackgroundColor: colors.recency[0],
          barPercentage: 1,
          categoryPercentage: 0.94,
          borderRadius: 0,
          borderWidth: 0,
          hoverBorderWidth: 0,
        },
      ],
    };
  }, [colors, stats]);

  const markerPlugin = useMemo<Plugin<"bar">>(
    () => ({
      id: "percentileMarker",
      afterDatasetsDraw: (chart) => {
        if (
          !stats ||
          stats.markerPosition === null ||
          stats.value === undefined
        )
          return;
        const { ctx, chartArea, scales } = chart;
        const x = scales.x;
        if (!x || stats.counts.length === 0) return;
        const step =
          stats.counts.length > 1
            ? x.getPixelForValue(1) - x.getPixelForValue(0)
            : chartArea.right - chartArea.left;
        const px = Math.min(
          Math.max(
            x.getPixelForValue(0) - step / 2 + stats.markerPosition * step,
            chartArea.left,
          ),
          chartArea.right,
        );

        ctx.save();
        ctx.beginPath();
        ctx.setLineDash([4, 4]);
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = colors.foreground;
        ctx.moveTo(px, chartArea.top - 6);
        ctx.lineTo(px, chartArea.bottom);
        ctx.stroke();
        ctx.setLineDash([]);

        const text =
          stats.percentile !== null
            ? `You · ${formatNumber(stats.value)} · Top ${Math.max(
                1,
                Math.round(100 - stats.percentile),
              )}%`
            : `You · ${formatNumber(stats.value)}`;
        ctx.font = "600 11px sans-serif";
        const textWidth = ctx.measureText(text).width;
        const padX = 8;
        const boxW = textWidth + padX * 2;
        const boxH = 20;
        const boxX = Math.min(
          Math.max(px - boxW / 2, chartArea.left),
          chartArea.right - boxW,
        );
        const boxY = chartArea.top - 6 - boxH - 2;

        ctx.fillStyle = colors.card;
        ctx.strokeStyle = colors.border;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(boxX, boxY, boxW, boxH, 6);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = colors.foreground;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(text, boxX + boxW / 2, boxY + boxH / 2 + 0.5);
        ctx.restore();
      },
    }),
    [colors, stats],
  );

  const options = useMemo<ChartOptions<"bar">>(
    () => ({
      animation: false,
      maintainAspectRatio: false,
      layout: { padding: { top: 32 } },
      interaction: { axis: "x", intersect: false, mode: "index" },
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
          padding: 14,
          titleColor: colors.foreground,
          usePointStyle: true,
          callbacks: {
            title: (items) => items[0]?.label ?? "",
            label: (context) => {
              const count = context.parsed.y ?? 0;
              return `${count} player${count === 1 ? "" : "s"}`;
            },
            labelPointStyle: () => ({ pointStyle: "circle", rotation: 0 }),
          },
        },
      },
      scales: {
        x: {
          border: { display: false },
          grid: { display: false, drawTicks: false },
          ticks: {
            color: colors.muted,
            font: { size: 11 },
            maxRotation: 0,
            autoSkipPadding: 12,
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
          title: { color: colors.muted, display: true, text: "Players" },
        },
      },
    }),
    [colors],
  );

  if (!active || !stats) {
    return (
      <div className="w-full rounded-lg border border-border/60 bg-card px-6 py-10 text-center text-sm text-muted-foreground">
        No distributions available yet.
      </div>
    );
  }

  return (
    <div className="w-full rounded-lg border border-border/60 bg-card px-6 pb-4 pt-5">
      <div className="mb-4 flex flex-wrap gap-2">
        {distributions.map((d) => {
          const isActive = d.statType === active.statType;
          return (
            <button
              key={d.statType}
              type="button"
              onClick={() => setSelected(d.statType)}
              aria-pressed={isActive}
              className={`rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${
                isActive
                  ? "border-transparent bg-primary text-primary-foreground"
                  : "border-border/60 bg-transparent text-muted-foreground hover:bg-muted/40 hover:text-secondary-foreground"
              }`}
            >
              {formatStatName(d.statType)}
            </button>
          );
        })}
      </div>

      <div className="mb-3 flex flex-wrap items-baseline gap-x-5 gap-y-2 text-xs">
        <span className="text-muted-foreground">
          Players{" "}
          <strong className="font-semibold text-secondary-foreground">
            {stats.total.toLocaleString()}
          </strong>
        </span>
        {stats.value !== undefined && (
          <>
            <span aria-hidden className="ml-auto" />
            <span className="text-muted-foreground">
              Your {formatStatName(active.statType)}{" "}
              <strong className="font-semibold text-secondary-foreground">
                {formatNumber(stats.value)}
              </strong>
            </span>
            {stats.percentile !== null && (
              <span className="text-muted-foreground">
                Higher than{" "}
                <strong className="font-semibold text-secondary-foreground">
                  {Math.round(stats.percentile)}%
                </strong>{" "}
                of players
              </span>
            )}
          </>
        )}
      </div>

      {stats.total === 0 ? (
        <div className="flex h-[260px] items-center justify-center text-sm text-muted-foreground">
          No data for this stat yet.
        </div>
      ) : (
        <>
          <div className="relative h-[300px] w-full">
            <Bar data={chartData} options={options} plugins={[markerPlugin]} />
          </div>
          <div className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span
                className="h-2.5 w-2.5 rounded-sm"
                style={{ backgroundColor: `${colors.recency[0]}99` }}
              />
              All players
            </span>
            {stats.value !== undefined && (
              <span className="flex items-center gap-1.5">
                <span
                  className="h-3 border-l-2 border-dotted"
                  style={{ borderColor: colors.foreground }}
                />
                You
              </span>
            )}
          </div>
        </>
      )}
    </div>
  );
}
