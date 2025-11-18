import { useSpacetimeDB, useTable } from "spacetimedb/react";
import type { DbConnection, Player, GameRecord, PlayerColor } from "../../module_bindings";
import { WpmChart } from "../components/WpmChart";
import { useEffect, useMemo, useState } from "react";
import { Header } from "../components/Header";
import { PlayerAvatar } from "../components/PlayerAvatar";
import { useParams } from "react-router-dom";
import { Identity } from "spacetimedb";
import type { ErrorContextInterface } from "spacetimedb/sdk";
import { xpProgressToNextLevel } from "../utils/xpCalculator";
import { getColorConfig } from "../utils/colorMapping";
import { EditProfileModal } from "../components/EditProfileModal";

type TimeFrame = 'all' | 'today' | 'week' | 'month' | '3months';

export const ProfilePage = () => {
    const { playerId } = useParams<{ playerId: string }>();
    const conn = useSpacetimeDB<DbConnection>();
    const { rows: players } = useTable<DbConnection, Player>("player");
    const { rows: gameRecords } = useTable<DbConnection, GameRecord>("gamerecord");
    const [selectedMode, setSelectedMode] = useState<string>('all');
    const [selectedTimeFrame, setSelectedTimeFrame] = useState<TimeFrame>('all');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    useEffect(() => {
        if (!conn || !playerId) return;

        const playerIdentity = Identity.fromString(playerId);

        const playerSubscription = conn.subscriptionBuilder()
            .onError((error: ErrorContextInterface) => {
                console.error("Error subscribing to player:", error);
            })
            .subscribe(`select * from player where Id = '${playerIdentity}'`);

        const gameRecordSubscription = conn.subscriptionBuilder()
            .onError((error: ErrorContextInterface) => {
                console.error("Error subscribing to gamerecord:", error);
            })
            .subscribe(`select * from gamerecord where PlayerId = '${playerIdentity}'`);

        return () => {
            playerSubscription.unsubscribe();
            gameRecordSubscription.unsubscribe();
        };
    }, [conn, playerId]);

    const playerIdentity = playerId ? Identity.fromString(playerId) : null;
    const viewedPlayer = playerIdentity ? players.find(p => p.id.isEqual(playerIdentity)) : null;
    const isOwnProfile = conn?.identity && viewedPlayer && conn.identity.isEqual(viewedPlayer.id);

    const handleProfileSave = (name: string, color: PlayerColor['tag']) => {
        if (!conn) return;
        if (name !== viewedPlayer?.name) {
            conn.reducers.setPlayerName(name);
        }
        if (color !== viewedPlayer?.color.tag) {
            conn.reducers.setPlayerColor({ tag: color });
        }
    };

    const getTimeFrameFilter = (timeFrame: TimeFrame): number => {
        const now = Date.now() * 1000;
        switch (timeFrame) {
            case 'today':
                const startOfDay = new Date();
                startOfDay.setHours(0, 0, 0, 0);
                return startOfDay.getTime() * 1000;
            case 'week':
                return now - (7 * 24 * 60 * 60 * 1000 * 1000);
            case 'month':
                return now - (30 * 24 * 60 * 60 * 1000 * 1000);
            case '3months':
                return now - (90 * 24 * 60 * 60 * 1000 * 1000);
            default:
                return 0;
        }
    };

    const realGameData = useMemo(() => {
        if (!playerIdentity) return [];

        let playerStats = gameRecords.filter(stat =>
            stat.playerId.isEqual(playerIdentity)
        );

        if (selectedMode !== 'all') {
            playerStats = playerStats.filter(stat => stat.gameMode.tag === selectedMode);
        }

        if (selectedTimeFrame !== 'all') {
            const cutoffTime = getTimeFrameFilter(selectedTimeFrame);
            playerStats = playerStats.filter(stat => stat.date >= cutoffTime);
        }

        return playerStats.sort((a, b) => {
            if (a.timeMs < b.timeMs) {
                return -1;
            }
            if (a.timeMs > b.timeMs) {
                return 1;
            }
            return 0;
        });
    }, [gameRecords, playerIdentity, selectedMode, selectedTimeFrame]);

    const availableModes = useMemo(() => {
        if (!playerIdentity) return [];

        const modesSet = new Set<string>();
        gameRecords
            .filter(stat => stat.playerId.isEqual(playerIdentity))
            .forEach(stat => modesSet.add(stat.gameMode.tag));

        return Array.from(modesSet).sort();
    }, [gameRecords, playerIdentity]);

    return (
        <div className="min-h-screen">
            <Header hideAvatar={true} />

            <div className="flex flex-col items-center px-4 pb-12">
                <div className="content-container">
                    <div className="bg-[#272727] border border-white/15 rounded-lg p-8 mb-8 shadow-[0_4px_12px_rgba(0,0,0,0.2),0_1px_3px_rgba(0,0,0,0.1)] relative">
                        {isOwnProfile && (
                            <button
                                onClick={() => setIsEditModalOpen(true)}
                                className="absolute top-5 right-5 bg-transparent border-0 text-white/50 cursor-pointer text-xl p-2"
                                title="Edit Profile"
                            >
                                ✏️
                            </button>
                        )}
                        {viewedPlayer ? (
                            <div>
                                <div className="flex items-start gap-6 mb-8">
                                    <PlayerAvatar
                                        size={80}
                                        identity={viewedPlayer.id.toHexString()}
                                        color={viewedPlayer.color}
                                        isHighlighted={true}
                                    />

                                    <div className="flex-1">
                                        <h1 className="text-white text-3xl font-bold mb-3">
                                            {viewedPlayer.name}
                                        </h1>

                                        <div className="flex items-center gap-3">
                                            <span className="text-white/60 text-sm font-medium">
                                                Level {viewedPlayer.level}
                                            </span>
                                            <div className="flex-1 h-2.5 bg-white/10 rounded-[5px] overflow-hidden">
                                                <div
                                                    className="h-full rounded-[5px] transition-[width_0.3s_ease]"
                                                    style={{
                                                        background: viewedPlayer ? getColorConfig(viewedPlayer.color).gradient : 'var(--color-accent)',
                                                        width: `${viewedPlayer ? xpProgressToNextLevel(viewedPlayer.xp, viewedPlayer.level) : 0}%`
                                                    }}
                                                />
                                            </div>
                                            <span className="text-white/60 text-sm font-medium">
                                                Level {viewedPlayer.level + 1}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-white/[0.03] rounded-lg p-5 border border-white/[0.06]">
                                        <div className="text-white/50 text-[0.8125rem] mb-3 uppercase tracking-wider font-semibold">
                                            Career Stats
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <div className="text-white/60 text-[0.8125rem] mb-1.5">
                                                    Games Played
                                                </div>
                                                <div className="text-white text-2xl font-bold">
                                                    {viewedPlayer.totalGames}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-white/60 text-[0.8125rem] mb-1.5">
                                                    Wins
                                                </div>
                                                <div className="text-white text-2xl font-bold">
                                                    {viewedPlayer.wins}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white/[0.03] rounded-lg p-5 border border-white/[0.06]">
                                        <div className="text-white/50 text-[0.8125rem] mb-3 uppercase tracking-wider font-semibold">
                                            Performance
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <div className="text-white/60 text-[0.8125rem] mb-1.5">
                                                    Highest WPM
                                                </div>
                                                <div className="text-2xl font-bold" style={{ color: 'var(--color-accent)' }}>
                                                    127
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-white/60 text-[0.8125rem] mb-1.5">
                                                    Words Typed
                                                </div>
                                                <div className="text-white text-2xl font-bold">
                                                    8,432
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-white/60 text-center p-6">
                                No player data found
                            </div>
                        )}
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-white text-2xl font-bold m-0">
                                Performance History
                            </h2>

                            <div className="flex gap-3 items-center">
                                <div className="flex flex-col gap-1">
                                    <label className="text-white/60 text-xs font-medium">
                                        Mode
                                    </label>
                                    <select
                                        value={selectedMode}
                                        onChange={(e) => setSelectedMode(e.target.value)}
                                        className="bg-[#1a1a1a] text-white border border-white/15 rounded-md px-3 py-2 text-sm cursor-pointer outline-none min-w-[150px]"
                                    >
                                        <option value="all">All Modes</option>
                                        {availableModes.map(mode => (
                                            <option key={mode} value={mode}>
                                                {mode.replace(/(\d+)/, ' $1')}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex flex-col gap-1">
                                    <label className="text-white/60 text-xs font-medium">
                                        Time Frame
                                    </label>
                                    <select
                                        value={selectedTimeFrame}
                                        onChange={(e) => setSelectedTimeFrame(e.target.value as TimeFrame)}
                                        className="bg-[#1a1a1a] text-white border border-white/15 rounded-md px-3 py-2 text-sm cursor-pointer outline-none min-w-[150px]"
                                    >
                                        <option value="all">All Time</option>
                                        <option value="today">Today</option>
                                        <option value="week">Last Week</option>
                                        <option value="month">Last Month</option>
                                        <option value="3months">Last 3 Months</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <WpmChart
                            data={realGameData}
                            title={`${viewedPlayer?.name || 'Player'}'s Games`}
                        />
                    </div>
                </div>
            </div>

            {isEditModalOpen && viewedPlayer && (
                <EditProfileModal
                    currentName={viewedPlayer.name}
                    currentColor={viewedPlayer.color.tag}
                    onSave={handleProfileSave}
                    onClose={() => setIsEditModalOpen(false)}
                />
            )}
        </div>
    );
};
