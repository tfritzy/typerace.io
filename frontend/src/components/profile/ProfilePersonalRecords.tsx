import { useNavigate } from "react-router-dom";
import { cn } from "../../lib/utils";
import type {
  PersonalRecordSlot,
  ProfilePersonalRecordsData,
} from "../../utils/profileStats";

interface ProfilePersonalRecordsProps {
  records: ProfilePersonalRecordsData;
}

function getRecordLabel(
  language: string | null,
  slot: PersonalRecordSlot,
): string {
  if (slot.wpm === null) {
    return `No ${slot.wordCount}-word personal record yet`;
  }

  const languageLabel = language ? `${language} ` : "";
  const accuracyLabel = slot.accuracy === null
    ? "accuracy unavailable"
    : `${Math.round(slot.accuracy)}% accuracy`;
  const wpm = Math.round(slot.wpm);
  return `View ${languageLabel}${slot.wordCount}-word personal record: ${wpm} WPM, ${accuracyLabel}`;
}

export function ProfilePersonalRecords({
  records,
}: ProfilePersonalRecordsProps) {
  const navigate = useNavigate();
  const heading = records.language
    ? `${records.language} personal records`
    : "Personal records";

  return (
    <section aria-label={heading}>
      <h2 className="mb-2 ml-1 text-sm font-semibold text-secondary-foreground">
        {heading}
      </h2>

      <div className="grid grid-cols-[repeat(2,7rem)] justify-evenly gap-y-4 rounded-lg border border-border bg-card pb-5 pt-3 sm:grid-cols-[repeat(4,7rem)] sm:pb-6 sm:pt-4">
        {records.slots.map((slot) => (
          <button
            key={slot.wordCount}
            type="button"
            disabled={!slot.gameId}
            onClick={() => slot.gameId && navigate(`/game/${slot.gameId}`)}
            className="relative mx-auto flex aspect-square w-full max-w-28 appearance-none flex-col items-center justify-center rounded-full border border-border bg-input/30 p-3 text-center text-inherit shadow-[inset_0_2px_4px_rgb(0_0_0/0.14),inset_0_-1px_1px_rgb(255_255_255/0.04)] transition-colors disabled:cursor-default enabled:cursor-pointer enabled:hover:border-accent-primary/50 enabled:hover:bg-input/50"
            aria-label={getRecordLabel(records.language, slot)}
          >
            <span className={cn(
              "block text-2xl font-semibold tabular-nums tracking-tight",
              slot.wpm === null
                ? "text-muted-foreground"
                : "text-foreground",
            )}>
              {slot.wpm === null ? "–" : Math.round(slot.wpm)}
            </span>
            <span className="mt-0.5 block text-sm tabular-nums text-muted-foreground">
              {slot.accuracy === null
                ? "–"
                : `${Math.round(slot.accuracy)}%`}
            </span>
            <span className="absolute -bottom-2.5 left-1/2 z-10 block -translate-x-1/2 whitespace-nowrap rounded-md border border-border bg-card px-5 py-1 text-[0.65rem] font-semibold uppercase tracking-wide text-muted-foreground shadow-sm">
              <span aria-hidden className="absolute left-2 top-1/2 h-0.5 w-0.5 -translate-y-1/2 rounded-full bg-muted-foreground/40" />
              <span aria-hidden className="absolute right-2 top-1/2 h-0.5 w-0.5 -translate-y-1/2 rounded-full bg-muted-foreground/40" />
              {slot.wordCount} words
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
