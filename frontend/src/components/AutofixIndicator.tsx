import { getTranslations } from "@/utils/translations";
import { useEffect, useState } from "react";

type AutofixIndicatorProps =
  | { remaining: number; loading?: false }
  | { remaining?: never; loading: true };

export function AutofixIndicator(props: AutofixIndicatorProps) {
  const remaining = props.loading ? 0 : props.remaining;
  const [maxSeen, setMaxSeen] = useState(remaining);
  const total = Math.max(maxSeen, remaining);

  useEffect(() => {
    if (remaining > maxSeen) setMaxSeen(remaining);
  }, [maxSeen, remaining]);

  if (props.loading) {
    return (
      <div className="mb-2 flex items-center gap-3 text-[11px] text-muted-foreground/50">
        <span className="font-medium uppercase tracking-[0.12em]">
          Auto-fixes
        </span>
        <span className="flex items-center gap-1 motion-safe:animate-pulse">
          {Array.from({ length: 5 }, (_, index) => (
            <span
              key={index}
              className="size-2 shrink-0 rounded-full bg-accent-primary/20 sm:size-2.5"
            />
          ))}
        </span>
      </div>
    );
  }

  const hasAutofixes = remaining > 0;
  const manualFixMessage = getTranslations().tooManyErrors;

  return (
    <div
      className="mb-2 flex select-none flex-wrap items-center gap-x-3 gap-y-2 font-sans leading-none"
      role="status"
      aria-live="polite"
      aria-label={`${remaining} auto-fix${remaining === 1 ? "" : "es"} remaining${hasAutofixes ? "" : `. ${manualFixMessage}`}`}
      title="Each charge fixes one typo when you finish a word"
    >
      <span
        className={`flex items-center gap-3 text-[11px] ${
          hasAutofixes
            ? "text-muted-foreground"
            : "text-muted-foreground/50"
        }`}
      >
        <span className="font-medium uppercase tracking-[0.12em]">
          Auto-fixes
        </span>
        <span
          className="flex max-w-[60vw] flex-wrap items-center justify-end gap-0.5 sm:max-w-lg sm:gap-1"
          aria-hidden="true"
        >
          {Array.from({ length: total }, (_, index) => (
            <span
              key={index}
              data-autofix-charge
              className={`size-2 shrink-0 rounded-full transition-colors duration-200 sm:size-2.5 ${
                index < remaining
                  ? "bg-accent-primary"
                  : "bg-accent-primary/15"
              }`}
            />
          ))}
        </span>
      </span>
      {!hasAutofixes && (
        <span className="text-sm font-normal text-destructive">
          {manualFixMessage}
        </span>
      )}
    </div>
  );
}
