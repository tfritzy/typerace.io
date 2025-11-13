import Avatar from "boring-avatars";

type PlayerProgressBarProps = {
    name: string;
    level: number;
    progress: number;
    phraseLength: number;
    identityHash: string;
    isCurrentPlayer?: boolean;
};

export const PlayerProgressBar = ({
    name,
    level,
    progress,
    phraseLength,
    identityHash,
    isCurrentPlayer = false,
}: PlayerProgressBarProps) => {
    const progressPercentage = (progress / phraseLength) * 100;

    return (
        <div className="w-full mb-3 flex items-center gap-4">
            <div className={`relative shrink-0 border-2 rounded-full ${isCurrentPlayer ? 'border-amber-400' : 'border-white/30'}`}>
                <Avatar
                    size={40}
                    name={identityHash}
                    variant="pixel"
                    colors={["#fbbf24", "#f59e0b", "#d97706", "#b45309", "#92400e"]}
                />
            </div>

            <div className="flex-1 flex flex-col gap-1">
                <div className="flex items-center gap-2">
                    <span className={`text-sm font-semibold ${isCurrentPlayer ? 'text-white' : 'text-white/70'}`}>
                        {name}
                    </span>
                    <span className="text-xs font-medium text-white/50">
                        Lvl {level}
                    </span>
                </div>
                <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all duration-200 ${isCurrentPlayer
                            ? 'bg-linear-to-r from-amber-500 to-amber-400'
                            : 'bg-linear-to-r from-stone-500 to-stone-400'
                            }`}
                        style={{ width: `${Math.min(100, progressPercentage)}%` }}
                    />
                </div>
            </div>
        </div>
    );
};
