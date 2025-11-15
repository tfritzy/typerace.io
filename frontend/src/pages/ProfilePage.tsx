import { useSpacetimeDB, useTable } from "spacetimedb/react";
import type { DbConnection, Player, GameRecord } from "../../module_bindings";
import { WpmChart } from "../components/WpmChart";
import { useEffect, useMemo } from "react";
import { Header } from "../components/Header";
import Avatar from "boring-avatars";
import { useParams } from "react-router-dom";
import { Identity } from "spacetimedb";
import type { ErrorContextInterface } from "spacetimedb/sdk";

export const ProfilePage = () => {
    const { playerId } = useParams<{ playerId: string }>();
    const conn = useSpacetimeDB<DbConnection>();
    const { rows: players } = useTable<DbConnection, Player>("player");
    const { rows: gameRecords } = useTable<DbConnection, GameRecord>("gamerecord");

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

    const realGameData = useMemo(() => {
        if (!playerIdentity) return [];

        const playerStats = gameRecords.filter(stat =>
            stat.playerId.isEqual(playerIdentity)
        );

        return playerStats.sort((a, b) => {
            if (a.timeMs < b.timeMs) {
                return -1;
            }
            if (a.timeMs > b.timeMs) {
                return 1;
            }
            return 0;
        });
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
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2), 0 1px 3px rgba(0, 0, 0, 0.1)'
                    }}>
                        {viewedPlayer ? (
                            <div>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '24px', marginBottom: '32px' }}>
                                    <div style={{
                                        border: '2px solid #fbbf24',
                                        borderRadius: '50%',
                                        overflow: 'hidden',
                                        flexShrink: 0
                                    }}>
                                        <Avatar
                                            size={80}
                                            name={viewedPlayer.id.toHexString()}
                                            variant="pixel"
                                            colors={["#fbbf24", "#f59e0b", "#d97706", "#b45309", "#92400e"]}
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
                                                    background: 'linear-gradient(to right, #f59e0b, #fbbf24)',
                                                    borderRadius: '5px',
                                                    width: `${(viewedPlayer.xp / ((viewedPlayer.level + 1) * 100)) * 100}%`,
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
                                                    color: '#fbbf24',
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
                        <h2 style={{
                            color: '#ffffff',
                            fontSize: '1.5rem',
                            fontWeight: 700,
                            marginBottom: '24px'
                        }}>
                            Performance History
                        </h2>

                        <WpmChart
                            data={realGameData}
                            title={`${viewedPlayer?.name || 'Player'}'s Games`}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
