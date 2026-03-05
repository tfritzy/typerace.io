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
import { useMemo } from 'react';
import type { PlayerProgress } from '../types/stdb';
import { getAggWpmBySecond } from '../utils/wpmCalculator';

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
    const playerColors = useMemo(() => {
        const style = getComputedStyle(document.documentElement);
        return [
            style.getPropertyValue('--accent-primary').trim(),
            style.getPropertyValue('--chart-11').trim(),
            style.getPropertyValue('--chart-13').trim(),
            style.getPropertyValue('--chart-1').trim(),
            style.getPropertyValue('--chart-6').trim(),
            style.getPropertyValue('--chart-4').trim(),
            style.getPropertyValue('--chart-14').trim(),
            style.getPropertyValue('--chart-9').trim(),
        ];
    }, []);
    const datasets = allPlayerProgress.map((playerProgress, index) => {
        const wpmData = getAggWpmBySecond(
            playerProgress.characterHistory,
            raceStartTimestamp
        );

        return {
            label: playerProgress.playerName,
            data: wpmData.map((wpm, second) => ({
                x: second,
                y: wpm
            })),
            borderColor: playerColors[index % playerColors.length],
            backgroundColor: playerColors[index % playerColors.length],
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
                    color: 'var(--secondary-foreground)',
                    font: {
                        size: 12,
                    },
                    padding: 12,
                    usePointStyle: true,
                    pointStyle: 'line',
                }
            },
            tooltip: {
                backgroundColor: 'var(--input)',
                borderColor: 'var(--border)',
                borderWidth: 1,
                titleColor: 'var(--foreground)',
                bodyColor: 'var(--foreground)',
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
                    color: 'var(--muted-foreground)',
                    font: {
                        size: 12
                    }
                },
                ticks: {
                    color: 'var(--muted-foreground)',
                    font: {
                        size: 11
                    }
                },
                grid: {
                    color: 'rgba(255, 255, 255, 0.06)',
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
                    color: 'var(--muted-foreground)',
                    font: {
                        size: 12
                    }
                },
                ticks: {
                    color: 'var(--muted-foreground)',
                    font: {
                        size: 11
                    },
                    padding: 8
                },
                grid: {
                    color: 'rgba(255, 255, 255, 0.06)',
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
