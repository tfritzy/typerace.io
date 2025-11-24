import { useSpacetimeDB, useTable } from "spacetimedb/react";
import { useEffect, useState } from "react";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import type { DbConnection } from "../../module_bindings";
import type { ErrorContextInterface } from "spacetimedb/sdk";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    TimeScale,
    Filler,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
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
    const conn = useSpacetimeDB<DbConnection>();
    const { rows: globalStatsRows } = useTable<DbConnection, GlobalStats>("globalstats");
    const [selectedTimeFrame, setSelectedTimeFrame] = useState<TimeFrame>('1month');

    useEffect(() => {
        if (!conn) return;

        const globalStatsSubscription = conn.subscriptionBuilder()
            .onError((error: ErrorContextInterface) => {
                console.error("Error subscribing to globalstats:", error);
            })
            .subscribe(`select * from globalstats`);

        return () => {
            globalStatsSubscription.unsubscribe();
        };
    }, [conn]);

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

        const colors = [
            '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16',
            '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
            '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef'
        ];

        const datasets = Array.from(gameModes.entries()).map(([mode, data], index) => ({
            label: mode,
            data,
            backgroundColor: colors[index % colors.length],
            borderColor: colors[index % colors.length],
            borderWidth: 2,
        }));

        return { labels, datasets };
    };

    const getNonLonelyGamesData = () => {
        if (filteredStats.length === 0) return { labels: [], datasets: [] };

        const labels = filteredStats.map(stat => stat.date);
        const nonLonelyPercentages = filteredStats.map(stat => {
            const total = stat.total.finishedGames;
            const nonLonely = stat.total.nonLonelyGames;
            return total > 0 ? (nonLonely / total) * 100 : 0;
        });

        return {
            labels,
            datasets: [{
                label: 'Non-Lonely Games %',
                data: nonLonelyPercentages,
                borderColor: '#fbbf24',
                backgroundColor: 'rgba(251, 191, 36, 0.2)',
                fill: true,
                tension: 0.4,
            }]
        };
    };

    const getCompletionRateData = () => {
        if (filteredStats.length === 0) return { labels: [], datasets: [] };

        const labels = filteredStats.map(stat => stat.date);
        const completionPercentages = filteredStats.map(stat => {
            const started = stat.total.startedGames;
            const finished = stat.total.finishedGames;
            return started > 0 ? (finished / started) * 100 : 0;
        });

        return {
            labels,
            datasets: [{
                label: 'Completion Rate %',
                data: completionPercentages,
                borderColor: '#22c55e',
                backgroundColor: 'rgba(34, 197, 94, 0.2)',
                fill: true,
                tension: 0.4,
            }]
        };
    };

    const playersPerDayData = getPlayersPerDayData();
    const nonLonelyGamesData = getNonLonelyGamesData();
    const completionRateData = getCompletionRateData();

    const barOptions = {
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

    const lineOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
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
                <div className="content-container">
                    <div className="box p-8 my-8 text-white">
                        <h1 className="text-3xl font-bold mb-6">Site Statistics</h1>

                        <div className="mb-6 flex gap-2">
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

                        {filteredStats.length === 0 ? (
                            <div className="text-center py-12 text-gray-400">
                                No statistics available yet. Play some games to see stats!
                            </div>
                        ) : (
                            <>
                                <section className="mb-8">
                                    <h2 className="text-xl font-semibold mb-4">Players Per Day by Game Mode</h2>
                                    <div className="bg-[#272727] border border-white/15 rounded-lg p-6 shadow-[0_4px_12px_rgba(0,0,0,0.2),0_1px_3px_rgba(0,0,0,0.1)]">
                                        <div className="h-[300px]">
                                            <Bar data={playersPerDayData} options={barOptions} />
                                        </div>
                                    </div>
                                </section>

                                <section className="mb-8">
                                    <h2 className="text-xl font-semibold mb-4">Non-Lonely Games</h2>
                                    <p className="text-sm text-gray-400 mb-4">
                                        Percentage of games with 2+ human players
                                    </p>
                                    <div className="bg-[#272727] border border-white/15 rounded-lg p-6 shadow-[0_4px_12px_rgba(0,0,0,0.2),0_1px_3px_rgba(0,0,0,0.1)]">
                                        <div className="h-[280px]">
                                            <Line data={nonLonelyGamesData} options={lineOptions} />
                                        </div>
                                    </div>
                                </section>

                                <section className="mb-8">
                                    <h2 className="text-xl font-semibold mb-4">Game Completion Rate</h2>
                                    <p className="text-sm text-gray-400 mb-4">
                                        Percentage of started games that were completed
                                    </p>
                                    <div className="bg-[#272727] border border-white/15 rounded-lg p-6 shadow-[0_4px_12px_rgba(0,0,0,0.2),0_1px_3px_rgba(0,0,0,0.1)]">
                                        <div className="h-[280px]">
                                            <Line data={completionRateData} options={lineOptions} />
                                        </div>
                                    </div>
                                </section>
                            </>
                        )}
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};
