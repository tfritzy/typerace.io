import {
    Chart as ChartJS,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    BarController,
    LineController,
    Tooltip,
    Legend,
} from 'chart.js';
import type { ChartOptions } from 'chart.js';
import { Chart } from 'react-chartjs-2';
import { memo } from 'react';
import type { PlayerProgress } from '../types/stdb';
import { getRawWpmBySecond, getAggWpmBySecond, getErrorCountsBySecond } from '../utils/wpmCalculator';
import { getDisplayColorHex } from '../utils/colorMapping';

ChartJS.register(
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    BarController,
    LineController,
    Tooltip,
    Legend
);

const RAW_LINE_OPACITY_HEX = '99';

interface RaceResultsChartProps {
    playerProgress: PlayerProgress;
    raceStartTimestamp: bigint;
    isCurrentPlayer: boolean;
}

export const RaceResultsChart = memo(({ playerProgress, raceStartTimestamp, isCurrentPlayer }: RaceResultsChartProps) => {
    const rawWpmData = getRawWpmBySecond(playerProgress.characterHistory, raceStartTimestamp);
    const aggWpmData = getAggWpmBySecond(playerProgress.characterHistory, raceStartTimestamp);
    const errorCountsData = getErrorCountsBySecond(playerProgress.characterHistory, raceStartTimestamp);

    const maxDataIndex = Math.max(rawWpmData.length - 1, aggWpmData.length - 1, errorCountsData.length - 1);

    const style = getComputedStyle(document.documentElement);
    const primaryColor = getDisplayColorHex(playerProgress.playerColor?.tag, isCurrentPlayer);
    const rawLineColor = `${primaryColor}${RAW_LINE_OPACITY_HEX}`;
    const secondaryColor = style.getPropertyValue('--muted-foreground').trim();
    const errorColor = style.getPropertyValue('--destructive').trim();
    const gridLineColor = style.getPropertyValue('--grid-line').trim();
    const foregroundColor = style.getPropertyValue('--foreground').trim();
    const inputColor = style.getPropertyValue('--input').trim();
    const borderColorVal = style.getPropertyValue('--border').trim();
    const secondaryFgColor = style.getPropertyValue('--secondary-foreground').trim();
    const chartData = {
        datasets: [
            {
                type: 'line' as const,
                label: 'Aggregate WPM',
                data: aggWpmData.map((wpm, index) => ({
                    x: index,
                    y: wpm
                })),
                borderColor: primaryColor,
                pointRadius: 0,
                pointHoverRadius: 8,
                pointHitRadius: 20,
                showLine: true,
                borderWidth: 2,
                tension: 0.4,
                yAxisID: 'y',
            },
            {
                type: 'line' as const,
                label: 'Raw WPM',
                data: rawWpmData.map((wpm, index) => ({
                    x: index,
                    y: wpm
                })),
                borderColor: rawLineColor,
                pointRadius: 0,
                pointHoverRadius: 8,
                pointHitRadius: 20,
                showLine: true,
                borderWidth: 2,
                tension: 0.4,
                yAxisID: 'y',
            },
            {
                type: 'bar' as const,
                label: 'Errors',
                data: errorCountsData.map((count, index) => ({
                    x: index,
                    y: count
                })),
                backgroundColor: 'transparent',
                borderColor: errorColor,
                hoverBackgroundColor: 'transparent',
                hoverBorderColor: errorColor,
                borderWidth: 1,
                borderRadius: 2,
                borderSkipped: false,
                yAxisID: 'y1',
                barPercentage: 0.5,
                categoryPercentage: 0.6,
            },
        ]
    };

    const options: ChartOptions<'bar' | 'line'> = {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        plugins: {
            legend: {
                display: true,
                position: 'top',
                align: 'end',
                labels: {
                    color: secondaryFgColor,
                    font: {
                        size: 12,
                    },
                    padding: 12,
                    usePointStyle: true,
                }
            },
            tooltip: {
                backgroundColor: inputColor,
                borderColor: borderColorVal,
                borderWidth: 1,
                titleColor: foregroundColor,
                bodyColor: foregroundColor,
                padding: 16,
                displayColors: true,
                usePointStyle: true,
                boxWidth: 8,
                boxHeight: 8,
                titleFont: {
                    size: 12,
                    weight: 'normal'
                },
                titleMarginBottom: 12,
                bodyFont: {
                    size: 14,
                    weight: 'bold'
                },
                bodySpacing: 8,
                cornerRadius: 12,
                caretSize: 8,
                caretPadding: 12,
                callbacks: {
                    title: () => {
                        return '';
                    },
                    label: (context) => {
                        if (context.dataset.label === 'Errors') {
                            return ` ${context.parsed.y.toFixed(0)} error${context.parsed.y !== 1 ? 's' : ''}`;
                        }
                        return ` ${context.parsed.y.toFixed(0)} WPM`;
                    }
                }
            }
        },
        scales: {
            x: {
                type: 'linear',
                min: 0,
                max: maxDataIndex,
                offset: false,
                title: {
                    display: true,
                    text: 'Time (seconds)',
                    color: secondaryColor,
                    font: {
                        size: 12
                    }
                },
                ticks: {
                    color: secondaryColor,
                    font: {
                        size: 11
                    }
                },
                grid: {
                    color: gridLineColor,
                    drawTicks: false
                },
                border: {
                    display: false
                }
            },
            y: {
                min: 0,
                position: 'left',
                title: {
                    display: true,
                    text: 'WPM',
                    color: secondaryColor,
                    font: {
                        size: 12
                    }
                },
                ticks: {
                    color: secondaryColor,
                    font: {
                        size: 11
                    },
                    padding: 8
                },
                grid: {
                    color: gridLineColor,
                    drawTicks: false
                },
                border: {
                    display: false
                }
            },
            y1: {
                min: 0,
                max: 10,
                position: 'right',
                title: {
                    display: true,
                    text: 'Errors',
                    color: errorColor,
                    font: {
                        size: 12
                    }
                },
                ticks: {
                    color: secondaryColor,
                    font: {
                        size: 11
                    },
                    padding: 8
                },
                grid: {
                    display: false
                },
                border: {
                    display: false
                }
            }
        }
    };

    if (rawWpmData.length === 0 && aggWpmData.length === 0 && errorCountsData.length === 0) {
        return (
            <div className="w-full text-center text-muted-foreground py-6">
                No typing data available
            </div>
        );
    }

    return (
        <div className="h-[280px] relative w-full">
            <Chart type='bar' data={chartData} options={options} />
        </div>
    );
});

RaceResultsChart.displayName = 'RaceResultsChart';
