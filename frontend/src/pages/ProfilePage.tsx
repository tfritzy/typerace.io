import { useEffect } from "react";
import { useSpacetimeDB, useTable } from "spacetimedb/react";
import type { DbConnection, Player, PlayerStats, ErrorContextInterface } from "../../module_bindings";
import { WpmChart } from "../components/WpmChart";
import { Header } from "../components/Header";

export const ProfilePage = () => {
    const conn = useSpacetimeDB<DbConnection>();
    const { rows: players } = useTable<DbConnection, Player>("player");
    const { rows: playerStats } = useTable<DbConnection, PlayerStats>("playerstats");

    const myPlayer = conn?.identity ? players.find(p => p.id.isEqual(conn.identity)) : undefined;

    useEffect(() => {
        if (!conn || !conn.identity) return;

        const statsSubscription = conn.subscriptionBuilder()
            .onError((error: ErrorContextInterface) => {
                console.error("Error subscribing to playerstats:", error);
            })
            .subscribe(`select * from playerstats where PlayerId = '${conn.identity}'`);

        return () => {
            statsSubscription.unsubscribe();
        };
    }, [conn]);

    const myStats = conn?.identity ? playerStats.filter(s => s.playerId.isEqual(conn.identity)) : [];
    const allGames = myStats.flatMap(s => s.games || []);

    return (
        <div className="relative min-h-screen">
            <Header />
            <div className="flex items-center justify-center min-h-screen p-4">
                <div className="content-container" style={{ maxWidth: "1200px", width: "100%" }}>
                    <div style={{ padding: "20px" }}>
                        <h1 style={{ 
                            color: "var(--color-text-primary)", 
                            fontSize: "2rem", 
                            marginBottom: "30px",
                            fontWeight: 700
                        }}>
                            Profile
                        </h1>
                        {myPlayer ? (
                            <>
                                <div style={{ 
                                    marginBottom: "30px",
                                    backgroundColor: "var(--color-surface-elevated)",
                                    border: "1px solid var(--color-border-subtle)",
                                    borderRadius: "8px",
                                    padding: "20px",
                                    boxShadow: "var(--shadow-elevated-surface)"
                                }}>
                                    <div style={{ 
                                        display: "grid", 
                                        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                                        gap: "15px",
                                        color: "var(--color-text-primary)"
                                    }}>
                                        <div>
                                            <div style={{ color: "var(--color-text-secondary)", fontSize: "0.9rem" }}>Name</div>
                                            <div style={{ fontSize: "1.1rem", fontWeight: 600 }}>{myPlayer.name}</div>
                                        </div>
                                        <div>
                                            <div style={{ color: "var(--color-text-secondary)", fontSize: "0.9rem" }}>Level</div>
                                            <div style={{ fontSize: "1.1rem", fontWeight: 600 }}>{myPlayer.level}</div>
                                        </div>
                                        <div>
                                            <div style={{ color: "var(--color-text-secondary)", fontSize: "0.9rem" }}>XP</div>
                                            <div style={{ fontSize: "1.1rem", fontWeight: 600 }}>{myPlayer.xp}</div>
                                        </div>
                                        <div>
                                            <div style={{ color: "var(--color-text-secondary)", fontSize: "0.9rem" }}>Games</div>
                                            <div style={{ fontSize: "1.1rem", fontWeight: 600 }}>{myPlayer.totalGames}</div>
                                        </div>
                                        <div>
                                            <div style={{ color: "var(--color-text-secondary)", fontSize: "0.9rem" }}>Wins</div>
                                            <div style={{ fontSize: "1.1rem", fontWeight: 600 }}>{myPlayer.wins}</div>
                                        </div>
                                    </div>
                                </div>

                                <WpmChart games={allGames} />
                            </>
                        ) : (
                            <div style={{ color: "var(--color-text-secondary)" }}>No player data found</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
