import { useNavigate } from "react-router-dom";
import { useSpacetimeDB, useTable } from "spacetimedb/react";
import type { DbConnection, Player } from "../../module_bindings";
import Avatar from "boring-avatars";

export const ProfileAvatar = () => {
    const navigate = useNavigate();
    const conn = useSpacetimeDB<DbConnection>();
    const { rows: players } = useTable<DbConnection, Player>(
        "player"
    );

    const myPlayer = conn?.identity
        ? players.find((p) => p.id.isEqual(conn.identity!))
        : null;

    const name = myPlayer?.name ?? "Guest";
    const level = myPlayer?.level ?? 1;
    const currentXP = myPlayer?.xp ?? 0;
    const xpForNextLevel = (level + 1) * 100;
    const xpProgress = (currentXP / xpForNextLevel) * 100;

    const identityHash = conn?.identity?.toHexString() ?? "default";

    return (
        <button
            onClick={() => navigate("/profile")}
            className="flex items-center gap-4 p-3 rounded-lg bg-[#2a2a2a] border border-white/15 hover:bg-[#333333] transition-all duration-200 shadow-[0_2px_8px_rgba(0,0,0,0.2)]"
        >
            <div className="relative shrink-0 border-2 border-amber-400 rounded-full">
                <Avatar
                    size={40}
                    name={identityHash}
                    variant="pixel"
                    colors={["#fbbf24", "#f59e0b", "#d97706", "#b45309", "#92400e"]}
                />
            </div>

            <div className="flex flex-col items-start gap-1 min-w-50">
                <div className="text-sm font-semibold text-white">{name}</div>
                <div className="flex items-center gap-2 w-full">
                    <span className="text-xs font-medium text-white/60">Lvl {level}</span>
                    <div className="flex-1 h-2.5 bg-white/10 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-linear-to-r from-amber-500 to-amber-400 rounded-full transition-all duration-300"
                            style={{ width: `${xpProgress}%` }}
                        />
                    </div>
                    <span className="text-xs font-medium text-white/60">Lvl {level + 1}</span>
                </div>
            </div>
        </button>
    );
};