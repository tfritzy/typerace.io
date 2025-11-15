import Avatar from "boring-avatars";

type InlinePlayerProgressProps = {
    name: string;
    level: number;
    progress: number;
    phraseLength: number;
    identityHash: string;
};

export const InlinePlayerProgress = ({
    name,
    level,
    progress,
    phraseLength,
    identityHash,
}: InlinePlayerProgressProps) => {
    return (
        <div className="mb-6">
            <div className="flex items-center gap-3 mb-3">
                <div className="relative shrink-0 border-2 border-amber-400/60 rounded-full">
                    <Avatar
                        size={36}
                        name={identityHash}
                        variant="pixel"
                        colors={["#fbbf24", "#f59e0b", "#d97706", "#b45309", "#92400e"]}
                    />
                </div>

                <div className="flex items-baseline gap-2">
                    <span className="text-base font-semibold text-white/90">
                        {name}
                    </span>
                    <span className="text-xs text-white/40">
                        Lvl {level}
                    </span>
                </div>

                <div className="ml-auto text-xs font-mono text-white/50 tabular-nums">
                    {progress}/{phraseLength}
                </div>
            </div>
        </div>
    );
};
