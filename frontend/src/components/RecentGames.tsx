import { type GameRecord } from "../types/stdb";
import { useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import { Star } from "lucide-react";
import { formatStopwatchTime } from "../utils/formatters";

interface RecentGamesProps {
    gameRecords: GameRecord[];
}

const ITEMS_PER_PAGE = 10;

export const RecentGames = ({ gameRecords }: RecentGamesProps) => {
    const navigate = useNavigate();
    const [currentPage, setCurrentPage] = useState(1);

    const sortedGames = useMemo(() => {
        return [...gameRecords]
            .sort((a, b) => Number(b.date - a.date));
    }, [gameRecords]);

    const totalPages = Math.ceil(sortedGames.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const currentGames = sortedGames.slice(startIndex, endIndex);

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
        return formatStopwatchTime(Number(timeMs) / 1000);
    };

    const formatDate = (timestamp: bigint) => {
        const date = new Date(Number(timestamp) / 1000);
        const dateStr = date.toLocaleDateString('en-US', {
            month: '2-digit',
            day: '2-digit',
            year: 'numeric'
        });
        const timeStr = date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
        return `${dateStr} ${timeStr}`;
    };

    if (sortedGames.length === 0) {
        return (
            <div className="box box-shadow rounded-xl p-6">
                <div className="text-muted-foreground text-center">
                    No games played yet
                </div>
            </div>
        );
    }

    return (
        <div className="box box-shadow rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
                <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_2.5fr] gap-4 p-4 border-b border-border text-foreground text-xs uppercase tracking-wider font-bold min-w-[700px]">
                    <div>Game Mode</div>
                    <div className="text-center">Type</div>
                    <div className="text-center">Placement</div>
                    <div className="text-center">Time</div>
                    <div className="text-center">WPM</div>
                    <div className="text-right">Date</div>
                </div>
                {currentGames.map((gameRecord) => (
                    <button
                        key={gameRecord.id}
                        onClick={() => navigate(`/game/${gameRecord.gameId}`)}
                        className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_2.5fr] gap-4 p-4 border-b border-border last:border-b-0 hover:bg-muted transition-colors cursor-pointer w-full text-left bg-transparent border-0 min-w-[700px]"
                    >
                        <div className="text-muted-foreground">
                            {formatGameMode(gameRecord.gameMode.tag)}
                        </div>
                        <div className="text-center text-muted-foreground">
                            {formatGameType(gameRecord.gameType.tag)}
                        </div>
                        <div className="text-center text-muted-foreground flex items-center justify-center gap-1">
                            <Star className="w-4 h-4 fill-accent-primary text-accent-primary" style={{ opacity: gameRecord.placement === 1 ? 1 : 0 }} />
                            <span>{gameRecord.placement}{getPlacementSuffix(gameRecord.placement)}</span>
                        </div>
                        <div className="text-muted-foreground text-center">
                            {formatTime(gameRecord.timeMs)}
                        </div>
                        <div className="text-muted-foreground text-center">
                            {Math.round(gameRecord.wpm)}
                        </div>
                        <div className="text-muted-foreground text-right text-sm">
                            {formatDate(gameRecord.date)}
                        </div>
                    </button>
                ))}
            </div>
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 p-4 border-t border-border">
                    <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1 rounded bg-muted hover:bg-secondary disabled:opacity-30 disabled:cursor-not-allowed text-foreground transition-colors"
                    >
                        Previous
                    </button>
                    <span className="text-muted-foreground text-sm">
                        Page {currentPage} of {totalPages}
                    </span>
                    <button
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 rounded bg-muted hover:bg-secondary disabled:opacity-30 disabled:cursor-not-allowed text-foreground transition-colors"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
};
