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
import { getRawWpmBySecond, getAggWpmBySecond } from '../utils/wpmCalculator';

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
}

export const RaceResultsChart = ({ playerProgress, raceStartTimestamp }: RaceResultsChartProps) => {
    const rawWpmData = getRawWpmBySecond(playerProgress.characterHistory, raceStartTimestamp);
    const aggWpmData = getAggWpmBySecond(playerProgress.characterHistory, raceStartTimestamp);

    const accentColor = getComputedStyle(document.documentElement)
        .getPropertyValue('--color-accent').trim();
    const secondaryColor = getComputedStyle(document.documentElement)
        .getPropertyValue('--color-white-25').trim();
    const borderColor = getComputedStyle(document.documentElement)
        .getPropertyValue('--color-chat-box-border').trim();

    const chartData = {
        datasets: [
            {
                label: 'Aggregate WPM',
                data: aggWpmData.map((wpm, index) => ({
                    x: index,
                    y: wpm
                })),
                borderColor: accentColor,
                pointRadius: 0,
                pointHoverRadius: 4,
                showLine: true,
                borderWidth: 2,
                tension: 0.1,
            },
            {
                label: 'Raw WPM',
                data: rawWpmData.map((wpm, index) => ({
                    x: index,
                    y: wpm
                })),
                borderColor: secondaryColor,
                pointRadius: 0,
                pointHoverRadius: 4,
                showLine: true,
                borderWidth: 2,
                tension: 0.1,
            },
        ]
    };

    const options: ChartOptions<'line'> = {
        responsive: true,
        maintainAspectRatio: false,
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
                backgroundColor: '#1a1a1a',
                borderColor: borderColor,
                borderWidth: 1,
                titleColor: '#ffffff',
                bodyColor: 'rgba(255, 255, 255, 0.9)',
                padding: 12,
                displayColors: true,
                titleFont: {
                    size: 13,
                    weight: 'normal'
                },
                titleMarginBottom: 8,
                bodyFont: {
                    size: 13,
                    weight: 'lighter'
                },
                bodySpacing: 6,
                cornerRadius: 8,
                caretSize: 6,
                caretPadding: 10,
                callbacks: {
                    title: (context) => {
                        return `Second ${context[0].parsed.x}`;
                    },
                    label: (context) => {
                        return `${context.dataset.label}: ${context.parsed.y.toFixed(1)} WPM`;
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

    if (rawWpmData.length === 0 && aggWpmData.length === 0) {
        return (
            <div style={{
                backgroundColor: '#272727',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '8px',
                padding: '24px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2), 0 1px 3px rgba(0, 0, 0, 0.1)',
                width: '100%',
                textAlign: 'center',
                color: 'rgba(255, 255, 255, 0.6)'
            }}>
                No typing data available
            </div>
        );
    }

    return (
        <div style={{
            backgroundColor: '#272727',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '8px',
            padding: '24px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2), 0 1px 3px rgba(0, 0, 0, 0.1)',
            width: '100%'
        }}>
            <div style={{ height: '280px', position: 'relative', width: '100%' }}>
                <Line data={chartData} options={options} />
            </div>
        </div>
    );
};
