import { useNavigate } from "react-router-dom";
import { cn } from "../../lib/utils";
import { WORD_COUNT_BUCKETS } from "../../utils/modes";
import type {
  LanguagePersonalRecords,
  PersonalRecordSlot,
} from "../../utils/profileStats";

interface ProfilePersonalRecordsProps {
  groups: LanguagePersonalRecords[];
}

const EMPTY_RECORD_SLOTS: PersonalRecordSlot[] = WORD_COUNT_BUCKETS.map(
  (wordCount) => ({
    wordCount,
    wpm: null,
    accuracy: null,
    gameId: null,
  }),
);

const EMPTY_LANGUAGE_GROUP: LanguagePersonalRecords = {
  language: "No language yet",
  raceCount: 0,
  slots: EMPTY_RECORD_SLOTS,
};

export function ProfilePersonalRecords({
  groups,
}: ProfilePersonalRecordsProps) {
  const navigate = useNavigate();
  const visibleGroups = groups.length > 0 ? groups : [EMPTY_LANGUAGE_GROUP];

  return (
    <section className="grid gap-4">
      {visibleGroups.map((group) => (
        <section
          key={group.language}
          aria-label={`${group.language} records`}
        >
          <h2 className="mb-2 ml-1 text-sm font-semibold text-secondary-foreground">
            {group.language}
          </h2>

          <div className="grid grid-cols-4 gap-x-4 rounded-lg border border-border bg-card p-5 sm:gap-x-8 sm:p-6">
            {group.slots.map((slot) => (
              <button
                key={slot.wordCount}
                type="button"
                disabled={!slot.gameId}
                onClick={() => slot.gameId && navigate(`/game/${slot.gameId}`)}
                className="w-full appearance-none border-0 bg-transparent p-0 text-center text-inherit disabled:cursor-default enabled:cursor-pointer enabled:hover:text-foreground"
                aria-label={slot.gameId
                  ? `View ${group.language} ${slot.wordCount}-word personal record race`
                  : undefined}
              >
                <span className="block text-xs text-muted-foreground/60">
                  {slot.wordCount} words
                </span>
                <span className={cn(
                  "mt-1.5 block text-2xl font-semibold tabular-nums tracking-tight",
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
              </button>
            ))}
          </div>
        </section>
      ))}
    </section>
  );
}
