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
import type { CharacterEvent } from '../../module_bindings/character_event_type';

ChartJS.register(
    LinearScale,
    PointElement,
    LineElement,
    Tooltip,
    Legend
);

interface ProgressOverTimeChartProps {
    allPlayerProgress: PlayerProgress[];
    phraseLength: number;
    raceStartTimestamp: bigint;
}

interface ProgressDataPoint {
    x: number;
    y: number;
}

const getProgressBySecond = (
    events: CharacterEvent[],
    raceStartTimestamp: bigint,
    phraseLength: number
): ProgressDataPoint[] => {
    if (!events || events.length === 0 || phraseLength === 0) {
        return [{ x: 0, y: 0 }];
    }

    const timeStack: number[] = [];

    for (const evt of events) {
        const elapsedMicros = evt.timestamp - raceStartTimestamp;
        const seconds = Number(elapsedMicros) / 1_000_000.0;

        if (seconds < 0) {
            continue;
        }

        if (evt.eventType.tag === "Backspace") {
            if (timeStack.length > 0) {
                timeStack.pop();
            }
        } else {
            timeStack.push(seconds);
        }
    }

    if (timeStack.length === 0) {
        return [{ x: 0, y: 0 }];
    }

    const progressData: ProgressDataPoint[] = [{ x: 0, y: 0 }];

    const maxSeconds = Math.ceil(timeStack[timeStack.length - 1]);
    
    for (let second = 1; second <= maxSeconds; second++) {
        let charCount = 0;
        
        for (let i = timeStack.length - 1; i >= 0; i--) {
            if (timeStack[i] <= second) {
                charCount = i + 1;
                break;
            }
        }

        const percentComplete = (charCount / phraseLength) * 100;
        progressData.push({ 
            x: second, 
            y: Math.min(100, percentComplete) 
        });
    }

    const finalProgress = (timeStack.length / phraseLength) * 100;
    if (progressData[progressData.length - 1].y < 99.9 && finalProgress >= 99.9) {
        progressData.push({ 
            x: timeStack[timeStack.length - 1], 
            y: 100 
        });
    }

    return progressData;
};

const PLAYER_COLORS = [
    'rgb(251, 191, 36)',
    'rgb(96, 165, 250)',
    'rgb(167, 139, 250)',
];

export const ProgressOverTimeChart = ({ 
    allPlayerProgress, 
    phraseLength,
    raceStartTimestamp 
}: ProgressOverTimeChartProps) => {
    const borderColor = getComputedStyle(document.documentElement)
        .getPropertyValue('--color-chat-box-border').trim();

    const datasets = allPlayerProgress.map((playerProgress, index) => {
        const progressData = getProgressBySecond(
            playerProgress.characterHistory,
            raceStartTimestamp,
            phraseLength
        );

        return {
            label: playerProgress.playerName,
            data: progressData,
            borderColor: PLAYER_COLORS[index % PLAYER_COLORS.length],
            backgroundColor: PLAYER_COLORS[index % PLAYER_COLORS.length],
            pointRadius: 0,
            pointHoverRadius: 4,
            showLine: true,
            borderWidth: 2,
            tension: 0.1,
        };
    });

    const chartData = {
        datasets
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
                        return `${context[0].parsed.x.toFixed(1)}s`;
                    },
                    label: (context) => {
                        return `${context.dataset.label}: ${context.parsed.y.toFixed(1)}%`;
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
                min: 0,
                max: 100,
                title: {
                    display: true,
                    text: 'Progress (%)',
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
                    padding: 8,
                    callback: function(value) {
                        return value + '%';
                    }
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
            <div style={{
                width: '100%',
                textAlign: 'center',
                color: 'rgba(255, 255, 255, 0.6)',
                padding: '24px 0'
            }}>
                No player data available
            </div>
        );
    }

    return (
        <div style={{ height: '280px', position: 'relative', width: '100%' }}>
            <Line data={chartData} options={options} />
        </div>
    );
};
