import {
  Clock3,
  Flag,
  Keyboard,
  Trophy,
  type LucideIcon,
} from "lucide-react";
import type { Player } from "../../types/stdb";
import { formatNumber, formatTimeSpent } from "../../utils/formatters";
import { xpProgressToNextLevel } from "../../utils/xpCalculator";
import { PlayerAvatar } from "../PlayerAvatar";

interface ProfileHeaderProps {
  player: Player;
  canEdit: boolean;
  onEdit: () => void;
}

interface CareerStatProps {
  icon: LucideIcon;
  label: string;
  value: string;
}

function CareerStat({ icon: Icon, label, value }: CareerStatProps) {
  return (
    <div className="flex min-w-0 items-center gap-2 md:min-w-[120px] md:gap-3 lg:min-w-[130px]">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border bg-input/50 text-accent-primary md:h-9 md:w-9">
        <Icon
          aria-hidden
          className="h-4 w-4 md:h-[17px] md:w-[17px]"
          strokeWidth={1.75}
        />
      </span>
      <span className="min-w-0">
        <strong className="block whitespace-nowrap text-sm font-semibold tabular-nums text-foreground md:text-base">
          {value}
        </strong>
        <span className="block text-[0.65rem] text-muted-foreground md:text-xs">
          {label}
        </span>
      </span>
    </div>
  );
}

function EditIcon() {
  return (
    <svg
      aria-hidden
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

export function ProfileHeader({ player, canEdit, onEdit }: ProfileHeaderProps) {
  const careerStats: CareerStatProps[] = [
    { icon: Flag, label: "races", value: formatNumber(player.totalGames) },
    { icon: Trophy, label: "wins", value: formatNumber(player.wins) },
    {
      icon: Keyboard,
      label: "words",
      value: formatNumber(player.totalWordsTyped),
    },
    {
      icon: Clock3,
      label: "typing",
      value: formatTimeSpent(Number(player.totalTimeSpentMs)),
    },
  ];
  const levelProgress = xpProgressToNextLevel(
    player.xp,
    player.xpRequiredForNextLevel,
  );

  return (
    <header className="relative grid gap-7 rounded-lg border border-border bg-card p-5 sm:p-6 md:grid-cols-[minmax(320px,1fr)_auto] md:items-center md:gap-10">
      <div className="flex min-w-0 items-center gap-5">
        <PlayerAvatar
          size={76}
          identity={player.identity.toHexString()}
          isBot={player.isBot}
        />

        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-2">
            <h1
              className="m-0 truncate text-2xl font-semibold tracking-tight text-foreground"
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
                <EditIcon />
              </button>
            )}
          </div>

          <div className="mt-3 flex max-w-[340px] items-center gap-3">
            <span className="whitespace-nowrap text-sm font-medium text-muted-foreground">
              Level {player.level}
            </span>
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-accent-primary transition-[width_0.3s_ease]"
                style={{ width: `${levelProgress}%` }}
              />
            </div>
            <span className="whitespace-nowrap text-xs tabular-nums text-muted-foreground">
              {player.xp}/{player.xpRequiredForNextLevel}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-1 md:grid-cols-2 md:gap-x-7 md:gap-y-4 md:pr-10 lg:gap-x-10">
        {careerStats.map((stat) => (
          <CareerStat key={stat.label} {...stat} />
        ))}
      </div>
    </header>
  );
}
