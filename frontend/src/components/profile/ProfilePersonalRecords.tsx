import { Gauge } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "../../lib/utils";
import type {
  PersonalRecordSlot,
  ProfilePersonalRecordsData,
} from "../../utils/profileStats";
import {
  ProfileMetricLabel,
  profileMetricCardClass,
} from "./ProfileMetric";

interface ProfilePersonalRecordsProps {
  records: ProfilePersonalRecordsData;
}

function getRecordLabel(
  language: string | null,
  slot: PersonalRecordSlot,
): string {
  if (slot.wpm === null) {
    return `No ${slot.wordCount}-word personal best yet`;
  }

  const languageLabel = language ? `${language} ` : "";
  const accuracyLabel = slot.accuracy === null
    ? "accuracy unavailable"
    : `${Math.round(slot.accuracy)}% accuracy`;
  const wpm = Math.round(slot.wpm);
  return `View ${languageLabel}${slot.wordCount}-word personal best: ${wpm} WPM, ${accuracyLabel}`;
}

function getAccuracyLabel(slot: PersonalRecordSlot): string {
  if (slot.wpm === null) return "No best yet";
  if (slot.accuracy === null) return "Accuracy unavailable";
  return `${Math.round(slot.accuracy)}% accuracy`;
}

export function ProfilePersonalRecords({
  records,
}: ProfilePersonalRecordsProps) {
  const navigate = useNavigate();
  const heading = records.language
    ? `${records.language} personal bests`
    : "Personal bests";

  return (
    <section aria-labelledby="personal-records-heading">
      <h2
        id="personal-records-heading"
        className="mb-2 ml-1 text-base font-semibold text-secondary-foreground"
      >
        {heading}
      </h2>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {records.slots.map((slot) => (
          <button
            key={slot.wordCount}
            type="button"
            disabled={!slot.gameId}
            onClick={() => slot.gameId && navigate(`/game/${slot.gameId}`)}
            className={cn(
              profileMetricCardClass,
              "appearance-none text-left text-inherit transition-colors disabled:cursor-default enabled:cursor-pointer enabled:hover:border-accent-primary/40",
            )}
            aria-label={getRecordLabel(records.language, slot)}
          >
            <ProfileMetricLabel
              icon={Gauge}
              label={`${slot.wordCount} words`}
            />
            <span className={cn(
              "mt-0.5 text-base font-semibold tabular-nums",
              slot.wpm === null
                ? "text-muted-foreground"
                : "text-foreground",
            )}>
              {slot.wpm === null ? "–" : `${Math.round(slot.wpm)} WPM`}
            </span>
            <span className="mt-0.5 text-xs tabular-nums text-muted-foreground">
              {getAccuracyLabel(slot)}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
