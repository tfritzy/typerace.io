import {
    Chart as ChartJS,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip,
    Legend,
    TimeScale,
} from 'chart.js';
import type { ChartOptions } from 'chart.js';
import { Line } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';
import type { GameRecord } from '../../module_bindings';
import { formatStopwatchTime, getOrdinalPlacement } from '../utils/formatters';

ChartJS.register(
    LinearScale,
    PointElement,
    LineElement,
    Tooltip,
    Legend,
    TimeScale
);

interface WpmChartProps {
    data: GameRecord[];
    title: string;
}

export const WpmChart = ({ data, title }: WpmChartProps) => {
    const calculateRollingAverage = () => {
        if (data.length === 0) return [];

        const sortedData = [...data].sort((a, b) => Number(a.date - b.date));
        const timeSpan = Number(sortedData[sortedData.length - 1].date - sortedData[0].date);
        const daySpan = timeSpan / (1000 * 1000 * 60 * 60 * 24);

        const numPoints = Math.min(Math.max(Math.floor(daySpan / 15), data.length), 24);
        const windowSize = Math.max(Math.floor(data.length / numPoints), 3);

        const rollingAvg: { x: number; y: number }[] = [];

        for (let i = 0; i < sortedData.length; i++) {
            const start = Math.max(0, i - Math.floor(windowSize / 2));
            const end = Math.min(sortedData.length, start + windowSize);

            const windowData = sortedData.slice(start, end);
            const avgWpm = windowData.reduce((sum, p) => sum + p.wpm, 0) / windowData.length;

            rollingAvg.push({
                x: Number(sortedData[i].date) / 1000,
                y: avgWpm
            });
        }

        if (numPoints < rollingAvg.length) {
            const step = Math.floor(rollingAvg.length / numPoints);
            return rollingAvg.filter((_, index) => index % step === 0);
        }

        return rollingAvg;
    };

    const calculateMaxWpm = () => {
        if (data.length === 0) return [];

        const sortedData = [...data].sort((a, b) => Number(a.date - b.date));
        const maxWpmLine: { x: number; y: number }[] = [];
        let currentMax = 0;

        for (const point of sortedData) {
            if (point.wpm > currentMax) {
                currentMax = point.wpm;
            }
            maxWpmLine.push({
                x: Number(point.date) / 1000,
                y: currentMax
            });
        }

        return maxWpmLine;
    };

    const rollingAverage = calculateRollingAverage();
    const maxWpmLine = calculateMaxWpm();

    const accentColor = getComputedStyle(document.documentElement)
        .getPropertyValue('--color-accent').trim();
    const secondaryColor = getComputedStyle(document.documentElement)
        .getPropertyValue('--color-white-25').trim();
    const borderColor = getComputedStyle(document.documentElement)
        .getPropertyValue('--color-box-border').trim();


    const chartData = {
        datasets: [
            {
                label: 'Rolling Average',
                data: rollingAverage,
                borderColor: accentColor,
                pointRadius: 0,
                pointHoverRadius: 0,
                showLine: true,
                borderWidth: 2,
                tension: 0.4,
            },
            {
                label: 'WPM',
                data: data.map(point => ({
                    x: Number(point.date) / 1000,
                    y: point.wpm
                })),
                backgroundColor: `${accentColor}33`,
                borderColor: `${accentColor}77`,
                pointRadius: 3,
                pointHitRadius: 10,
                pointHoverRadius: 6,
                pointHoverBackgroundColor: accentColor,
                pointHoverBorderColor: '#ffffff',
                pointHoverBorderWidth: 2,
                showLine: false,
            },
            {
                label: 'Max WPM',
                data: maxWpmLine,
                borderColor: secondaryColor,
                pointRadius: 0,
                pointHoverRadius: 0,
                showLine: true,
                borderWidth: 2,
                stepped: 'before' as const,
            },
        ]
    };

    const options: ChartOptions<'line'> = {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                backgroundColor: '#1a1a1a',
                borderColor: borderColor,
                borderWidth: 1,
                titleColor: '#ffffff',
                bodyColor: 'rgba(255, 255, 255, 0.9)',
                padding: 16,
                displayColors: false,
                titleFont: {
                    size: 13,
                    weight: 'normal'
                },
                titleMarginBottom: 12,
                bodyFont: {
                    size: 13,
                    weight: 'lighter'
                },
                bodySpacing: 8,
                cornerRadius: 8,
                caretSize: 8,
                caretPadding: 12,
                callbacks: {
                    title: (context) => {
                        const date = new Date(context[0].parsed.x);
                        return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;
                    },
                    label: (context) => {
                        const dataPoint = data[context.dataIndex];
                        if (!dataPoint) return `${context.parsed.y.toFixed(1)} WPM`;

                        const totalSeconds = Number(dataPoint.timeMs) / 1000;
                        const time = formatStopwatchTime(totalSeconds);

                        return [
                            `${context.parsed.y.toFixed(1)} WPM`,
                            `Time: ${time}`,
                            `Place: ${getOrdinalPlacement(dataPoint.placement)}`,
                            `Mode: ${dataPoint.gameMode.tag}`
                        ];
                    }
                }
            }
        },
        scales: {
            x: {
                type: 'time',
                time: {
                    unit: 'month',
                    displayFormats: {
                        month: 'MMM yyyy'
                    }
                },
                title: {
                    display: false
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
                    display: false
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

    return (
        <div style={{
            marginBottom: '32px',
            backgroundColor: '#272727',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '8px',
            padding: '24px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2), 0 1px 3px rgba(0, 0, 0, 0.1)',
            width: '100%'
        }}>
            <h3 style={{
                color: '#ffffff',
                marginBottom: '20px',
                fontSize: '1.125rem',
                fontWeight: 600
            }}>
                {title}
            </h3>
            <div style={{ height: '280px', position: 'relative', width: '100%' }}>
                <Line data={chartData} options={options} />
            </div>
        </div>
    );
};
