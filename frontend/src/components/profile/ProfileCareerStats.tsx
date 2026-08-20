import {
  Clock3,
  Flag,
  Keyboard,
  Languages,
  Trophy,
  type LucideIcon,
} from "lucide-react";
import { cn } from "../../lib/utils";
import type { Player } from "../../types/stdb";
import { formatNumber, formatTimeSpent } from "../../utils/formatters";
import {
  ProfileMetricLabel,
  profileMetricCardClass,
} from "./ProfileMetric";

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
    <li
      className={cn(
        profileMetricCardClass,
        "snap-start",
      )}
    >
      <ProfileMetricLabel icon={Icon} label={label} />
      <span className="mt-2 whitespace-nowrap text-base font-semibold tabular-nums text-foreground">
        {value}
      </span>
    </li>
  );
}

export function ProfileCareerStats({
  player,
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
    { icon: Trophy, label: "total wins", value: formatNumber(player.wins) },
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

      <ul className="m-0 grid list-none snap-x grid-flow-col auto-cols-[minmax(9rem,1fr)] gap-3 overflow-x-auto p-0 pb-1 md:grid-flow-row md:grid-cols-5 md:auto-cols-auto md:overflow-visible md:pb-0">
        {stats.map((stat) => (
          <CareerStat key={stat.label} {...stat} />
        ))}
      </ul>
    </section>
  );
}
