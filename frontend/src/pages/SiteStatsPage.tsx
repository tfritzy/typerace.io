import { useState, useEffect, useMemo, useCallback } from "react";
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
  type TooltipItem,
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";
import { useNavigate } from "react-router-dom";
import "chartjs-adapter-date-fns";
import { Select } from "../components/Select";
import { getDefaultSiteTitle, languages } from "../utils/modes";
import type { AbandonedGame } from "../types/stdb";

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
  Filler,
);

type TimeFrame = "1week" | "1month" | "6months" | "1year" | "all";
type GameModeFilter = "all" | string;

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
  const { conn } = useDatabase();
  const navigate = useNavigate();
  const [globalStats, setGlobalStats] = useState<GlobalStats[]>([]);
  const [abandonedGames, setAbandonedGames] = useState<AbandonedGame[]>([]);
  const [selectedTimeFrame, setSelectedTimeFrame] =
    useState<TimeFrame>("1week");
  const [selectedGameMode, setSelectedGameMode] =
    useState<GameModeFilter>("all");
  const [themeTick, setThemeTick] = useState(0);

  const onThemeChange = useCallback(() => setThemeTick((t) => t + 1), []);
  useEffect(() => {
    window.addEventListener("themechange", onThemeChange);
    return () => window.removeEventListener("themechange", onThemeChange);
  }, [onThemeChange]);

  useEffect(() => {
    document.title = "Site Statistics - TypeRace.io";
    return () => {
      document.title = getDefaultSiteTitle();
    };
  }, []);

  useEffect(() => {
    if (!conn) return;

    const handleStatsInsert = (_ctx: any, stats: GlobalStats) => {
      setGlobalStats((prev) => {
        if (prev.some((s) => s.date === stats.date)) {
          return prev;
        }
        return [...prev, stats];
      });
    };

    const handleStatsUpdate = (
      _ctx: any,
      _oldStats: GlobalStats,
      newStats: GlobalStats,
    ) => {
      setGlobalStats((prev) =>
        prev.map((s) => (s.date === newStats.date ? newStats : s)),
      );
    };

    conn.db.globalstats.onInsert(handleStatsInsert);
    conn.db.globalstats.onUpdate(handleStatsUpdate);

    const subscription = conn
      .subscriptionBuilder()
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

  useEffect(() => {
    if (!conn) return;

    const handleGameInsert = (_ctx: unknown, game: AbandonedGame) => {
      setAbandonedGames((previousGames) => {
        if (previousGames.some(({ gameId }) => gameId === game.gameId)) {
          return previousGames;
        }
        return [...previousGames, game];
      });
    };
    const handleGameDelete = (_ctx: unknown, game: AbandonedGame) => {
      setAbandonedGames((previousGames) =>
        previousGames.filter(({ gameId }) => gameId !== game.gameId),
      );
    };

    conn.db.abandonedgames.onInsert(handleGameInsert);
    conn.db.abandonedgames.onDelete(handleGameDelete);

    const subscription = conn
      .subscriptionBuilder()
      .onApplied(() => {
        setAbandonedGames(Array.from(conn.db.abandonedgames.iter()));
      })
      .subscribe([`SELECT * FROM abandonedgames`]);

    return () => {
      conn.db.abandonedgames.removeOnInsert(handleGameInsert);
      conn.db.abandonedgames.removeOnDelete(handleGameDelete);
      subscription.unsubscribe();
    };
  }, [conn]);

  const getFilteredStats = () => {
    if (globalStats.length === 0) return [];

    const now = new Date();
    const cutoffDate = new Date();

    switch (selectedTimeFrame) {
      case "1week":
        cutoffDate.setDate(now.getDate() - 7);
        break;
      case "1month":
        cutoffDate.setMonth(now.getMonth() - 1);
        break;
      case "6months":
        cutoffDate.setMonth(now.getMonth() - 6);
        break;
      case "1year":
        cutoffDate.setFullYear(now.getFullYear() - 1);
        break;
      case "all":
        return [...globalStats].sort((a, b) => a.date.localeCompare(b.date));
    }

    return globalStats
      .filter((stat) => new Date(stat.date) >= cutoffDate)
      .sort((a, b) => a.date.localeCompare(b.date));
  };

  const filteredStats = getFilteredStats();

  const gameModeOptions = useMemo(() => {
    const modeOptions = languages.flatMap((lang) => {
      const options = [
        {
          value: lang.randomWordsMode,
          label: `${lang.nativeName} 500`,
        },
      ];

      if (lang.quotesMode) {
        options.push({
          value: lang.quotesMode,
          label: `${lang.nativeName} Quotes`,
        });
      }

      return options;
    });

    return [{ value: "all", label: "All modes" }, ...modeOptions];
  }, []);

  const gameModeLabelByValue = useMemo(() => {
    return new Map(
      gameModeOptions.map((option) => [option.value, option.label]),
    );
  }, [gameModeOptions]);

  const selectedGameModeLabel =
    gameModeLabelByValue.get(selectedGameMode) ?? selectedGameMode;

  const recentAbandonedGames = useMemo(
    () =>
      [...abandonedGames].sort((a, b) => {
        if (a.archivedAt !== b.archivedAt) {
          return a.archivedAt > b.archivedAt ? -1 : 1;
        }
        if (a.createdAt !== b.createdAt) {
          return a.createdAt > b.createdAt ? -1 : 1;
        }
        return b.gameId.localeCompare(a.gameId);
      }),
    [abandonedGames],
  );

  const formatGameTimestamp = (timestamp: bigint) =>
    new Date(Number(timestamp / 1000n)).toLocaleString();

  const chartColors = useMemo(() => getThemePlayerColorList(), [themeTick]);

  const chartNeutralColor = useMemo(() => {
    return getComputedStyle(document.documentElement)
      .getPropertyValue("--chart-neutral")
      .trim();
  }, []);

  const accentColor = useMemo(() => {
    return getComputedStyle(document.documentElement)
      .getPropertyValue("--accent-primary")
      .trim();
  }, []);

  const resolvedColors = useMemo(() => {
    const s = getComputedStyle(document.documentElement);
    return {
      gridLine: s.getPropertyValue("--grid-line").trim(),
      mutedFg: s.getPropertyValue("--muted-foreground").trim(),
      secondaryFg: s.getPropertyValue("--secondary-foreground").trim(),
      foreground: s.getPropertyValue("--foreground").trim(),
      input: s.getPropertyValue("--input").trim(),
      border: s.getPropertyValue("--border").trim(),
    };
  }, []);

  const chartBackgroundAlpha = "33";

  const getStatsForSelectedMode = (stat: GlobalStats): GameModeCount => {
    if (selectedGameMode === "all") {
      return stat.total;
    }

    const matchingStats = stat.stats.filter(
      (modeCount) => modeCount.gameMode.tag === selectedGameMode,
    );
    const countsWithGames = matchingStats.filter(
      (modeCount) => modeCount.gameCount > 0,
    );

    return {
      gameType: { tag: "Public" },
      gameMode: { tag: selectedGameMode },
      finishedGames: matchingStats.reduce(
        (sum, modeCount) => sum + modeCount.finishedGames,
        0,
      ),
      nonLonelyGames: matchingStats.reduce(
        (sum, modeCount) => sum + modeCount.nonLonelyGames,
        0,
      ),
      startedGames: matchingStats.reduce(
        (sum, modeCount) => sum + modeCount.startedGames,
        0,
      ),
      totalWpm: matchingStats.reduce(
        (sum, modeCount) => sum + modeCount.totalWpm,
        0,
      ),
      minWpm:
        countsWithGames.length > 0
          ? Math.min(...countsWithGames.map((modeCount) => modeCount.minWpm))
          : 0,
      maxWpm:
        countsWithGames.length > 0
          ? Math.max(...countsWithGames.map((modeCount) => modeCount.maxWpm))
          : 0,
      gameCount: matchingStats.reduce(
        (sum, modeCount) => sum + modeCount.gameCount,
        0,
      ),
    };
  };

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
    return Array.from(gameModes.entries())
      .filter(([, data]) => data.some((value) => value > 0))
      .map(([mode, data], index) => ({
        label: mode,
        data,
        backgroundColor: chartColors[index % chartColors.length],
        borderColor: chartColors[index % chartColors.length],
        borderWidth: 0,
      }));
  };

  const processGameModeData = (
    fieldAccessor: (modeCount: GameModeCount) => number,
    chartType: "line" | "area" | "bar" = "line",
  ) => {
    if (filteredStats.length === 0) return { labels: [], datasets: [] };

    const labels = filteredStats.map((stat) => stat.date);
    const gameModes = new Map<string, number[]>();

    filteredStats.forEach((stat, index) => {
      if (selectedGameMode !== "all") {
        const selectedModeStats = getStatsForSelectedMode(stat);
        if (!gameModes.has(selectedGameModeLabel)) {
          gameModes.set(
            selectedGameModeLabel,
            new Array(filteredStats.length).fill(0),
          );
        }
        gameModes.get(selectedGameModeLabel)![index] =
          fieldAccessor(selectedModeStats);
        return;
      }

      stat.stats.forEach((modeCount) => {
        const modeName =
          gameModeLabelByValue.get(modeCount.gameMode.tag) ??
          modeCount.gameMode.tag;
        if (!gameModes.has(modeName)) {
          gameModes.set(modeName, new Array(filteredStats.length).fill(0));
        }
        gameModes.get(modeName)![index] += fieldAccessor(modeCount);
      });
    });

    const datasets =
      chartType === "bar"
        ? createBarDatasets(gameModes)
        : chartType === "area"
          ? createAreaDatasets(gameModes)
          : createLineDatasets(gameModes);

    return { labels, datasets };
  };

  const getGamesPerDayData = () => {
    return processGameModeData((modeCount) => modeCount.finishedGames, "bar");
  };

  const getAbandonedGamesData = () => {
    return processGameModeData(
      (modeCount) =>
        Math.max(0, modeCount.startedGames - modeCount.finishedGames),
      "bar",
    );
  };

  const getPlayersPerDayData = () => {
    if (filteredStats.length === 0) return { labels: [], datasets: [] };

    const labels = filteredStats.map((stat) => stat.date);
    const playerCounts = filteredStats.map((stat) => stat.dailyActivePlayers);

    return {
      labels,
      datasets: [
        {
          label: "Unique Players",
          data: playerCounts,
          backgroundColor: `${accentColor}${chartBackgroundAlpha}`,
          borderColor: accentColor,
          borderWidth: 2,
          fill: false,
          tension: 0.4,
        },
      ],
    };
  };

  const getNonLonelyGamesData = () => {
    if (filteredStats.length === 0) return { labels: [], datasets: [] };

    const labels = filteredStats.map((stat) => stat.date);
    const nonLonelyPercentages: number[] = [];
    const lonelyPercentages: number[] = [];

    filteredStats.forEach((stat) => {
      const selectedStats = getStatsForSelectedMode(stat);
      const total = selectedStats.finishedGames;
      const nonLonely = selectedStats.nonLonelyGames;
      const nonLonelyPercent = total > 0 ? (nonLonely / total) * 100 : 0;
      nonLonelyPercentages.push(nonLonelyPercent);
      lonelyPercentages.push(100 - nonLonelyPercent);
    });

    return {
      labels,
      datasets: [
        {
          label: "Non-Lonely Games %",
          data: nonLonelyPercentages,
          borderColor: accentColor,
          backgroundColor: `${accentColor}80`,
          fill: true,
          tension: 0.4,
        },
        {
          label: "Lonely Games %",
          data: lonelyPercentages,
          borderColor: chartNeutralColor,
          backgroundColor: `${chartNeutralColor}4D`,
          fill: true,
          tension: 0.4,
        },
      ],
    };
  };

  const getCompletionRateData = () => {
    if (filteredStats.length === 0) return { labels: [], datasets: [] };

    const labels = filteredStats.map((stat) => stat.date);
    const completionPercentages: number[] = [];
    const incompletePercentages: number[] = [];

    filteredStats.forEach((stat) => {
      const selectedStats = getStatsForSelectedMode(stat);
      const started = selectedStats.startedGames;
      const finished = selectedStats.finishedGames;
      const completionPercent = started > 0 ? (finished / started) * 100 : 0;
      completionPercentages.push(completionPercent);
      incompletePercentages.push(100 - completionPercent);
    });

    return {
      labels,
      datasets: [
        {
          label: "Completed %",
          data: completionPercentages,
          borderColor: accentColor,
          backgroundColor: `${accentColor}80`,
          fill: true,
          tension: 0.4,
        },
        {
          label: "Incomplete %",
          data: incompletePercentages,
          borderColor: chartNeutralColor,
          backgroundColor: `${chartNeutralColor}4D`,
          fill: true,
          tension: 0.4,
        },
      ],
    };
  };

  const getGameTypeDistributionData = () => {
    const gameTypes = Array.from(
      new Set(
        filteredStats.flatMap((stat) =>
          stat.stats
            .filter(
              (modeCount) =>
                selectedGameMode === "all" ||
                modeCount.gameMode.tag === selectedGameMode,
            )
            .map((modeCount) => modeCount.gameType.tag),
        ),
      ),
    ).sort();
    const percentages = new Map(
      gameTypes.map((gameType) => [gameType, [] as number[]]),
    );

    filteredStats.forEach((stat) => {
      const relevantStats =
        selectedGameMode === "all"
          ? stat.stats
          : stat.stats.filter(
              (modeCount) => modeCount.gameMode.tag === selectedGameMode,
            );
      const counts = new Map(gameTypes.map((gameType) => [gameType, 0]));

      relevantStats.forEach((modeCount) => {
        const gameType = modeCount.gameType.tag;
        counts.set(gameType, counts.get(gameType)! + modeCount.startedGames);
      });

      const totalGames = Array.from(counts.values()).reduce(
        (sum, count) => sum + count,
        0,
      );
      gameTypes.forEach((gameType) => {
        const percentage =
          totalGames > 0 ? (counts.get(gameType)! / totalGames) * 100 : 0;
        percentages.get(gameType)!.push(percentage);
      });
    });

    return {
      labels: filteredStats.map((stat) => stat.date),
      datasets: gameTypes.map((gameType, index) => ({
        label: gameType,
        data: percentages.get(gameType)!,
        backgroundColor: chartColors[index % chartColors.length],
        borderWidth: 0,
      })),
    };
  };

  const gamesPerDayData = getGamesPerDayData();
  const abandonedGamesData = getAbandonedGamesData();
  const playersPerDayData = getPlayersPerDayData();
  const nonLonelyGamesData = getNonLonelyGamesData();
  const completionRateData = getCompletionRateData();
  const gameTypeDistributionData = getGameTypeDistributionData();

  const stackedChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "index" as const,
      intersect: false,
    },
    plugins: {
      legend: {
        display: true,
        position: "bottom" as const,
        labels: {
          color: resolvedColors.secondaryFg,
          font: { size: 11 },
          boxWidth: 12,
          padding: 10,
        },
      },
      tooltip: {
        backgroundColor: resolvedColors.input,
        borderColor: resolvedColors.border,
        borderWidth: 1,
        titleColor: resolvedColors.foreground,
        bodyColor: resolvedColors.secondaryFg,
        padding: 12,
        filter: (context: TooltipItem<"bar">) => context.parsed.y > 0,
      },
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
        border: { display: false },
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
        border: { display: false },
      },
    },
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "index" as const,
      intersect: false,
    },
    plugins: {
      legend: {
        display: true,
        position: "bottom" as const,
        labels: {
          color: resolvedColors.secondaryFg,
          font: { size: 11 },
          boxWidth: 12,
          padding: 10,
        },
      },
      tooltip: {
        backgroundColor: resolvedColors.input,
        borderColor: resolvedColors.border,
        borderWidth: 1,
        titleColor: resolvedColors.foreground,
        bodyColor: resolvedColors.secondaryFg,
        padding: 12,
      },
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
        border: { display: false },
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
        border: { display: false },
      },
    },
  };

  const areaChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "index" as const,
      intersect: false,
    },
    plugins: {
      legend: {
        display: true,
        position: "bottom" as const,
        labels: {
          color: resolvedColors.secondaryFg,
          font: { size: 11 },
          boxWidth: 12,
          padding: 10,
        },
      },
      tooltip: {
        backgroundColor: resolvedColors.input,
        borderColor: resolvedColors.border,
        borderWidth: 1,
        titleColor: resolvedColors.foreground,
        bodyColor: resolvedColors.secondaryFg,
        padding: 12,
        callbacks: {
          label: (context: { parsed: { y: number } }) =>
            `${context.parsed.y.toFixed(1)}%`,
        },
      },
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
        border: { display: false },
      },
      y: {
        stacked: true,
        min: 0,
        max: 100,
        ticks: {
          color: resolvedColors.mutedFg,
          font: { size: 10 },
          callback: (value: number | string) => `${value}%`,
        },
        grid: {
          color: resolvedColors.gridLine,
        },
        border: { display: false },
      },
    },
  };

  const percentageBarChartOptions = {
    ...stackedChartOptions,
    plugins: {
      ...stackedChartOptions.plugins,
      tooltip: {
        ...stackedChartOptions.plugins.tooltip,
        filter: (context: TooltipItem<"bar">) => context.parsed.y > 0,
        callbacks: {
          label: (context: TooltipItem<"bar">) =>
            `${context.dataset.label}: ${context.parsed.y.toFixed(1)}%`,
        },
      },
    },
    scales: {
      ...stackedChartOptions.scales,
      y: {
        ...stackedChartOptions.scales.y,
        min: 0,
        max: 100,
        ticks: {
          ...stackedChartOptions.scales.y.ticks,
          callback: (value: number | string) => `${value}%`,
        },
      },
    },
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <main className="flex-1 min-h-0 overflow-y-auto flex flex-col items-center px-4 pb-12">
        <div className="content-container">
          <h1 className="text-3xl font-bold mb-6 text-foreground">
            Site Statistics
          </h1>

          <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div className="flex flex-wrap gap-2">
              {(
                ["1week", "1month", "6months", "1year", "all"] as TimeFrame[]
              ).map((timeFrame) => (
                <button
                  key={timeFrame}
                  onClick={() => setSelectedTimeFrame(timeFrame)}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    selectedTimeFrame === timeFrame
                      ? "bg-primary text-primary-foreground font-semibold"
                      : "bg-muted text-secondary-foreground hover:bg-secondary"
                  }`}
                >
                  {timeFrame === "1week"
                    ? "1 Week"
                    : timeFrame === "1month"
                      ? "1 Month"
                      : timeFrame === "6months"
                        ? "6 Months"
                        : timeFrame === "1year"
                          ? "1 Year"
                          : "All Time"}
                </button>
              ))}
            </div>
            <Select
              value={selectedGameMode}
              onChange={setSelectedGameMode}
              options={gameModeOptions}
              className="md:items-end"
            />
          </div>

          <section className="mb-8 box box-shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-foreground">
              Games Played Per Day by Game Mode
            </h2>
            <div className="h-[300px]">
              <Bar data={gamesPerDayData} options={stackedChartOptions} />
            </div>
          </section>

          {selectedGameMode === "all" && (
            <section className="mb-8 box box-shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4 text-foreground">
                Unique Players
              </h2>
              <div className="h-[300px]">
                <Line data={playersPerDayData} options={lineChartOptions} />
              </div>
            </section>
          )}

          <section className="mb-8 box box-shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-2 text-foreground">
              Non-Lonely Games
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              Percentage of games with 2+ human players
            </p>
            <div className="h-[280px]">
              <Line data={nonLonelyGamesData} options={areaChartOptions} />
            </div>
          </section>

          <section className="mb-8 box box-shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-2 text-foreground">
              Game Completion Rate
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              Percentage of started games that were completed
            </p>
            <div className="h-[280px]">
              <Line data={completionRateData} options={areaChartOptions} />
            </div>
          </section>

          <section className="mb-8 box box-shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-foreground">
              Abandoned Games Per Day by Game Mode
            </h2>
            <div className="h-[300px]">
              <Bar data={abandonedGamesData} options={stackedChartOptions} />
            </div>
          </section>

          <section className="mb-8 box box-shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-2 text-foreground">
              Games by Mode
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              Percentage of games by mode
            </p>
            <div className="h-[280px]">
              <Bar
                data={gameTypeDistributionData}
                options={percentageBarChartOptions}
              />
            </div>
          </section>

          <section className="mb-8 box box-shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-2 text-foreground">
              Recent Abandoned Games
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              The ten most recent public abandoned games
            </p>
            {recentAbandonedGames.length === 0 ? (
              <p className="py-6 text-center text-muted-foreground">
                No abandoned games have been archived yet
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[680px] text-left">
                  <thead>
                    <tr className="border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
                      <th className="px-3 py-3">Game Mode</th>
                      <th className="px-3 py-3 text-center">Finished</th>
                      <th className="px-3 py-3">Created</th>
                      <th className="px-3 py-3">Archived</th>
                      <th className="px-3 py-3 text-right">Game</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentAbandonedGames.map((game) => (
                      <tr
                        key={game.gameId}
                        role="link"
                        tabIndex={0}
                        aria-label={`View game ${game.gameId}`}
                        onClick={() => navigate(`/game/${game.gameId}`)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            navigate(`/game/${game.gameId}`);
                          }
                        }}
                        className="cursor-pointer border-b border-border transition-colors last:border-b-0 hover:bg-muted focus-visible:outline-2 focus-visible:outline-accent-primary"
                      >
                        <td className="px-3 py-3 text-foreground">
                          {gameModeLabelByValue.get(game.gameMode.tag) ??
                            game.gameMode.tag}
                        </td>
                        <td className="px-3 py-3 text-center text-muted-foreground">
                          {game.placementCount} / 3
                        </td>
                        <td className="px-3 py-3 text-muted-foreground">
                          {formatGameTimestamp(game.createdAt)}
                        </td>
                        <td className="px-3 py-3 text-muted-foreground">
                          {formatGameTimestamp(game.archivedAt)}
                        </td>
                        <td className="px-3 py-3 text-right font-medium text-accent-primary">
                          View
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
};
