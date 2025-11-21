import { GameRecord } from "../../module_bindings";
import { useNavigate } from "react-router-dom";
import { useMemo } from "react";

interface RecentGamesProps {
    gameRecords: GameRecord[];
}

export const RecentGames = ({ gameRecords }: RecentGamesProps) => {
    const navigate = useNavigate();

    const sortedGames = useMemo(() => {
        return [...gameRecords]
            .sort((a, b) => Number(b.date - a.date))
            .slice(0, 10);
    }, [gameRecords]);

    const formatGameMode = (mode: string) => {
        return mode.replace(/(\d+)/, ' $1');
    };

    const formatGameType = (type: string) => {
        switch (type) {
            case 'Public': return 'Public';
            case 'Private': return 'Private';
            case 'Practice': return 'Practice';
            default: return 'Public';
        }
    };

    const getGameTypeColor = (type: string) => {
        switch (type) {
            case 'Public': return 'text-green-400';
            case 'Private': return 'text-purple-400';
            case 'Practice': return 'text-blue-400';
            default: return 'text-green-400';
        }
    };

    const getPlacementColor = (placement: number) => {
        if (placement === 1) return 'text-yellow-400';
        return 'text-white';
    };

    const getPlacementSuffix = (placement: number) => {
        if (placement >= 11 && placement <= 13) return 'th';
        switch (placement % 10) {
            case 1: return 'st';
            case 2: return 'nd';
            case 3: return 'rd';
            default: return 'th';
        }
    };

    const formatTime = (timeMs: bigint) => {
        const totalSeconds = Number(timeMs) / 1000;
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = Math.floor(totalSeconds % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const formatDate = (timestamp: bigint) => {
        const date = new Date(Number(timestamp) / 1000);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
        if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
        return date.toLocaleDateString();
    };

    if (sortedGames.length === 0) {
        return (
            <div className="box box-shadow rounded-xl p-6">
                <div className="text-white/60 text-center">
                    No games played yet
                </div>
            </div>
        );
    }

    return (
        <div className="box box-shadow rounded-xl overflow-hidden">
            <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_1fr] gap-4 p-4 border-b border-white/10 text-white text-xs uppercase tracking-wider font-bold">
                <div>Game Mode</div>
                <div className="text-center">Type</div>
                <div className="text-center">Placement</div>
                <div className="text-center">Time</div>
                <div className="text-center">WPM</div>
                <div className="text-center">XP Gained</div>
                <div className="text-right">Date</div>
            </div>
            {sortedGames.map((gameRecord) => (
                <button
                    key={gameRecord.id}
                    onClick={() => navigate(`/game/${gameRecord.gameId}`)}
                    className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_1fr] gap-4 p-4 border-b border-white/10 last:border-b-0 hover:bg-white/5 transition-colors cursor-pointer w-full text-left bg-transparent border-0"
                >
                    <div className="text-white/70">
                        {formatGameMode(gameRecord.gameMode.tag)}
                    </div>
                    <div className={`text-center text-xs ${getGameTypeColor(gameRecord.gameType.tag)}`}>
                        {formatGameType(gameRecord.gameType.tag)}
                    </div>
                    <div className={`text-center ${getPlacementColor(gameRecord.placement)}`}>
                        {gameRecord.placement}{getPlacementSuffix(gameRecord.placement)}
                    </div>
                    <div className="text-white/70 text-center">
                        {formatTime(gameRecord.timeMs)}
                    </div>
                    <div className="text-white/70 text-center">
                        {Math.round(gameRecord.wpm)}
                    </div>
                    <div className="text-white/70 text-center">
                        {gameRecord.xpGained > 0 ? '+' : ''}{gameRecord.xpGained}
                    </div>
                    <div className="text-white/60 text-right text-sm">
                        {formatDate(gameRecord.date)}
                    </div>
                </button>
            ))}
        </div>
    );
};
