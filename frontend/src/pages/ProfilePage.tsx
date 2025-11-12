import { useSpacetimeDB, useTable } from "spacetimedb/react";
import type { DbConnection, Player } from "../../module_bindings";

export const ProfilePage = () => {
    const conn = useSpacetimeDB<DbConnection>();
    const { rows: players } = useTable<DbConnection, Player>("player");

    const myPlayer = players.find(p => p.id.isEqual(conn?.identity!));

    return (
        <div className="text-white" style={{ padding: "20px", fontFamily: "monospace" }}>
            <h1>Profile</h1>
            {myPlayer ? (
                <div style={{ marginTop: "20px", border: "1px solid #ccc", padding: "10px" }}>
                    <div>ID: {myPlayer.id.toHexString()}</div>
                    <div>Name: {myPlayer.name}</div>
                    <div>Level: {myPlayer.level}</div>
                    <div>Xp: {myPlayer.xp}</div>
                    <div>Games: {myPlayer.totalGames}</div>
                    <div>Wins: {myPlayer.wins}</div>
                </div>
            ) : (
                <div>No player data found</div>
            )}
        </div>
    );
};
