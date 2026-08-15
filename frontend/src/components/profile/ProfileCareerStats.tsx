import {
  Clock3,
  Flag,
  Keyboard,
  Languages,
  Trophy,
  type LucideIcon,
} from "lucide-react";
import type { Player } from "../../types/stdb";
import { formatNumber, formatTimeSpent } from "../../utils/formatters";

interface ProfileCareerStatsProps {
  player: Player;
  mostPlayedLanguage: string | null;
}

interface CareerStatProps {
  icon: LucideIcon;
  label: string;
  value: string;
}

function CareerStat({ icon: Icon, label, value }: CareerStatProps) {
  return (
    <div className="flex min-w-0 items-center justify-self-center gap-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border bg-input/50 text-accent-primary">
        <Icon aria-hidden className="h-[17px] w-[17px]" strokeWidth={1.75} />
      </span>
      <div className="flex min-w-0 flex-col-reverse">
        <dt className="text-xs text-muted-foreground">{label}</dt>
        <dd className="m-0 whitespace-nowrap text-base font-semibold tabular-nums text-foreground">
          {value}
        </dd>
      </div>
    </div>
  );
}

export function ProfileCareerStats({
  player,
  mostPlayedLanguage,
}: ProfileCareerStatsProps) {
  const stats: CareerStatProps[] = [
    {
      icon: Languages,
      label: "most played",
      value: mostPlayedLanguage ?? "–",
    },
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

  return (
    <dl
      aria-label="Career stats"
      className="grid grid-cols-2 gap-5 rounded-full border border-border bg-input/30 px-5 py-5 shadow-[inset_0_2px_4px_rgb(0_0_0/0.14),inset_0_-1px_1px_rgb(255_255_255/0.04)] sm:grid-cols-3 sm:gap-8 sm:px-6 lg:grid-cols-5"
    >
      {stats.map((stat) => (
        <CareerStat key={stat.label} {...stat} />
      ))}
    </dl>
  );
}
