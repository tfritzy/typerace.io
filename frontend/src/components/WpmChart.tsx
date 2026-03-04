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
import type { GameRecord } from '../types/stdb';
import { formatStopwatchTime, getOrdinalPlacement } from '../utils/formatters';
import { useState, useEffect } from 'react';

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
}

export const WpmChart = ({ data }: WpmChartProps) => {
    const [colorTrigger, setColorTrigger] = useState(0);

    const sortedData = [...data].sort((a, b) => Number(a.date - b.date));

    useEffect(() => {
        const observer = new MutationObserver(() => {
            setColorTrigger(prev => prev + 1);
        });

        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['style']
        });

        return () => observer.disconnect();
    }, []);
    const calculateRollingAverage = () => {
        if (sortedData.length === 0) return [];

        const startTime = Number(sortedData[0].date);
        const endTime = Number(sortedData[sortedData.length - 1].date);
        const timeSpan = endTime - startTime;

        const numSamples = Math.min(50, sortedData.length);
        const timeStep = timeSpan / (numSamples - 1);
        const windowSizeMicros = timeSpan * 0.15;

        const rollingAvg: { x: number; y: number }[] = [];

        for (let i = 0; i < numSamples; i++) {
            const sampleTime = startTime + (i * timeStep);
            const windowStart = sampleTime - windowSizeMicros / 2;
            const windowEnd = sampleTime + windowSizeMicros / 2;

            const pointsInWindow = sortedData.filter(p => {
                const t = Number(p.date);
                return t >= windowStart && t <= windowEnd;
            });

            if (pointsInWindow.length > 0) {
                const avgWpm = pointsInWindow.reduce((sum, p) => sum + p.wpm, 0) / pointsInWindow.length;
                rollingAvg.push({
                    x: sampleTime / 1000,
                    y: avgWpm
                });
            }
        }

        return rollingAvg;
    };

    const calculateMaxWpm = () => {
        if (sortedData.length === 0) return [];

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

    const getTimeConfig = () => {
        if (sortedData.length === 0) return { unit: 'day' as const, format: 'MMM d' };

        const timeSpanMicros = Number(sortedData[sortedData.length - 1].date - sortedData[0].date);
        const days = timeSpanMicros / (1000 * 1000 * 60 * 60 * 24);

        if (days < 1) {
            return { unit: 'hour' as const, format: 'HH:mm' };
        } else if (days < 7) {
            return { unit: 'day' as const, format: 'MMM d' };
        } else if (days < 60) {
            return { unit: 'week' as const, format: 'MMM d' };
        } else if (days < 365) {
            return { unit: 'month' as const, format: 'MMM yyyy' };
        } else {
            return { unit: 'year' as const, format: 'yyyy' };
        }
    };

    const timeConfig = getTimeConfig();

    const accentColor = colorTrigger >= 0 ? getComputedStyle(document.documentElement)
        .getPropertyValue('--color-accent').trim() : '';
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
                borderWidth: 3,
                tension: 0.5,
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
                backgroundColor: 'rgba(24, 24, 24, 0.72)',
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
                    unit: timeConfig.unit,
                    displayFormats: {
                        hour: timeConfig.format,
                        day: timeConfig.format,
                        week: timeConfig.format,
                        month: timeConfig.format,
                        year: timeConfig.format
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
                beginAtZero: true,
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
        <div className="mb-8 box box-shadow rounded-lg p-6 w-full">
            <div className="h-[280px] relative w-full">
                <Line data={chartData} options={options} />
            </div>
        </div>
    );
};
