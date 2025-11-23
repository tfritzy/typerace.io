import { useSpacetimeDB, useTable } from "spacetimedb/react";
import type { DbConnection, Player, GameRecord, PlayerColor } from "../../module_bindings";
import { WpmChart } from "../components/WpmChart";
import { useEffect, useMemo, useState } from "react";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { PlayerAvatar } from "../components/PlayerAvatar";
import { useParams, useNavigate } from "react-router-dom";
import { Identity } from "spacetimedb";
import type { ErrorContextInterface } from "spacetimedb/sdk";
import { xpProgressToNextLevel } from "../utils/xpCalculator";
import { getColorConfig } from "../utils/colorMapping";
import { EditNameModal } from "../components/EditNameModal";
import { EditColorModal } from "../components/EditColorModal";
import { formatNumber } from "../utils/formatters";
import { useAuth } from "../firebase/AuthContext";
import { Select } from "../components/Select";
import { RecentGames } from "../components/RecentGames";

type TimeFrame = 'all' | 'today' | 'week' | 'month' | '3months';

export const ProfilePage = () => {
    const { playerId } = useParams<{ playerId: string }>();
    const conn = useSpacetimeDB<DbConnection>();
    const { rows: players } = useTable<DbConnection, Player>("player");
    const { rows: gameRecords } = useTable<DbConnection, GameRecord>("gamerecord");
    const [selectedMode, setSelectedMode] = useState<string>('all');
    const [selectedTimeFrame, setSelectedTimeFrame] = useState<TimeFrame>('all');
    const [isEditNameModalOpen, setIsEditNameModalOpen] = useState(false);
    const [isEditColorModalOpen, setIsEditColorModalOpen] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isMenuClosing, setIsMenuClosing] = useState(false);
    const { signOut } = useAuth();
    const navigate = useNavigate();

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

        const personalRecordSubscription = conn.subscriptionBuilder()
            .onError((error: ErrorContextInterface) => {
                console.error("Error subscribing to personalrecord:", error);
            })
            .subscribe(`select * from personalrecord where PlayerId = '${playerIdentity}'`);

        return () => {
            playerSubscription.unsubscribe();
            gameRecordSubscription.unsubscribe();
            personalRecordSubscription.unsubscribe();
        };
    }, [conn, playerId]);

    const playerIdentity = playerId ? Identity.fromString(playerId) : null;
    const viewedPlayer = playerIdentity ? players.find(p => p.id.isEqual(playerIdentity)) : null;
    const isOwnProfile = conn?.identity && viewedPlayer && conn.identity.isEqual(viewedPlayer.id);

    useEffect(() => {
        if (viewedPlayer && viewedPlayer.isAnonymous) {
            navigate('/');
        }
    }, [viewedPlayer, navigate]);

    const handleNameSave = (name: string) => {
        if (!conn) return;
        conn.reducers.setPlayerName(name);
    };

    const handleColorSave = (color: PlayerColor['tag']) => {
        if (!conn) return;
        conn.reducers.setPlayerColor({ tag: color });
    };

    const handleSignOut = async () => {
        try {
            await signOut();
            navigate('/');
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    const handleMenuToggle = () => {
        if (isMenuOpen) {
            setIsMenuClosing(true);
            setTimeout(() => {
                setIsMenuOpen(false);
                setIsMenuClosing(false);
            }, 150);
        } else {
            setIsMenuOpen(true);
        }
    };

    const handleMenuClose = () => {
        setIsMenuClosing(true);
        setTimeout(() => {
            setIsMenuOpen(false);
            setIsMenuClosing(false);
        }, 150);
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
                    <div className="box box-shadow rounded-tl-xl rounded-tr-xl rounded-bl-sm rounded-br-sm p-8 mb-3 relative border-b-0">
                        {isOwnProfile && (
                            <div className="absolute top-5 right-5 flex items-center gap-2">
                                <div className="relative">
                                    <button
                                        onClick={handleMenuToggle}
                                        className="bg-transparent border-0 text-white/50 cursor-pointer p-2 hover:text-white/70 transition-colors"
                                        title="Options"
                                    >
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <circle cx="12" cy="12" r="1" />
                                            <circle cx="12" cy="5" r="1" />
                                            <circle cx="12" cy="19" r="1" />
                                        </svg>
                                    </button>
                                    {isMenuOpen && (
                                        <>
                                            <div
                                                className="fixed inset-0 z-10"
                                                onClick={handleMenuClose}
                                            />
                                            <div
                                                className="absolute right-0 top-full mt-2 bg-[#272727] border border-white/15 rounded-lg shadow-lg p-2 min-w-40 z-20"
                                                style={{
                                                    animation: isMenuClosing ? 'menuSlideOut 0.15s ease-out' : 'menuSlideIn 0.15s ease-out'
                                                }}
                                            >
                                                <button
                                                    onClick={() => {
                                                        setIsEditColorModalOpen(true);
                                                        handleMenuClose();
                                                    }}
                                                    className="w-full text-left px-3 py-2 text-white text-sm hover:bg-white/10 transition-colors bg-transparent border-0 cursor-pointer rounded-md"
                                                >
                                                    Change Color
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        handleSignOut();
                                                        handleMenuClose();
                                                    }}
                                                    className="w-full text-left px-3 py-2 text-red-400 text-sm hover:bg-white/10 transition-colors bg-transparent border-0 cursor-pointer rounded-md"
                                                >
                                                    Sign Out
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}
                        {viewedPlayer ? (
                            <div className="flex items-start gap-6">
                                <PlayerAvatar
                                    size={80}
                                    identity={viewedPlayer.id.toHexString()}
                                    color={viewedPlayer.color}
                                    isHighlighted={true}
                                />

                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-3">
                                        <h1 className="text-white text-3xl font-bold m-0">
                                            {viewedPlayer.name}
                                        </h1>
                                        {isOwnProfile && (
                                            <button
                                                onClick={() => setIsEditNameModalOpen(true)}
                                                className="bg-transparent border-0 text-white/50 cursor-pointer p-1 hover:text-white/70 transition-colors"
                                                title="Edit Name"
                                            >
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                                </svg>
                                            </button>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <span className="text-white/60 text-sm font-medium">
                                            Level {viewedPlayer.level}
                                        </span>
                                        <div className="flex-1 h-2.5 bg-white/10 rounded-[5px] overflow-hidden">
                                            <div
                                                className="h-full rounded-[5px] transition-[width_0.3s_ease]"
                                                style={{
                                                    background: viewedPlayer ? getColorConfig(viewedPlayer.color).gradient : 'var(--color-accent)',
                                                    width: `${viewedPlayer ? xpProgressToNextLevel(viewedPlayer.xp, viewedPlayer.xpRequiredForNextLevel) : 0}%`
                                                }}
                                            />
                                        </div>
                                        <span className="text-white/60 text-sm font-medium">
                                            Level {viewedPlayer.level + 1}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-white/60 text-center p-6">
                                No player data found
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-3 gap-3 mb-8">
                        <div className="box box-shadow rounded-bl-xl rounded-tl-sm rounded-tr-sm rounded-br-sm p-6">
                            <div className="text-white/50 text-xs mb-2 uppercase tracking-wider font-semibold">
                                Games Played
                            </div>
                            <div className="text-white text-3xl font-bold">
                                {viewedPlayer?.totalGames || 0}
                            </div>
                        </div>
                        <div className="box box-shadow rounded-sm p-6">
                            <div className="text-white/50 text-xs mb-2 uppercase tracking-wider font-semibold">
                                Wins
                            </div>
                            <div className="text-white text-3xl font-bold">
                                {viewedPlayer?.wins || 0}
                            </div>
                        </div>
                        <div className="box box-shadow rounded-br-xl rounded-tl-sm rounded-tr-sm rounded-bl-sm p-6">
                            <div className="text-white/50 text-xs mb-2 uppercase tracking-wider font-semibold">
                                Words Typed
                            </div>
                            <div className="text-white text-3xl font-bold">
                                {viewedPlayer ? formatNumber(viewedPlayer.totalWordsTyped) : 0}
                            </div>
                        </div>
                    </div>

                    <div>
                        <div className="overflow-x-auto mb-6">
                            <div className="flex justify-between items-center min-w-max">
                                <h2 className="text-white text-2xl font-bold m-0 mr-3">
                                    Performance History
                                </h2>

                                <div className="flex gap-3 items-center">
                                    <Select
                                        label="Mode"
                                        value={selectedMode}
                                        onChange={setSelectedMode}
                                        options={[
                                            { value: 'all', label: 'All Modes' },
                                            ...availableModes.map(mode => ({
                                                value: mode,
                                                label: mode.replace(/(\d+)/, ' $1')
                                            }))
                                        ]}
                                    />

                                    <Select
                                        label="Time Frame"
                                        value={selectedTimeFrame}
                                        onChange={(value) => setSelectedTimeFrame(value as TimeFrame)}
                                        options={[
                                            { value: 'all', label: 'All Time' },
                                            { value: 'today', label: 'Today' },
                                            { value: 'week', label: 'Last Week' },
                                            { value: 'month', label: 'Last Month' },
                                            { value: '3months', label: 'Last 3 Months' }
                                        ]}
                                    />
                                </div>
                            </div>
                        </div>

                        <WpmChart
                            data={realGameData}
                        />
                    </div>

                    <div className="mt-8">
                        <h2 className="text-white text-2xl font-bold mb-6">
                            Recent Games
                        </h2>
                        <RecentGames gameRecords={realGameData} />
                    </div>
                </div>
            </div>

            {isEditNameModalOpen && viewedPlayer && (
                <EditNameModal
                    currentName={viewedPlayer.name}
                    onSave={handleNameSave}
                    onClose={() => setIsEditNameModalOpen(false)}
                />
            )}

            {isEditColorModalOpen && viewedPlayer && (
                <EditColorModal
                    currentColor={viewedPlayer.color.tag}
                    onSave={handleColorSave}
                    onClose={() => setIsEditColorModalOpen(false)}
                />
            )}
            <Footer />
        </div>
    );
};
