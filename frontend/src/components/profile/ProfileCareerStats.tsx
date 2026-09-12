import {
  Clock3,
  Flag,
  Keyboard,
  Languages,
  type LucideIcon,
} from "lucide-react";
import type { Player, PlayerStreak } from "../../types/stdb";
import { formatNumber, formatTimeSpent } from "../../utils/formatters";
import {
  ProfileMetricLabel,
  profileMetricCardClass,
} from "./ProfileMetric";
import { ProfileStreakStat } from "./ProfileStreakStat";

interface ProfileCareerStatsProps {
  player: Player;
  playerStreak: PlayerStreak | null;
  mostPlayedLanguage: string | null;
}

interface CareerStatProps {
  icon: LucideIcon;
  label: string;
  value: string;
}

function CareerStat({ icon: Icon, label, value }: CareerStatProps) {
  return (
    <li className={profileMetricCardClass}>
      <ProfileMetricLabel label={label} />
      <span className="mt-2 flex items-center gap-2 whitespace-nowrap text-base font-semibold tabular-nums text-foreground">
        <Icon
          aria-hidden
          className="h-4 w-4 shrink-0 text-foreground"
          strokeWidth={1.75}
        />
        <span>{value}</span>
      </span>
    </li>
  );
}

export function ProfileCareerStats({
  player,
  playerStreak,
  mostPlayedLanguage,
}: ProfileCareerStatsProps) {
  const stats: CareerStatProps[] = [
    {
      icon: Languages,
      label: "top language",
      value: mostPlayedLanguage ?? "–",
    },
    {
      icon: Flag,
      label: "games played",
      value: formatNumber(player.totalGames),
    },
    {
      icon: Keyboard,
      label: "words typed",
      value: formatNumber(player.totalWordsTyped),
    },
    {
      icon: Clock3,
      label: "typing time",
      value: formatTimeSpent(Number(player.totalTimeSpentMs)),
    },
  ];

  return (
    <section aria-labelledby="career-stats-heading">
      <h2
        id="career-stats-heading"
        className="mb-2 ml-1 text-base font-semibold text-secondary-foreground"
      >
        Career stats
      </h2>

      <ul className="m-0 grid list-none grid-flow-col auto-cols-[minmax(9rem,1fr)] gap-3 overflow-x-auto p-0 pb-1 md:grid-flow-row md:grid-cols-5 md:auto-cols-auto md:overflow-visible md:pb-0">
        <CareerStat {...stats[0]} />
        <ProfileStreakStat playerStreak={playerStreak} />
        {stats.slice(1).map((stat) => (
          <CareerStat key={stat.label} {...stat} />
        ))}
      </ul>
    </section>
  );
}
