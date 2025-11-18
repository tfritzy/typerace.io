import { useNavigate } from "react-router-dom";
import { useSpacetimeDB, useTable } from "spacetimedb/react";
import { PlayerColor, type DbConnection, type Player } from "../../module_bindings";
import { PlayerAvatar } from "./PlayerAvatar";
import { xpProgressToNextLevel } from "../utils/xpCalculator";
import { useEffect } from "react";
import { setAccentColor } from "../utils/colorMapping";

export const ProfileAvatar = () => {
    const navigate = useNavigate();
    const conn = useSpacetimeDB<DbConnection>();
    const { rows: players } = useTable<DbConnection, Player>(
        "player"
    );

    const myPlayer = conn?.identity
        ? players.find((p) => p.id.isEqual(conn.identity!))
        : null;

    useEffect(() => {
        setAccentColor(myPlayer?.color || PlayerColor.Amber);
    }, [myPlayer]);

    const name = myPlayer?.name ?? "Guest";
    const level = myPlayer?.level ?? 1;
    const currentXP = myPlayer?.xp ?? 0;
    const xpProgress = xpProgressToNextLevel(currentXP, level);

    const identityHash = conn?.identity?.toHexString() ?? "default";

    return (
        <button
            onClick={() => navigate(`/profile/${identityHash}`)}
            className="flex items-center gap-4 py-3 rounded-lg cursor-pointer"
        >
            <PlayerAvatar
                size={40}
                identity={identityHash}
                color={myPlayer?.color}
                isHighlighted={true}
            />

            <div className="flex flex-col items-start gap-1 min-w-50">
                <div className="text-sm font-semibold text-white">{name}</div>
                <div className="flex items-center gap-2 w-full">
                    <span className="text-xs font-medium text-white/60">Lvl {level}</span>
                    <div className="flex-1 h-2.5 bg-white/10 rounded-full overflow-hidden">
                        <div
                            className="h-full rounded-full transition-all duration-300"
                            style={{
                                width: `${xpProgress}%`,
                                background: 'linear-gradient(to right, var(--color-accent-dark), var(--color-accent))'
                            }}
                        />
                    </div>
                    <span className="text-xs font-medium text-white/60">Lvl {level + 1}</span>
                </div>
            </div>
        </button>
    );
};