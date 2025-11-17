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
                    <div style={{
                        backgroundColor: '#272727',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        borderRadius: '8px',
                        padding: '32px',
                        marginBottom: '32px',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2), 0 1px 3px rgba(0, 0, 0, 0.1)',
                        position: 'relative'
                    }}>
                        {isOwnProfile && (
                            <button
                                onClick={() => setIsEditModalOpen(true)}
                                style={{
                                    position: 'absolute',
                                    top: '20px',
                                    right: '20px',
                                    backgroundColor: 'transparent',
                                    border: 'none',
                                    color: 'rgba(255, 255, 255, 0.5)',
                                    cursor: 'pointer',
                                    fontSize: '1.25rem',
                                    padding: '8px'
                                }}
                                title="Edit Profile"
                            >
                                ✏️
                            </button>
                        )}
                        {viewedPlayer ? (
                            <div>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '24px', marginBottom: '32px' }}>
                                    <div style={{
                                        border: '2px solid var(--color-accent)',
                                        borderRadius: '50%',
                                        overflow: 'hidden',
                                        flexShrink: 0
                                    }}>
                                        <PlayerAvatar
                                            size={80}
                                            identity={viewedPlayer.id.toHexString()}
                                            color={viewedPlayer.color}
                                        />
                                    </div>

                                    <div style={{ flex: 1 }}>
                                        <h1 style={{
                                            color: '#ffffff',
                                            fontSize: '1.875rem',
                                            fontWeight: 700,
                                            marginBottom: '12px'
                                        }}>
                                            {viewedPlayer.name}
                                        </h1>

                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px'
                                        }}>
                                            <span style={{
                                                color: 'rgba(255, 255, 255, 0.6)',
                                                fontSize: '0.875rem',
                                                fontWeight: 500
                                            }}>
                                                Level {viewedPlayer.level}
                                            </span>
                                            <div style={{
                                                flex: 1,
                                                height: '10px',
                                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                                borderRadius: '5px',
                                                overflow: 'hidden'
                                            }}>
                                                <div style={{
                                                    height: '100%',
                                                    background: viewedPlayer ? getColorConfig(viewedPlayer.color).gradient : 'var(--color-accent)',
                                                    borderRadius: '5px',
                                                    width: `${viewedPlayer ? xpProgressToNextLevel(viewedPlayer.xp, viewedPlayer.level) : 0}%`,
                                                    transition: 'width 0.3s ease'
                                                }} />
                                            </div>
                                            <span style={{
                                                color: 'rgba(255, 255, 255, 0.6)',
                                                fontSize: '0.875rem',
                                                fontWeight: 500
                                            }}>
                                                Level {viewedPlayer.level + 1}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(2, 1fr)',
                                    gap: '16px'
                                }}>
                                    <div style={{
                                        backgroundColor: 'rgba(255, 255, 255, 0.03)',
                                        borderRadius: '8px',
                                        padding: '20px',
                                        border: '1px solid rgba(255, 255, 255, 0.06)'
                                    }}>
                                        <div style={{
                                            color: 'rgba(255, 255, 255, 0.5)',
                                            fontSize: '0.8125rem',
                                            marginBottom: '12px',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.05em',
                                            fontWeight: 600
                                        }}>
                                            Career Stats
                                        </div>
                                        <div style={{
                                            display: 'grid',
                                            gridTemplateColumns: 'repeat(2, 1fr)',
                                            gap: '16px'
                                        }}>
                                            <div>
                                                <div style={{
                                                    color: 'rgba(255, 255, 255, 0.6)',
                                                    fontSize: '0.8125rem',
                                                    marginBottom: '6px'
                                                }}>
                                                    Games Played
                                                </div>
                                                <div style={{
                                                    color: '#ffffff',
                                                    fontSize: '1.5rem',
                                                    fontWeight: 700
                                                }}>
                                                    {viewedPlayer.totalGames}
                                                </div>
                                            </div>
                                            <div>
                                                <div style={{
                                                    color: 'rgba(255, 255, 255, 0.6)',
                                                    fontSize: '0.8125rem',
                                                    marginBottom: '6px'
                                                }}>
                                                    Wins
                                                </div>
                                                <div style={{
                                                    color: '#ffffff',
                                                    fontSize: '1.5rem',
                                                    fontWeight: 700
                                                }}>
                                                    {viewedPlayer.wins}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{
                                        backgroundColor: 'rgba(255, 255, 255, 0.03)',
                                        borderRadius: '8px',
                                        padding: '20px',
                                        border: '1px solid rgba(255, 255, 255, 0.06)'
                                    }}>
                                        <div style={{
                                            color: 'rgba(255, 255, 255, 0.5)',
                                            fontSize: '0.8125rem',
                                            marginBottom: '12px',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.05em',
                                            fontWeight: 600
                                        }}>
                                            Performance
                                        </div>
                                        <div style={{
                                            display: 'grid',
                                            gridTemplateColumns: 'repeat(2, 1fr)',
                                            gap: '16px'
                                        }}>
                                            <div>
                                                <div style={{
                                                    color: 'rgba(255, 255, 255, 0.6)',
                                                    fontSize: '0.8125rem',
                                                    marginBottom: '6px'
                                                }}>
                                                    Highest WPM
                                                </div>
                                                <div style={{
                                                    color: 'var(--color-accent)',
                                                    fontSize: '1.5rem',
                                                    fontWeight: 700
                                                }}>
                                                    127
                                                </div>
                                            </div>
                                            <div>
                                                <div style={{
                                                    color: 'rgba(255, 255, 255, 0.6)',
                                                    fontSize: '0.8125rem',
                                                    marginBottom: '6px'
                                                }}>
                                                    Words Typed
                                                </div>
                                                <div style={{
                                                    color: '#ffffff',
                                                    fontSize: '1.5rem',
                                                    fontWeight: 700
                                                }}>
                                                    8,432
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div style={{
                                color: 'rgba(255, 255, 255, 0.6)',
                                textAlign: 'center',
                                padding: '24px'
                            }}>
                                No player data found
                            </div>
                        )}
                    </div>

                    <div>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '24px'
                        }}>
                            <h2 style={{
                                color: '#ffffff',
                                fontSize: '1.5rem',
                                fontWeight: 700,
                                margin: 0
                            }}>
                                Performance History
                            </h2>

                            <div style={{
                                display: 'flex',
                                gap: '12px',
                                alignItems: 'center'
                            }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <label style={{
                                        color: 'rgba(255, 255, 255, 0.6)',
                                        fontSize: '0.75rem',
                                        fontWeight: 500
                                    }}>
                                        Mode
                                    </label>
                                    <select
                                        value={selectedMode}
                                        onChange={(e) => setSelectedMode(e.target.value)}
                                        style={{
                                            backgroundColor: '#1a1a1a',
                                            color: '#ffffff',
                                            border: '1px solid rgba(255, 255, 255, 0.15)',
                                            borderRadius: '6px',
                                            padding: '8px 12px',
                                            fontSize: '0.875rem',
                                            cursor: 'pointer',
                                            outline: 'none',
                                            minWidth: '150px'
                                        }}
                                    >
                                        <option value="all">All Modes</option>
                                        {availableModes.map(mode => (
                                            <option key={mode} value={mode}>
                                                {mode.replace(/(\d+)/, ' $1')}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <label style={{
                                        color: 'rgba(255, 255, 255, 0.6)',
                                        fontSize: '0.75rem',
                                        fontWeight: 500
                                    }}>
                                        Time Frame
                                    </label>
                                    <select
                                        value={selectedTimeFrame}
                                        onChange={(e) => setSelectedTimeFrame(e.target.value as TimeFrame)}
                                        style={{
                                            backgroundColor: '#1a1a1a',
                                            color: '#ffffff',
                                            border: '1px solid rgba(255, 255, 255, 0.15)',
                                            borderRadius: '6px',
                                            padding: '8px 12px',
                                            fontSize: '0.875rem',
                                            cursor: 'pointer',
                                            outline: 'none',
                                            minWidth: '150px'
                                        }}
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
