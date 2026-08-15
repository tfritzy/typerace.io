import { Pencil } from "lucide-react";
import type { Player } from "../../types/stdb";
import { xpProgressToNextLevel } from "../../utils/xpCalculator";
import { PlayerAvatar } from "../PlayerAvatar";
import { ProfileCareerStats } from "./ProfileCareerStats";

interface ProfileHeaderProps {
  player: Player;
  mostPlayedLanguage: string | null;
  canEdit: boolean;
  onEdit: () => void;
}

export function ProfileHeader({
  player,
  mostPlayedLanguage,
  canEdit,
  onEdit,
}: ProfileHeaderProps) {
  const levelProgress = xpProgressToNextLevel(
    player.xp,
    player.xpRequiredForNextLevel,
  );

  return (
    <header className="flex flex-col gap-8 rounded-lg border border-border bg-card px-5 pb-3 pt-5 sm:px-8 sm:pb-5 sm:pt-8">
      <div className="flex min-w-0 flex-col items-start gap-4 sm:flex-row sm:gap-6">
        <PlayerAvatar
          size={80}
          identity={player.identity.toHexString()}
          isHighlighted
          isBot={player.isBot}
        />

        <div className="w-full min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-2">
            <h1
              className="m-0 truncate text-2xl font-bold tracking-tight text-foreground sm:text-3xl"
              title={player.name}
            >
              {player.name}
            </h1>
            {canEdit && (
              <button
                type="button"
                onClick={onEdit}
                className="cursor-pointer rounded-md border-0 bg-transparent p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                title="Edit name"
                aria-label="Edit name"
              >
                <Pencil aria-hidden size={16} strokeWidth={2} />
              </button>
            )}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2 sm:gap-3">
            <span className="whitespace-nowrap text-xs font-medium text-muted-foreground sm:text-sm">
              Level {player.level}
            </span>
            <span className="whitespace-nowrap font-mono text-xs tabular-nums text-muted-foreground sm:text-sm">
              {player.xp}/{player.xpRequiredForNextLevel}
            </span>
            <div
              className="h-2 w-full overflow-hidden rounded-full bg-input/50 shadow-[inset_0_1px_3px_rgb(0_0_0/0.18),inset_0_-1px_1px_rgb(255_255_255/0.04)] sm:h-2.5 sm:flex-1"
              role="progressbar"
              aria-label="Progress to next level"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(levelProgress)}
            >
              <div
                className="h-full rounded-full transition-[width_0.3s_ease]"
                style={{
                  background:
                    "linear-gradient(to right, var(--accent-dark), var(--accent-primary))",
                  width: `${levelProgress}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <ProfileCareerStats
        player={player}
        mostPlayedLanguage={mostPlayedLanguage}
      />
    </header>
  );
}
