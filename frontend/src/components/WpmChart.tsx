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

  const chartData = useMemo<ChartData<"line">>(
    () => ({
      datasets: [
        {
          label: "Long-term average",
          data: prepared.averagePoints,
          borderColor: colors.muted,
          borderWidth: 2,
          cubicInterpolationMode: "monotone",
          pointHoverRadius: 0,
          pointRadius: 0,
          showLine: true,
          tension: 0.35,
        },
        {
          label: "WPM",
          data: prepared.racePoints,
          backgroundColor: `${colors.accent}33`,
          borderColor: `${colors.accent}77`,
          pointHitRadius: 10,
          pointHoverBackgroundColor: colors.accent,
          pointHoverBorderColor: colors.foreground,
          pointHoverBorderWidth: 2,
          pointHoverRadius: 6,
          pointRadius: 3,
          showLine: false,
        },
        {
          label: "Best WPM",
          data: prepared.bestWpmPoints,
          borderColor: colors.accent,
          borderWidth: 2,
          pointHoverRadius: 0,
          pointRadius: 0,
          showLine: true,
          stepped: "before",
        },
      ],
    }),
    [colors, prepared],
  );

  const options = useMemo<ChartOptions<"line">>(
    () => ({
      animation: false,
      maintainAspectRatio: false,
      normalized: true,
      parsing: false,
      responsive: true,
      plugins: {
        legend: {
          align: "start",
          display: true,
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
          time: {
            unit: prepared.timeConfig.unit,
            displayFormats: {
              day: prepared.timeConfig.format,
              hour: prepared.timeConfig.format,
              month: prepared.timeConfig.format,
              week: prepared.timeConfig.format,
              year: prepared.timeConfig.format,
            },
          },
          ticks: {
            align: "inner",
            autoSkip: true,
            color: colors.muted,
            font: { size: 11 },
            maxRotation: 0,
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
            maxTicksLimit: 15,
            padding: 8,
            stepSize: 10,
          },
          grid: { color: colors.grid, drawTicks: false },
          border: { display: false },
        },
      },
    }),
    [colors, prepared],
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
