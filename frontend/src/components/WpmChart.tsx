import {
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  TimeScale,
  Tooltip,
} from "chart.js";
import type { ChartData, ChartOptions } from "chart.js";
import { color } from "chart.js/helpers";
import "chartjs-adapter-date-fns";
import { memo, useMemo } from "react";
import { Line } from "react-chartjs-2";
import type { GameRecord } from "../types/stdb";
import { formatStopwatchTime, getOrdinalPlacement } from "../utils/formatters";
import { prepareWpmChartData } from "./wpmChartData";
import { useChartColors } from "./useChartColors";

ChartJS.register(
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  TimeScale,
);

interface WpmChartProps {
  data: GameRecord[];
}

const RACE_DATASET_INDEX = 1;

const WpmChartComponent = ({ data }: WpmChartProps) => {
  const colors = useChartColors();
  const prepared = useMemo(() => prepareWpmChartData(data), [data]);
  const minorTickColor = useMemo(
    () => color(colors.muted).clearer(0.3).rgbString(),
    [colors.muted],
  );
  const averageLineColor = useMemo(
    () => color(colors.muted).clearer(0.4).rgbString(),
    [colors.muted],
  );
  const bestLineColor = useMemo(
    () => color(colors.accent).alpha(0.55).rgbString(),
    [colors.accent],
  );
  const racePointColor = useMemo(
    () => color(colors.accent).alpha(0.65).rgbString(),
    [colors.accent],
  );

  const chartData = useMemo<ChartData<"line">>(
    () => ({
      datasets: [
        {
          label: "Long-term average",
          data: prepared.averagePoints,
          borderColor: averageLineColor,
          borderWidth: 2,
          cubicInterpolationMode: "monotone",
          pointHoverRadius: 0,
          pointRadius: 0,
          tension: 0.35,
        },
        {
          label: "WPM",
          data: prepared.racePoints,
          backgroundColor: racePointColor,
          pointBorderWidth: 0,
          pointHitRadius: 10,
          pointHoverBackgroundColor: colors.accent,
          pointHoverBorderWidth: 0,
          pointHoverRadius: 6,
          pointRadius: 3,
          showLine: false,
        },
        {
          label: "Best WPM",
          data: prepared.bestWpmPoints,
          borderColor: bestLineColor,
          borderWidth: 2,
          pointHoverRadius: 0,
          pointRadius: 0,
          stepped: "before",
        },
      ],
    }),
    [averageLineColor, bestLineColor, colors, prepared, racePointColor],
  );

  const options = useMemo<ChartOptions<"line">>(
    () => ({
      animation: false,
      maintainAspectRatio: false,
      normalized: true,
      parsing: false,
      plugins: {
        legend: {
          align: "start",
          position: "bottom",
          labels: {
            boxWidth: 24,
            color: colors.secondaryForeground,
            filter: (item) => item.datasetIndex !== RACE_DATASET_INDEX,
            font: { size: 11 },
            padding: 16,
            pointStyle: "line",
            pointStyleWidth: 24,
            usePointStyle: true,
          },
        },
        tooltip: {
          backgroundColor: colors.input,
          bodyColor: colors.secondaryForeground,
          bodyFont: { size: 13, weight: "lighter" },
          bodySpacing: 8,
          borderColor: colors.border,
          borderWidth: 1,
          caretPadding: 12,
          caretSize: 8,
          cornerRadius: 8,
          displayColors: false,
          padding: 16,
          titleColor: colors.foreground,
          titleFont: { size: 13, weight: "normal" },
          titleMarginBottom: 12,
          callbacks: {
            title: (items) => {
              const timestamp = items[0]?.parsed.x;
              if (timestamp === undefined) return "";
              const date = new Date(timestamp);
              return `${date.toLocaleDateString()} ${date.toLocaleTimeString(
                [],
                { hour: "numeric", minute: "2-digit" },
              )}`;
            },
            label: (context) => {
              if (context.datasetIndex !== RACE_DATASET_INDEX) {
                return `${context.parsed.y.toFixed(1)} WPM`;
              }

              const record = prepared.sortedRecords[context.dataIndex];
              if (!record) return `${context.parsed.y.toFixed(1)} WPM`;
              return [
                `${context.parsed.y.toFixed(1)} WPM`,
                `Time: ${formatStopwatchTime(Number(record.timeMs) / 1000)}`,
                `Place: ${getOrdinalPlacement(record.placement)}`,
                `Mode: ${record.gameMode.tag}`,
              ];
            },
          },
        },
      },
      scales: {
        x: {
          type: "time",
          ticks: {
            color: (context) => context.tick?.major
              ? colors.muted
              : minorTickColor,
            font: { size: 11 },
            major: { enabled: true },
            padding: 8,
          },
          grid: { display: false, drawTicks: false },
          border: { display: false },
        },
        y: {
          beginAtZero: true,
          ticks: {
            color: colors.muted,
            font: { size: 11 },
            padding: 8,
            stepSize: 10,
          },
          grid: { color: colors.grid, drawTicks: false },
          border: { display: false },
        },
      },
    }),
    [colors, minorTickColor, prepared],
  );

  return (
    <div className="w-full rounded-lg border border-border bg-card px-6 pb-3 pt-6 box-shadow">
      <div className="relative h-[400px] w-full">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
};

export const WpmChart = memo(WpmChartComponent);
