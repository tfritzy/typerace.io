import { useTable } from "spacetimedb/react";
import { useState } from "react";
import { Header } from "../components/Header";
import type { DbConnection } from "../../module_bindings";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    TimeScale,
    Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    TimeScale,
    Filler
);

type TimeFrame = '1month' | '6months' | '1year' | 'all';

interface GameModeCount {
    gameType: { tag: string };
    gameMode: { tag: string };
    finishedGames: number;
    nonLonelyGames: number;
    startedGames: number;
    totalWpm: number;
    minWpm: number;
    maxWpm: number;
    gameCount: number;
}

interface GlobalStats {
    date: string;
    stats: GameModeCount[];
    total: GameModeCount;
}

export const SiteStatsPage = () => {
    const { rows: globalStatsRows } = useTable<DbConnection, GlobalStats>("globalstats");
    const [selectedTimeFrame, setSelectedTimeFrame] = useState<TimeFrame>('1month');

    const globalStats = globalStatsRows || [];

    const getFilteredStats = () => {
        if (globalStats.length === 0) return [];

        const now = new Date();
        const cutoffDate = new Date();

        switch (selectedTimeFrame) {
            case '1month':
                cutoffDate.setMonth(now.getMonth() - 1);
                break;
            case '6months':
                cutoffDate.setMonth(now.getMonth() - 6);
                break;
            case '1year':
                cutoffDate.setFullYear(now.getFullYear() - 1);
                break;
            case 'all':
                return [...globalStats].sort((a, b) => a.date.localeCompare(b.date));
        }

        return globalStats
            .filter(stat => new Date(stat.date) >= cutoffDate)
            .sort((a, b) => a.date.localeCompare(b.date));
    };

    const filteredStats = getFilteredStats();

    const chartColors = [
        '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16',
        '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
        '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef'
    ];

    const createDatasets = (gameModes: Map<string, number[]>) => {
        return Array.from(gameModes.entries()).map(([mode, data], index) => ({
            label: mode,
            data,
            backgroundColor: `${chartColors[index % chartColors.length]}33`,
            borderColor: chartColors[index % chartColors.length],
            borderWidth: 2,
            fill: false,
            tension: 0.4,
        }));
    };

    const getGamesPerDayData = () => {
        if (filteredStats.length === 0) return { labels: [], datasets: [] };

        const labels = filteredStats.map(stat => stat.date);
        const gameModes = new Map<string, number[]>();

        filteredStats.forEach((stat, index) => {
            stat.stats.forEach(modeCount => {
                const modeName = modeCount.gameMode.tag;
                if (!gameModes.has(modeName)) {
                    gameModes.set(modeName, new Array(filteredStats.length).fill(0));
                }
                gameModes.get(modeName)![index] = modeCount.finishedGames;
            });
        });

        const datasets = createDatasets(gameModes);

        return { labels, datasets };
    };

    const getPlayersPerDayData = () => {
        if (filteredStats.length === 0) return { labels: [], datasets: [] };

        const labels = filteredStats.map(stat => stat.date);
        const gameModes = new Map<string, number[]>();

        filteredStats.forEach((stat, index) => {
            stat.stats.forEach(modeCount => {
                const modeName = modeCount.gameMode.tag;
                if (!gameModes.has(modeName)) {
                    gameModes.set(modeName, new Array(filteredStats.length).fill(0));
                }
                gameModes.get(modeName)![index] = modeCount.gameCount;
            });
        });

        const datasets = createDatasets(gameModes);

        return { labels, datasets };
    };

    const getNonLonelyGamesData = () => {
        if (filteredStats.length === 0) return { labels: [], datasets: [] };

        const labels = filteredStats.map(stat => stat.date);
        const nonLonelyPercentages: number[] = [];
        const lonelyPercentages: number[] = [];

        filteredStats.forEach(stat => {
            const total = stat.total.finishedGames;
            const nonLonely = stat.total.nonLonelyGames;
            const nonLonelyPercent = total > 0 ? (nonLonely / total) * 100 : 0;
            nonLonelyPercentages.push(nonLonelyPercent);
            lonelyPercentages.push(100 - nonLonelyPercent);
        });

        return {
            labels,
            datasets: [
                {
                    label: 'Non-Lonely Games %',
                    data: nonLonelyPercentages,
                    borderColor: '#fbbf24',
                    backgroundColor: 'rgba(251, 191, 36, 0.5)',
                    fill: true,
                    tension: 0.4,
                },
                {
                    label: 'Lonely Games %',
                    data: lonelyPercentages,
                    borderColor: '#6b7280',
                    backgroundColor: 'rgba(107, 114, 128, 0.3)',
                    fill: true,
                    tension: 0.4,
                }
            ]
        };
    };

    const getCompletionRateData = () => {
        if (filteredStats.length === 0) return { labels: [], datasets: [] };

        const labels = filteredStats.map(stat => stat.date);
        const completionPercentages: number[] = [];
        const incompletePercentages: number[] = [];

        filteredStats.forEach(stat => {
            const started = stat.total.startedGames;
            const finished = stat.total.finishedGames;
            const completionPercent = started > 0 ? (finished / started) * 100 : 0;
            completionPercentages.push(completionPercent);
            incompletePercentages.push(100 - completionPercent);
        });

        return {
            labels,
            datasets: [
                {
                    label: 'Completed %',
                    data: completionPercentages,
                    borderColor: '#22c55e',
                    backgroundColor: 'rgba(34, 197, 94, 0.5)',
                    fill: true,
                    tension: 0.4,
                },
                {
                    label: 'Incomplete %',
                    data: incompletePercentages,
                    borderColor: '#6b7280',
                    backgroundColor: 'rgba(107, 114, 128, 0.3)',
                    fill: true,
                    tension: 0.4,
                }
            ]
        };
    };

    const gamesPerDayData = getGamesPerDayData();
    const playersPerDayData = getPlayersPerDayData();
    const nonLonelyGamesData = getNonLonelyGamesData();
    const completionRateData = getCompletionRateData();

    const lineChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                position: 'bottom' as const,
                labels: {
                    color: 'rgba(255, 255, 255, 0.8)',
                    font: { size: 11 },
                    boxWidth: 12,
                    padding: 10,
                }
            },
            tooltip: {
                backgroundColor: '#1a1a1a',
                borderColor: 'rgba(255, 255, 255, 0.12)',
                borderWidth: 1,
                titleColor: '#ffffff',
                bodyColor: 'rgba(255, 255, 255, 0.9)',
                padding: 12,
            }
        },
        scales: {
            x: {
                ticks: {
                    color: 'rgba(255, 255, 255, 0.6)',
                    font: { size: 10 },
                    maxRotation: 45,
                    minRotation: 45,
                },
                grid: {
                    color: 'rgba(255, 255, 255, 0.06)',
                },
                border: { display: false }
            },
            y: {
                ticks: {
                    color: 'rgba(255, 255, 255, 0.6)',
                    font: { size: 10 },
                },
                grid: {
                    color: 'rgba(255, 255, 255, 0.06)',
                },
                border: { display: false }
            }
        }
    };

    const areaChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                position: 'bottom' as const,
                labels: {
                    color: 'rgba(255, 255, 255, 0.8)',
                    font: { size: 11 },
                    boxWidth: 12,
                    padding: 10,
                }
            },
            tooltip: {
                backgroundColor: '#1a1a1a',
                borderColor: 'rgba(255, 255, 255, 0.12)',
                borderWidth: 1,
                titleColor: '#ffffff',
                bodyColor: 'rgba(255, 255, 255, 0.9)',
                padding: 12,
                callbacks: {
                    label: (context: { parsed: { y: number } }) => `${context.parsed.y.toFixed(1)}%`
                }
            }
        },
        scales: {
            x: {
                stacked: true,
                ticks: {
                    color: 'rgba(255, 255, 255, 0.6)',
                    font: { size: 10 },
                    maxRotation: 45,
                    minRotation: 45,
                },
                grid: {
                    color: 'rgba(255, 255, 255, 0.06)',
                },
                border: { display: false }
            },
            y: {
                stacked: true,
                min: 0,
                max: 100,
                ticks: {
                    color: 'rgba(255, 255, 255, 0.6)',
                    font: { size: 10 },
                    callback: (value: number | string) => `${value}%`
                },
                grid: {
                    color: 'rgba(255, 255, 255, 0.06)',
                },
                border: { display: false }
            }
        }
    };

    return (
        <div className="relative min-h-screen flex flex-col overflow-hidden">
            <Header />
            <div className="flex-1 overflow-y-auto p-4">
                <h1 className="text-3xl font-bold mb-6 text-white px-4">Site Statistics</h1>

                <div className="mb-6 px-4 flex gap-2">
                    {(['1month', '6months', '1year', 'all'] as TimeFrame[]).map(timeFrame => (
                        <button
                            key={timeFrame}
                            onClick={() => setSelectedTimeFrame(timeFrame)}
                            className={`px-4 py-2 rounded-lg transition-all ${selectedTimeFrame === timeFrame
                                ? 'bg-amber-400 text-black font-semibold'
                                : 'bg-white/5 text-white/80 hover:bg-white/10'
                                }`}
                        >
                            {timeFrame === '1month' ? '1 Month' :
                                timeFrame === '6months' ? '6 Months' :
                                    timeFrame === '1year' ? '1 Year' : 'All Time'}
                        </button>
                    ))}
                </div>

                <section className="mb-8 box box-shadow rounded-lg p-6">
                    <h2 className="text-xl font-semibold mb-4 text-white">Games Played Per Day by Game Mode</h2>
                    <div className="h-[300px]">
                        <Line data={gamesPerDayData} options={lineChartOptions} />
                    </div>
                </section>

                <section className="mb-8 box box-shadow rounded-lg p-6">
                    <h2 className="text-xl font-semibold mb-4 text-white">Players Per Day by Game Mode</h2>
                    <div className="h-[300px]">
                        <Line data={playersPerDayData} options={lineChartOptions} />
                    </div>
                </section>

                <section className="mb-8 box box-shadow rounded-lg p-6">
                    <h2 className="text-xl font-semibold mb-2 text-white">Non-Lonely Games</h2>
                    <p className="text-sm text-gray-400 mb-4">
                        Percentage of games with 2+ human players
                    </p>
                    <div className="h-[280px]">
                        <Line data={nonLonelyGamesData} options={areaChartOptions} />
                    </div>
                </section>

                <section className="mb-8 box box-shadow rounded-lg p-6">
                    <h2 className="text-xl font-semibold mb-2 text-white">Game Completion Rate</h2>
                    <p className="text-sm text-gray-400 mb-4">
                        Percentage of started games that were completed
                    </p>
                    <div className="h-[280px]">
                        <Line data={completionRateData} options={areaChartOptions} />
                    </div>
                </section>
            </div>
        </div>
    );
};
