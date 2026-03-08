import { type Player, type GameRecord } from "../types/stdb";
import { WpmChart } from "../components/WpmChart";
import { useEffect, useMemo, useState } from "react";
import { Header } from "../components/Header";
import { PlayerAvatar } from "../components/PlayerAvatar";
import { useParams, useNavigate } from "react-router-dom";
import { xpProgressToNextLevel } from "../utils/xpCalculator";
import { getColorConfig } from "../utils/colorMapping";
import { EditNameModal } from "../components/EditNameModal";
import { EditColorModal } from "../components/EditColorModal";
import { getLangHome } from "../utils/modes";
import { formatNumber, formatTimeSpent } from "../utils/formatters";
import { useAuth } from "../firebase/AuthContext";
import { Select } from "../components/Select";
import { RecentGames } from "../components/RecentGames";
import { useDatabase } from "../contexts/SpacetimeContext";
import { type ThemeSettings, applyCustomTheme } from "../utils/themes";

type TimeFrame = 'all' | 'today' | 'week' | 'month' | '3months';

export const ProfilePage = () => {
    const { playerId } = useParams<{ playerId: string }>();
    const conn = useDatabase();
    const [viewedPlayer, setViewedPlayer] = useState<Player | null>(null);
    const [gameRecords, setGameRecords] = useState<GameRecord[]>([]);
    const [selectedMode, setSelectedMode] = useState<string>('all');
    const [selectedTimeFrame, setSelectedTimeFrame] = useState<TimeFrame>('all');
    const [isEditNameModalOpen, setIsEditNameModalOpen] = useState(false);
    const [isEditColorModalOpen, setIsEditColorModalOpen] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isMenuClosing, setIsMenuClosing] = useState(false);
    const { signOut } = useAuth();
    const navigate = useNavigate();

    const isOwnProfile = conn?.identity && viewedPlayer && conn.identity.isEqual(viewedPlayer.identity);

    useEffect(() => {
        if (!conn || !playerId) return;

        const handlePlayerInsert = (_ctx: any, player: Player) => {
            if (player.playerId === playerId) {
                setViewedPlayer(player);
            }
        };

        const handlePlayerUpdate = (_ctx: any, _oldPlayer: Player, newPlayer: Player) => {
            if (newPlayer.playerId === playerId) {
                setViewedPlayer(newPlayer);
            }
        };

        conn.db.player.onInsert(handlePlayerInsert);
        conn.db.player.onUpdate(handlePlayerUpdate);

        const subscription = conn.subscriptionBuilder()
            .onApplied(() => {
                const allPlayers = Array.from(conn.db.player.iter());
                const p = allPlayers.find(player => player.playerId === playerId);
                if (p) setViewedPlayer(p);
            })
            .subscribe([`SELECT * FROM player WHERE PlayerId = '${playerId}'`]);

        return () => {
            conn.db.player.removeOnInsert(handlePlayerInsert);
            conn.db.player.removeOnUpdate(handlePlayerUpdate);
            subscription.unsubscribe();
        };
    }, [conn, playerId]);

    useEffect(() => {
        if (!conn || !playerId) return;

        const handleGameRecordInsert = (_ctx: any, record: GameRecord) => {
            if (record.playerId.toHexString() === playerId) {
                setGameRecords(prev => [...prev, record]);
            }
        };

        conn.db.gamerecord.onInsert(handleGameRecordInsert);

        const subscription = conn.subscriptionBuilder()
            .onApplied(() => {
                const records = Array.from(conn.db.gamerecord.iter());
                setGameRecords(records);
            })
            .subscribe([`SELECT * FROM gamerecord WHERE PlayerId = '${viewedPlayer?.identity}'`]);

        return () => {
            conn.db.gamerecord.removeOnInsert(handleGameRecordInsert);
            subscription.unsubscribe();
        };
    }, [conn, viewedPlayer?.identity]);

    useEffect(() => {
        if (viewedPlayer && viewedPlayer.isAnonymous) {
            navigate(getLangHome());
        }
    }, [viewedPlayer, navigate]);

    const handleNameSave = (name: string) => {
        if (!conn) return;
        conn.reducers.setPlayerName({ name });
        setIsEditNameModalOpen(false);
    };

    const handleColorSave = (color: string, customSettings?: ThemeSettings) => {
        if (!conn) return;
        if (customSettings) {
            applyCustomTheme(customSettings);
            (conn.reducers as any).setPlayerTheme({
                backgroundColor: customSettings.backgroundColor,
                textColor: customSettings.textColor,
                borderColor: customSettings.borderColor,
                borderWidth: customSettings.borderWidth,
                borderRadius: customSettings.borderRadius,
                accentColor: customSettings.accentColor,
                font: customSettings.font,
                fontWeight: customSettings.fontWeight,
            });
        } else {
            conn.reducers.setPlayerColor({ color: { tag: color } as any });
        }
        setIsEditColorModalOpen(false);
    };

    const handleSignOut = async () => {
        try {
            await signOut();
            navigate(getLangHome());
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
        if (!viewedPlayer) return [];

        let playerStats = gameRecords.filter(stat =>
            stat.playerId.isEqual(viewedPlayer.identity)
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
    }, [gameRecords, viewedPlayer, selectedMode, selectedTimeFrame]);

    const availableModes = useMemo(() => {
        if (!viewedPlayer) return [];

        const modesSet = new Set<string>();
        gameRecords
            .filter(stat => stat.playerId.isEqual(viewedPlayer.identity))
            .forEach(stat => modesSet.add(stat.gameMode.tag));

        return Array.from(modesSet).sort();
    }, [gameRecords, viewedPlayer]);

    return (
        <div className="min-h-screen">
            <Header hideAvatar={true} />

            <div className="flex flex-col items-center px-4 pb-12">
                <div className="content-container">
                    <div className="box box-shadow rounded-xl p-8 mb-8 relative">
                        {isOwnProfile && (
                            <div className="absolute top-5 right-5 flex items-center gap-2">
                                <div className="relative">
                                    <button
                                        onClick={handleMenuToggle}
                                        className="bg-transparent border-0 text-muted-foreground cursor-pointer p-2 hover:text-foreground/70 transition-colors"
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
                                                className="absolute right-0 top-full mt-2 bg-card border border-border rounded-lg shadow-lg p-2 min-w-40 z-20"
                                                style={{
                                                    animation: isMenuClosing ? 'menuSlideOut 0.15s ease-out' : 'menuSlideIn 0.15s ease-out'
                                                }}
                                            >
                                                <button
                                                    onClick={() => {
                                                        setIsEditColorModalOpen(true);
                                                        handleMenuClose();
                                                    }}
                                                    className="w-full text-left px-3 py-2 text-foreground text-sm hover:bg-secondary transition-colors bg-transparent border-0 cursor-pointer rounded-md"
                                                >
                                                    Change Theme
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        handleSignOut();
                                                        handleMenuClose();
                                                    }}
                                                    className="w-full text-left px-3 py-2 text-destructive text-sm hover:bg-secondary transition-colors bg-transparent border-0 cursor-pointer rounded-md"
                                                >
                                                    Sign Out
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}
                        {viewedPlayer && (
                            <>
                                <div className="flex items-start gap-6 mb-6">
                                    <PlayerAvatar
                                        size={80}
                                        identity={viewedPlayer.identity.toHexString()}
                                        color={viewedPlayer.color}
                                        isHighlighted={true}
                                    />

                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-3">
                                            <h1 className="text-foreground text-3xl font-bold m-0">
                                                {viewedPlayer.name}
                                            </h1>
                                            {isOwnProfile && (
                                                <button
                                                    onClick={() => setIsEditNameModalOpen(true)}
                                                    className="bg-transparent border-0 text-muted-foreground cursor-pointer p-1 hover:text-foreground/70 transition-colors"
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
                                            <span className="text-muted-foreground text-sm font-medium">
                                                Level {viewedPlayer.level}
                                            </span>
                                            <div className="flex-1 h-2.5 bg-secondary rounded-[5px] overflow-hidden">
                                                <div
                                                    className="h-full rounded-[5px] transition-[width_0.3s_ease]"
                                                    style={{
                                                        background: viewedPlayer ? getColorConfig(viewedPlayer.color).gradient : 'var(--accent-primary)',
                                                        width: `${viewedPlayer ? xpProgressToNextLevel(viewedPlayer.xp, viewedPlayer.xpRequiredForNextLevel) : 0}%`
                                                    }}
                                                />
                                            </div>
                                            <span className="text-muted-foreground text-sm font-mono">
                                                {viewedPlayer.xp}/{viewedPlayer.xpRequiredForNextLevel}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mt-8">
                                    <div className="bg-black/5 border border-border rounded-lg p-5">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <div className="text-muted-foreground text-xs mb-2 uppercase tracking-wider font-semibold">
                                                    Games Played
                                                </div>
                                                <div className="text-foreground text-3xl font-bold">
                                                    {viewedPlayer.totalGames}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-muted-foreground text-xs mb-2 uppercase tracking-wider font-semibold">
                                                    Wins
                                                </div>
                                                <div className="text-foreground text-3xl font-bold">
                                                    {viewedPlayer.wins}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-black/5 border border-border rounded-lg p-5">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <div className="text-muted-foreground text-xs mb-2 uppercase tracking-wider font-semibold">
                                                    Words Typed
                                                </div>
                                                <div className="text-foreground text-3xl font-bold">
                                                    {formatNumber(viewedPlayer.totalWordsTyped)}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-muted-foreground text-xs mb-2 uppercase tracking-wider font-semibold">
                                                    Time Spent
                                                </div>
                                                <div className="text-foreground text-3xl font-bold">
                                                    {formatTimeSpent(Number(viewedPlayer.totalTimeSpentMs))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    <div>
                        <div className="flex flex-wrap justify-between items-center gap-y-3 mb-6">
                            <h2 className="text-foreground text-2xl font-bold m-0">
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

                        <WpmChart
                            data={realGameData}
                        />
                    </div>

                    <div className="mt-8">
                        <h2 className="text-foreground text-2xl font-bold mb-6">
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
        </div>

    );
};
