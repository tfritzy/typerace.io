import {
  Flame,
  Shield,
  TreePalm,
} from "lucide-react";
import { Tooltip } from "react-tooltip";
import "react-tooltip/dist/react-tooltip.css";
import type { PlayerStreak } from "../../types/stdb";
import { formatNumber } from "../../utils/formatters";
import {
  ProfileMetricLabel,
  profileMetricCardClass,
} from "./ProfileMetric";

const STREAK_PROTECTION_TOOLTIP_ID = "streak-protection-tooltip";

interface ProfileStreakStatProps {
  playerStreak: PlayerStreak | null;
}

export function ProfileStreakStat({
  playerStreak,
}: ProfileStreakStatProps) {
  const streak = playerStreak?.streak ?? 0;
  const protections = playerStreak?.protections ?? 0;
  const weekendProtected = [0, 6].includes(new Date().getUTCDay());

  return (
    <li className={profileMetricCardClass}>
      <ProfileMetricLabel label="streak" />
      <div className="mt-1.5 flex w-full items-center gap-2">
        <Flame
          aria-hidden
          className="h-4 w-4 shrink-0 text-foreground"
          strokeWidth={1.75}
        />

        <span className="whitespace-nowrap text-base font-semibold tabular-nums text-foreground">
          {formatNumber(streak)}
        </span>

        <span
          className="ml-auto flex items-center gap-1"
          aria-label={`${protections} of 2 streak protections${weekendProtected
            ? ", weekend protection active"
            : ""}`}
          data-tooltip-id={STREAK_PROTECTION_TOOLTIP_ID}
          tabIndex={0}
        >
          {weekendProtected && (
            <TreePalm
              aria-hidden
              className="h-[1.125rem] w-[1.125rem] text-foreground/65"
              strokeWidth={1.75}
            />
          )}
          {[0, 1].map((index) => {
            const isCharged = index < protections;
            return (
              <Shield
                key={index}
                aria-hidden
                className={isCharged
                  ? "h-[1.125rem] w-[1.125rem] text-foreground/65"
                  : "h-[1.125rem] w-[1.125rem] text-muted-foreground/25"}
                strokeWidth={1.75}
                fill="currentColor"
                fillOpacity={isCharged ? 0.3 : 0}
              />
            );
          })}
        </span>
      </div>

      <Tooltip
        id={STREAK_PROTECTION_TOOLTIP_ID}
        place="top"
        positionStrategy="fixed"
        offset={8}
        className="!z-50 !max-w-[250px] !rounded-lg !border !border-border !bg-popover !px-3 !py-2.5 !text-popover-foreground !opacity-100 !shadow-lg"
        classNameArrow="!bg-popover"
      >
        <div className="flex flex-col gap-1.5 text-left">
          <div className="flex items-center gap-2 text-xs font-semibold">
            <Shield aria-hidden className="h-3.5 w-3.5" strokeWidth={1.75} />
            <span>Streak protection</span>
            <span className="ml-auto tabular-nums text-muted-foreground">
              {protections}/2
            </span>
          </div>
          <p className="m-0 text-[0.7rem] leading-relaxed text-muted-foreground">
            Finish a race to charge your protections up to two. Weekends have
            automatic protection.
          </p>
          {weekendProtected && (
            <span className="mt-0.5 flex items-center gap-1.5 text-[0.7rem] font-semibold text-accent-primary">
              <TreePalm aria-hidden className="h-3.5 w-3.5" strokeWidth={1.75} />
              Weekend protection active
            </span>
          )}
        </div>
      </Tooltip>
    </li>
  );
}
