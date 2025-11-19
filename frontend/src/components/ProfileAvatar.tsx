import { useNavigate } from "react-router-dom";
import { useSpacetimeDB, useTable } from "spacetimedb/react";
import { PlayerColor, type DbConnection, type Player } from "../../module_bindings";
import { PlayerAvatar } from "./PlayerAvatar";
import { xpProgressToNextLevel } from "../utils/xpCalculator";
import { useEffect, useState, useRef } from "react";
import { setAccentColor } from "../utils/colorMapping";
import { useAuth } from "../firebase/AuthContext";

export const ProfileAvatar = () => {
    const navigate = useNavigate();
    const conn = useSpacetimeDB<DbConnection>();
    const { user, signOut } = useAuth();
    const { rows: players } = useTable<DbConnection, Player>(
        "player"
    );
    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const myPlayer = conn?.identity
        ? players.find((p) => p.id.isEqual(conn.identity!))
        : null;

    useEffect(() => {
        setAccentColor(myPlayer?.color || PlayerColor.Amber);
    }, [myPlayer]);

    const handleSignOut = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        await signOut();
        setShowMenu(false);
        navigate('/');
    };

    const name = myPlayer?.name ?? "Guest";
    const level = myPlayer?.level ?? 1;
    const currentXP = myPlayer?.xp ?? 0;
    const xpProgress = xpProgressToNextLevel(currentXP, level);

    const identityHash = conn?.identity?.toHexString() ?? "default";
    const isAnonymous = !user;

    if (isAnonymous) {
        return (
            <button
                onClick={() => navigate('/login')}
                className="flex items-center gap-4 py-3 rounded-lg cursor-pointer hover:bg-white/5 transition-colors"
            >
                <PlayerAvatar
                    size={40}
                    identity={identityHash}
                    color={myPlayer?.color}
                    isHighlighted={false}
                />

                <div className="flex flex-col items-start gap-1.5 min-w-50">
                    <div className="text-sm font-semibold text-white/70">{name}</div>
                    <div className="flex items-center gap-2 w-full">
                        <span className="text-xs font-medium text-white/30">Lvl 1</span>
                        <div className="flex-1 h-4 bg-white/5 rounded-full border border-white/20 relative">
                            <div className="absolute inset-0 flex items-center justify-center">
                                <svg className="w-3 h-3 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                        </div>
                        <span className="text-xs font-medium text-white/30">Lvl 2</span>
                    </div>
                </div>
            </button>
        );
    }

    return (
        <div 
            className="relative" 
            ref={menuRef}
            onMouseEnter={() => setShowMenu(true)}
            onMouseLeave={() => setShowMenu(false)}
        >
            <button
                onClick={() => navigate(`/profile/${identityHash}`)}
                className="flex items-center gap-4 py-3 rounded-lg cursor-pointer hover:bg-white/5 transition-colors"
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

            {showMenu && (
                <div className="absolute top-full right-0 bg-[#2a2a2a] border border-white/10 rounded-md shadow-lg overflow-hidden z-50 w-40">
                    <button
                        onClick={() => navigate(`/profile/${identityHash}`)}
                        className="w-full text-left px-3 py-2 text-white/80 hover:bg-white/5 transition-colors text-xs"
                    >
                        View Profile
                    </button>
                    <button
                        onClick={handleSignOut}
                        className="w-full text-left px-3 py-2 text-red-400 hover:bg-white/5 transition-colors text-xs border-t border-white/5"
                    >
                        Sign Out
                    </button>
                </div>
            )}
        </div>
    );
};