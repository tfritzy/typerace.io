import { useState, useEffect, useMemo, useCallback } from "react";
import { Header } from "../components/Header";
import { useDatabase } from "../contexts/SpacetimeContext";
import { getThemePlayerColorList } from "../utils/colorMapping";
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
import { getDefaultSiteTitle } from "../utils/modes";

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
    dailyActivePlayers: number;
}

export const SiteStatsPage = () => {
    const conn = useDatabase();
    const [globalStats, setGlobalStats] = useState<GlobalStats[]>([]);
    const [selectedTimeFrame, setSelectedTimeFrame] = useState<TimeFrame>('1month');
    const [themeTick, setThemeTick] = useState(0);

    const onThemeChange = useCallback(() => setThemeTick(t => t + 1), []);
    useEffect(() => {
        window.addEventListener('themechange', onThemeChange);
        return () => window.removeEventListener('themechange', onThemeChange);
    }, [onThemeChange]);

    useEffect(() => {
        document.title = "Site Statistics - TypeRace.io";
        return () => { document.title = getDefaultSiteTitle(); };
    }, []);

    useEffect(() => {
        if (!conn) return;

        const handleStatsInsert = (_ctx: any, stats: GlobalStats) => {
            setGlobalStats(prev => {
                if (prev.some(s => s.date === stats.date)) {
                    return prev;
                }
                return [...prev, stats];
            });
        };

        const handleStatsUpdate = (_ctx: any, _oldStats: GlobalStats, newStats: GlobalStats) => {
            setGlobalStats(prev =>
                prev.map(s => s.date === newStats.date ? newStats : s)
            );
        };

        conn.db.globalstats.onInsert(handleStatsInsert);
        conn.db.globalstats.onUpdate(handleStatsUpdate);

        const subscription = conn.subscriptionBuilder()
            .onApplied(() => {
                setGlobalStats(Array.from(conn.db.globalstats.iter()));
            })
            .subscribe([`SELECT * FROM globalstats`]);

        return () => {
            conn.db.globalstats.removeOnInsert(handleStatsInsert);
            conn.db.globalstats.removeOnUpdate(handleStatsUpdate);
            subscription.unsubscribe();
        };
    }, [conn]);

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

    const chartColors = useMemo(() => getThemePlayerColorList(), [themeTick]);

    const chartNeutralColor = useMemo(() => {
        return getComputedStyle(document.documentElement).getPropertyValue('--chart-neutral').trim();
    }, []);

    const accentColor = useMemo(() => {
        return getComputedStyle(document.documentElement).getPropertyValue('--accent-primary').trim();
    }, []);

    const resolvedColors = useMemo(() => {
        const s = getComputedStyle(document.documentElement);
        return {
            gridLine: s.getPropertyValue('--grid-line').trim(),
            mutedFg: s.getPropertyValue('--muted-foreground').trim(),
            secondaryFg: s.getPropertyValue('--secondary-foreground').trim(),
            foreground: s.getPropertyValue('--foreground').trim(),
            input: s.getPropertyValue('--input').trim(),
            border: s.getPropertyValue('--border').trim(),
        };
    }, []);

    const chartBackgroundAlpha = '33';

    const createLineDatasets = (gameModes: Map<string, number[]>) => {
        return Array.from(gameModes.entries()).map(([mode, data], index) => ({
            label: mode,
            data,
            backgroundColor: `${chartColors[index % chartColors.length]}${chartBackgroundAlpha}`,
            borderColor: chartColors[index % chartColors.length],
            borderWidth: 2,
            fill: false,
            tension: 0.4,
        }));
    };

    const createAreaDatasets = (gameModes: Map<string, number[]>) => {
        return Array.from(gameModes.entries()).map(([mode, data], index) => ({
            label: mode,
            data,
            backgroundColor: `${chartColors[index % chartColors.length]}${chartBackgroundAlpha}`,
            borderColor: chartColors[index % chartColors.length],
            borderWidth: 2,
            fill: true,
            tension: 0.4,
        }));
    };

    const createBarDatasets = (gameModes: Map<string, number[]>) => {
        return Array.from(gameModes.entries()).map(([mode, data], index) => ({
            label: mode,
            data,
            backgroundColor: chartColors[index % chartColors.length],
            borderColor: chartColors[index % chartColors.length],
            borderWidth: 0,
        }));
    };

    const processGameModeData = (fieldAccessor: (modeCount: GameModeCount) => number, chartType: 'line' | 'area' | 'bar' = 'line') => {
        if (filteredStats.length === 0) return { labels: [], datasets: [] };

        const labels = filteredStats.map(stat => stat.date);
        const gameModes = new Map<string, number[]>();

        filteredStats.forEach((stat, index) => {
            stat.stats.forEach(modeCount => {
                const modeName = modeCount.gameMode.tag;
                if (!gameModes.has(modeName)) {
                    gameModes.set(modeName, new Array(filteredStats.length).fill(0));
                }
                gameModes.get(modeName)![index] += fieldAccessor(modeCount);
            });
        });

        const datasets = chartType === 'bar' ? createBarDatasets(gameModes)
            : chartType === 'area' ? createAreaDatasets(gameModes)
                : createLineDatasets(gameModes);

        return { labels, datasets };
    };

    const getGamesPerDayData = () => {
        return processGameModeData(modeCount => modeCount.finishedGames, 'bar');
    };

    const getPlayersPerDayData = () => {
        if (filteredStats.length === 0) return { labels: [], datasets: [] };

        const labels = filteredStats.map(stat => stat.date);
        const playerCounts = filteredStats.map(stat => stat.dailyActivePlayers);

        return {
            labels,
            datasets: [
                {
                    label: 'Unique Daily Players',
                    data: playerCounts,
                    backgroundColor: `${accentColor}${chartBackgroundAlpha}`,
                    borderColor: accentColor,
                    borderWidth: 2,
                    fill: false,
                    tension: 0.4,
                }
            ]
        };
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
                    borderColor: accentColor,
                    backgroundColor: `${accentColor}80`,
                    fill: true,
                    tension: 0.4,
                },
                {
                    label: 'Lonely Games %',
                    data: lonelyPercentages,
                    borderColor: chartNeutralColor,
                    backgroundColor: `${chartNeutralColor}4D`,
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
                    borderColor: accentColor,
                    backgroundColor: `${accentColor}80`,
                    fill: true,
                    tension: 0.4,
                },
                {
                    label: 'Incomplete %',
                    data: incompletePercentages,
                    borderColor: chartNeutralColor,
                    backgroundColor: `${chartNeutralColor}4D`,
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

    const stackedChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                position: 'bottom' as const,
                labels: {
                    color: resolvedColors.secondaryFg,
                    font: { size: 11 },
                    boxWidth: 12,
                    padding: 10,
                }
            },
            tooltip: {
                backgroundColor: resolvedColors.input,
                borderColor: resolvedColors.border,
                borderWidth: 1,
                titleColor: resolvedColors.foreground,
                bodyColor: resolvedColors.secondaryFg,
                padding: 12,
            }
        },
        scales: {
            x: {
                stacked: true,
                ticks: {
                    color: resolvedColors.mutedFg,
                    font: { size: 10 },
                    maxRotation: 45,
                    minRotation: 45,
                },
                grid: {
                    color: resolvedColors.gridLine,
                },
                border: { display: false }
            },
            y: {
                stacked: true,
                beginAtZero: true,
                ticks: {
                    color: resolvedColors.mutedFg,
                    font: { size: 10 },
                },
                grid: {
                    color: resolvedColors.gridLine,
                },
                border: { display: false }
            }
        }
    };

    const lineChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                position: 'bottom' as const,
                labels: {
                    color: resolvedColors.secondaryFg,
                    font: { size: 11 },
                    boxWidth: 12,
                    padding: 10,
                }
            },
            tooltip: {
                backgroundColor: resolvedColors.input,
                borderColor: resolvedColors.border,
                borderWidth: 1,
                titleColor: resolvedColors.foreground,
                bodyColor: resolvedColors.secondaryFg,
                padding: 12,
            }
        },
        scales: {
            x: {
                ticks: {
                    color: resolvedColors.mutedFg,
                    font: { size: 10 },
                    maxRotation: 45,
                    minRotation: 45,
                },
                grid: {
                    color: resolvedColors.gridLine,
                },
                border: { display: false }
            },
            y: {
                beginAtZero: true,
                ticks: {
                    color: resolvedColors.mutedFg,
                    font: { size: 10 },
                },
                grid: {
                    color: resolvedColors.gridLine,
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
                    color: resolvedColors.secondaryFg,
                    font: { size: 11 },
                    boxWidth: 12,
                    padding: 10,
                }
            },
            tooltip: {
                backgroundColor: resolvedColors.input,
                borderColor: resolvedColors.border,
                borderWidth: 1,
                titleColor: resolvedColors.foreground,
                bodyColor: resolvedColors.secondaryFg,
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
                    color: resolvedColors.mutedFg,
                    font: { size: 10 },
                    maxRotation: 45,
                    minRotation: 45,
                },
                grid: {
                    color: resolvedColors.gridLine,
                },
                border: { display: false }
            },
            y: {
                stacked: true,
                min: 0,
                max: 100,
                ticks: {
                    color: resolvedColors.mutedFg,
                    font: { size: 10 },
                    callback: (value: number | string) => `${value}%`
                },
                grid: {
                    color: resolvedColors.gridLine,
                },
                border: { display: false }
            }
        }
    };

    return (
        <div className="h-full flex flex-col">
            <Header />
            <main className="flex-1 min-h-0 overflow-y-auto flex flex-col items-center px-4 pb-12">
                <div className="content-container">
                    <h1 className="text-3xl font-bold mb-6 text-foreground">Site Statistics</h1>

                    <div className="mb-6 flex gap-2">
                        {(['1month', '6months', '1year', 'all'] as TimeFrame[]).map(timeFrame => (
                            <button
                                key={timeFrame}
                                onClick={() => setSelectedTimeFrame(timeFrame)}
                                className={`px-4 py-2 rounded-lg transition-all ${selectedTimeFrame === timeFrame
                                    ? 'bg-primary text-primary-foreground font-semibold'
                                    : 'bg-muted text-secondary-foreground hover:bg-secondary'
                                    }`}
                            >
                                {timeFrame === '1month' ? '1 Month' :
                                    timeFrame === '6months' ? '6 Months' :
                                        timeFrame === '1year' ? '1 Year' : 'All Time'}
                            </button>
                        ))}
                    </div>

                    <section className="mb-8 box box-shadow rounded-lg p-6">
                        <h2 className="text-xl font-semibold mb-4 text-foreground">Games Played Per Day by Game Mode</h2>
                        <div className="h-[300px]">
                            <Bar data={gamesPerDayData} options={stackedChartOptions} />
                        </div>
                    </section>

                    <section className="mb-8 box box-shadow rounded-lg p-6">
                        <h2 className="text-xl font-semibold mb-4 text-foreground">Unique Daily Active Players</h2>
                        <div className="h-[300px]">
                            <Line data={playersPerDayData} options={lineChartOptions} />
                        </div>
                    </section>

                    <section className="mb-8 box box-shadow rounded-lg p-6">
                        <h2 className="text-xl font-semibold mb-2 text-foreground">Non-Lonely Games</h2>
                        <p className="text-sm text-muted-foreground mb-4">
                            Percentage of games with 2+ human players
                        </p>
                        <div className="h-[280px]">
                            <Line data={nonLonelyGamesData} options={areaChartOptions} />
                        </div>
                    </section>

                    <section className="mb-8 box box-shadow rounded-lg p-6">
                        <h2 className="text-xl font-semibold mb-2 text-foreground">Game Completion Rate</h2>
                        <p className="text-sm text-muted-foreground mb-4">
                            Percentage of started games that were completed
                        </p>
                        <div className="h-[280px]">
                            <Line data={completionRateData} options={areaChartOptions} />
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
};
