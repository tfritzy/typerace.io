import { useMemo, useState } from "react";
import { Tooltip } from "react-tooltip";
import "react-tooltip/dist/react-tooltip.css";
import type { GameRecord } from "../../types/stdb";
import { Select } from "../Select";
import { buildActivityGrid, buildActivityYears } from "./activityGridData";

interface ProfileActivityGridProps {
  gameRecords: readonly GameRecord[];
}

const INTENSITY_CLASSES = [
  "bg-secondary ring-1 ring-inset ring-border/40",
  "bg-accent-primary/25",
  "bg-accent-primary/45",
  "bg-accent-primary/70",
  "bg-accent-primary",
] as const;

const DAY_LABELS = ["", "Mon", "", "Wed", "", "Fri", ""];
const ACTIVITY_TOOLTIP_ID = "profile-activity-tooltip";

function formatDayLabel(date: Date, count: number): string {
  const dateLabel = date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  return `${count} race${count === 1 ? "" : "s"} on ${dateLabel}`;
}

function formatDateAttribute(date: Date): string {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

export function ProfileActivityGrid({
  gameRecords,
}: ProfileActivityGridProps) {
  const currentYear = new Date().getFullYear();
  const [selectedPeriod, setSelectedPeriod] = useState("rolling");
  const periodOptions = useMemo(
    () => [
      { value: "rolling", label: "Last 12 months" },
      ...buildActivityYears(gameRecords, currentYear).map((year) => ({
        value: String(year),
        label: String(year),
      })),
    ],
    [currentYear, gameRecords],
  );
  const selectedYear = selectedPeriod === "rolling"
    ? undefined
    : Number(selectedPeriod);
  const activity = useMemo(
    () => buildActivityGrid(gameRecords, selectedYear),
    [gameRecords, selectedYear],
  );
  const periodLabel = selectedYear === undefined
    ? "the last 12 months"
    : String(selectedYear);
  const monthLabels = useMemo(() => {
    const labelsByWeek = new Map<number, Date>();
    const firstVisibleDay = activity.weeks.flat().find(
      (day) => day.state !== "padding",
    );
    if (firstVisibleDay) labelsByWeek.set(0, firstVisibleDay.date);

    activity.weeks.forEach((week, weekIndex) => {
      const firstOfMonth = week.find((day) => (
        day.state !== "padding" && day.date.getDate() === 1
      ));
      if (firstOfMonth) labelsByWeek.set(weekIndex, firstOfMonth.date);
    });

    return Array.from(labelsByWeek, ([weekIndex, date]) => ({
      label: date.toLocaleDateString(undefined, {
        month: "short",
      }),
      weekIndex,
    }));
  }, [activity.weeks]);

  return (
    <div className="rounded-lg border border-border/60 bg-card p-5 sm:p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="text-sm text-secondary-foreground">
              <strong className="font-semibold tabular-nums text-foreground">
                {activity.totalRaces}
              </strong>{" "}
              race{activity.totalRaces === 1 ? "" : "s"} in {periodLabel}
            </span>
          </div>

          <Select
            ariaLabel="Activity period"
            value={selectedPeriod}
            onChange={setSelectedPeriod}
            options={periodOptions}
            className="w-[148px] shrink-0"
            fluid
          />
        </div>

        <div className="w-full">
          <div className="grid w-full grid-cols-[24px_minmax(0,1fr)] grid-rows-[16px_auto] gap-x-2 gap-y-[3px]">
            <div
              aria-hidden
              className="col-start-1 row-start-2 grid grid-rows-7 text-[10px] text-muted-foreground"
              style={{ gap: "clamp(1px, 0.3vw, 3px)" }}
            >
              {DAY_LABELS.map((label, index) => (
                <span key={index} className="flex items-center">
                  {label}
                </span>
              ))}
            </div>

            <div
              aria-hidden
              className="col-start-2 row-start-1 grid text-[10px] leading-4 text-muted-foreground"
              style={{
                gap: "clamp(1px, 0.3vw, 3px)",
                gridTemplateColumns: `repeat(${activity.weeks.length}, minmax(0, 1fr))`,
              }}
            >
              {monthLabels.map(({ label, weekIndex }) => (
                <span
                  key={`${label}-${weekIndex}`}
                  className="whitespace-nowrap"
                  style={{ gridColumnStart: weekIndex + 1 }}
                >
                  {label}
                </span>
              ))}
            </div>

            <div
              className="col-start-2 row-start-2 grid"
              style={{
                gap: "clamp(1px, 0.3vw, 3px)",
                gridTemplateColumns: `repeat(${activity.weeks.length}, minmax(0, 1fr))`,
              }}
              role="img"
              aria-label={`Typing activity in ${periodLabel}: ${activity.totalRaces} races`}
            >
              {activity.weeks.map((week, weekIndex) => (
                <div
                  key={weekIndex}
                  className="flex min-w-0 flex-col"
                  style={{ gap: "clamp(1px, 0.3vw, 3px)" }}
                >
                  {week.map((day) => {
                    const label = day.state !== "elapsed"
                      ? undefined
                      : formatDayLabel(day.date, day.count);

                    return (
                      <time
                        key={day.date.toISOString()}
                        dateTime={formatDateAttribute(day.date)}
                        data-tooltip-id={label ? ACTIVITY_TOOLTIP_ID : undefined}
                        data-tooltip-content={label}
                        aria-label={label}
                        aria-hidden={day.state !== "elapsed" || undefined}
                        className={`block aspect-square w-full rounded-[2px] ${
                          day.state === "padding"
                            ? "bg-transparent"
                            : day.state === "future"
                              ? INTENSITY_CLASSES[0]
                              : `${INTENSITY_CLASSES[day.intensity]} cursor-default transition-[filter] hover:brightness-125`
                        }`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        <Tooltip
          id={ACTIVITY_TOOLTIP_ID}
          place="top"
          positionStrategy="fixed"
          offset={8}
          delayHide={40}
          className="!z-50 !max-w-[240px] !rounded-md !border !border-border !bg-popover !px-2.5 !py-1.5 !text-center !text-xs !text-popover-foreground !shadow-lg"
          classNameArrow="!bg-popover"
        />

        <div
          aria-label="Activity intensity ranges from less to more"
          className="mt-2 flex items-center justify-end gap-1.5 text-[10px] text-muted-foreground"
        >
          <span>Less</span>
          {INTENSITY_CLASSES.map((className, index) => (
            <span
              key={index}
              aria-hidden
              className={`h-[11px] w-[11px] rounded-[2px] ${className}`}
            />
          ))}
          <span>More</span>
        </div>
    </div>
  );
}
