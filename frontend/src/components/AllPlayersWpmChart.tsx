import {
    Chart as ChartJS,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip,
    Legend,
} from 'chart.js';
import type { ChartOptions } from 'chart.js';
import { Line } from 'react-chartjs-2';
import type { PlayerProgress } from '../types/stdb';
import { getAggWpmBySecond } from '../utils/wpmCalculator';
import { getPlayerColorHex } from '../utils/colorMapping';
import { useDatabase } from '../contexts/SpacetimeContext';

ChartJS.register(
    LinearScale,
    PointElement,
    LineElement,
    Tooltip,
    Legend
);

interface AllPlayersWpmChartProps {
    allPlayerProgress: PlayerProgress[];
    raceStartTimestamp: bigint;
}

export const AllPlayersWpmChart = ({
    allPlayerProgress,
    raceStartTimestamp
}: AllPlayersWpmChartProps) => {
    const conn = useDatabase();
    const style = getComputedStyle(document.documentElement);

    const resolvedColors = {
        gridLine: style.getPropertyValue('--grid-line').trim(),
        mutedFg: style.getPropertyValue('--muted-foreground').trim(),
        secondaryFg: style.getPropertyValue('--secondary-foreground').trim(),
        foreground: style.getPropertyValue('--foreground').trim(),
        input: style.getPropertyValue('--input').trim(),
        border: style.getPropertyValue('--border').trim(),
    };
    const datasets = allPlayerProgress.map((playerProgress) => {
        const wpmData = getAggWpmBySecond(
            playerProgress.characterHistory,
            raceStartTimestamp
        );
        const currentPlayerId = conn?.identity;
        const isCurrentPlayer = currentPlayerId && playerProgress.playerId.isEqual(currentPlayerId);
        const lineColor = isCurrentPlayer
            ? style.getPropertyValue('--accent-primary').trim()
            : getPlayerColorHex(playerProgress.playerColor?.tag ?? '');

        return {
            label: playerProgress.playerName,
            data: wpmData.map((wpm, second) => ({
                x: second,
                y: wpm
            })),
            borderColor: lineColor,
            backgroundColor: lineColor,
            pointRadius: 0,
            pointHoverRadius: 8,
            pointHitRadius: 20,
            showLine: true,
            borderWidth: 2,
            tension: 0.4,
        };
    });

    const chartData = {
        datasets
    };

    const options: ChartOptions<'line'> = {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        plugins: {
            legend: {
                display: true,
                position: 'top',
                align: 'end',
                labels: {
                    color: resolvedColors.secondaryFg,
                    font: {
                        size: 12,
                    },
                    padding: 12,
                    usePointStyle: true,
                    pointStyle: 'line',
                }
            },
            tooltip: {
                backgroundColor: resolvedColors.input,
                borderColor: resolvedColors.border,
                borderWidth: 1,
                titleColor: resolvedColors.foreground,
                bodyColor: resolvedColors.foreground,
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
                    title: (context) => {
                        return `${context[0].parsed.x}s`;
                    },
                    label: (context) => {
                        return ` ${context.dataset.label}: ${context.parsed.y.toFixed(0)} WPM`;
                    }
                }
            }
        },
        scales: {
            x: {
                type: 'linear',
                title: {
                    display: true,
                    text: 'Time (seconds)',
                    color: resolvedColors.mutedFg,
                    font: {
                        size: 12
                    }
                },
                ticks: {
                    color: resolvedColors.mutedFg,
                    font: {
                        size: 11
                    }
                },
                grid: {
                    color: resolvedColors.gridLine,
                    drawTicks: false
                },
                border: {
                    display: false
                }
            },
            y: {
                title: {
                    display: true,
                    text: 'WPM',
                    color: resolvedColors.mutedFg,
                    font: {
                        size: 12
                    }
                },
                ticks: {
                    color: resolvedColors.mutedFg,
                    font: {
                        size: 11
                    },
                    padding: 8
                },
                grid: {
                    color: resolvedColors.gridLine,
                    drawTicks: false
                },
                border: {
                    display: false
                }
            }
        }
    };

    if (allPlayerProgress.length === 0) {
        return (
            <div className="w-full text-center text-muted-foreground py-6">
                No player data available
            </div>
        );
    }

    return (
        <div className="h-[280px] relative w-full">
            <Line data={chartData} options={options} />
        </div>
    );
};
