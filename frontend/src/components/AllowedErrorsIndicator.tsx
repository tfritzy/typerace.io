import { getTranslations } from "@/utils/translations";
import { CircleX } from "lucide-react";

type AllowedErrorsIndicatorProps =
  | {
      total: number;
      remaining: number;
      showFixWarning: boolean;
      errorsToFix: number;
      loading?: false;
    }
  | {
      total?: never;
      remaining?: never;
      showFixWarning?: never;
      errorsToFix?: never;
      loading: true;
    };

export function AllowedErrorsIndicator(
  props: AllowedErrorsIndicatorProps,
) {
  if (props.loading) {
    return (
      <div className="mb-2 flex items-center text-[11px] text-muted-foreground/50">
        <span className="font-medium uppercase tracking-[0.12em]">
          Errors allowed
        </span>
      </div>
    );
  }

  const total = Math.max(0, props.total);
  const remaining = Math.min(total, Math.max(0, props.remaining));
  const used = total - remaining;
  const translations = getTranslations();
  const warning = translations.fixErrorCount(props.errorsToFix);

  return (
    <div
      className="mb-2 flex min-w-0 flex-1 select-none items-center font-sans leading-none"
      role="status"
      aria-live="polite"
      aria-label={`${used} of ${total} allowed errors used${props.showFixWarning ? `. ${warning}` : ""}`}
      title={`You can finish with up to ${total} uncorrected typo${total === 1 ? "" : "s"}`}
    >
      <div className="flex shrink-0 items-center gap-2.5 text-[11px] text-muted-foreground">
        <span className="font-medium uppercase tracking-[0.12em]">
          Errors allowed
        </span>
        <span
          className="flex max-w-[60vw] flex-wrap items-center justify-end gap-1 sm:max-w-lg"
          aria-hidden="true"
        >
          {Array.from({ length: total }, (_, index) => {
            const isUsed = index < used;
            return (
              <span
                key={index}
                data-error-allowance
                data-used={isUsed || undefined}
                className="flex size-3.5 shrink-0 items-center justify-center motion-safe:animate-[fadeIn_140ms_ease-out_both] sm:size-4"
                style={{ animationDelay: `${index * 18}ms` }}
              >
                <CircleX
                  className={`size-full motion-safe:transition-colors motion-safe:duration-200 [&>path]:transition-opacity [&>path]:duration-150 ${
                    isUsed
                      ? "text-destructive [&>path]:opacity-100"
                      : "text-muted-foreground/70 [&>path]:opacity-0"
                  }`}
                  strokeWidth={isUsed ? 2 : 1}
                />
              </span>
            );
          })}
        </span>
      </div>
      <div className="relative ml-3 h-5 min-w-0 flex-1">
        {props.showFixWarning && (
          <span className="absolute left-0 top-1/2 max-w-full -translate-y-1/2 overflow-hidden text-ellipsis whitespace-nowrap text-sm font-normal text-destructive">
            {warning}
          </span>
        )}
      </div>
    </div>
  );
}
