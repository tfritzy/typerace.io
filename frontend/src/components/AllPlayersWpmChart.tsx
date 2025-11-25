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
import type { PlayerProgress } from '../../module_bindings/player_progress_type';
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

const PLAYER_COLORS = [
    'rgb(251, 191, 36)',
    'rgb(96, 165, 250)',
    'rgb(167, 139, 250)',
    'rgb(248, 113, 113)',
    'rgb(74, 222, 128)',
    'rgb(250, 204, 21)',
    'rgb(192, 132, 252)',
    'rgb(34, 211, 238)',
];

export const AllPlayersWpmChart = ({
    allPlayerProgress,
    raceStartTimestamp
}: AllPlayersWpmChartProps) => {
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
            borderColor: PLAYER_COLORS[index % PLAYER_COLORS.length],
            backgroundColor: PLAYER_COLORS[index % PLAYER_COLORS.length],
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
                    color: 'rgba(255, 255, 255, 0.9)',
                    font: {
                        size: 12,
                    },
                    padding: 12,
                    usePointStyle: true,
                    pointStyle: 'line',
                }
            },
            tooltip: {
                backgroundColor: 'rgba(26, 26, 26, 0.95)',
                borderColor: 'rgba(255, 255, 255, 0.2)',
                borderWidth: 1,
                titleColor: 'rgba(255, 255, 255, 0.7)',
                bodyColor: '#ffffff',
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
                    color: 'rgba(255, 255, 255, 0.7)',
                    font: {
                        size: 12
                    }
                },
                ticks: {
                    color: 'rgba(255, 255, 255, 0.6)',
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
                    color: 'rgba(255, 255, 255, 0.7)',
                    font: {
                        size: 12
                    }
                },
                ticks: {
                    color: 'rgba(255, 255, 255, 0.6)',
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
            <div className="w-full text-center text-white/60 py-6">
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
