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
import { PlayerColor } from '../../module_bindings/player_color_type';
import { getRawWpmBySecond, getAggWpmBySecond } from '../utils/wpmCalculator';
import { getColorConfig } from '../utils/colorMapping';

ChartJS.register(
    LinearScale,
    PointElement,
    LineElement,
    Tooltip,
    Legend
);

interface RaceResultsChartProps {
    playerProgress: PlayerProgress;
    raceStartTimestamp: bigint;
    playerColor: PlayerColor;
}

export const RaceResultsChart = ({ playerProgress, raceStartTimestamp, playerColor }: RaceResultsChartProps) => {
    const rawWpmData = getRawWpmBySecond(playerProgress.characterHistory, raceStartTimestamp);
    const aggWpmData = getAggWpmBySecond(playerProgress.characterHistory, raceStartTimestamp);

    const maxDataIndex = Math.max(rawWpmData.length - 1, aggWpmData.length - 1);

    const colorConfig = getColorConfig(playerColor);
    const primaryColor = colorConfig.primary;
    const secondaryColor = getComputedStyle(document.documentElement)
        .getPropertyValue('--color-white-25').trim();
    const chartData = {
        datasets: [
            {
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
            },
            {
                label: 'Raw WPM',
                data: rawWpmData.map((wpm, index) => ({
                    x: index,
                    y: wpm
                })),
                borderColor: secondaryColor,
                pointRadius: 0,
                pointHoverRadius: 8,
                pointHitRadius: 20,
                showLine: true,
                borderWidth: 2,
                tension: 0.4,
            },
        ]
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
                    title: () => {
                        return '';
                    },
                    label: (context) => {
                        return ` ${context.parsed.y.toFixed(0)} WPM`;
                    }
                }
            }
        },
        scales: {
            x: {
                type: 'linear',
                max: maxDataIndex,
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
                min: 0,
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

    if (rawWpmData.length === 0 && aggWpmData.length === 0) {
        return (
            <div style={{
                width: '100%',
                textAlign: 'center',
                color: 'rgba(255, 255, 255, 0.6)',
                padding: '24px 0'
            }}>
                No typing data available
            </div>
        );
    }

    return (
        <div style={{ height: '280px', position: 'relative', width: '100%' }}>
            <Line data={chartData} options={options} />
        </div>
    );
};
