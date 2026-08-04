import { AllowedErrorsIndicator } from "./AllowedErrorsIndicator";

type AllowedErrorsRowProps =
  | { loading: true }
  | {
      loading?: false;
      total: number;
      remaining: number;
      showFixWarning: boolean;
      errorsToFix: number;
      completedWords: number;
      totalWords: number;
    };

export function AllowedErrorsRow(props: AllowedErrorsRowProps) {
  const loading = props.loading === true;
  const completedWords = loading ? 0 : props.completedWords;
  const totalWords = loading ? undefined : props.totalWords;

  return (
    <div
      className="flex items-center justify-between gap-4 px-1"
      aria-hidden={loading || undefined}
    >
      {loading ? (
        <AllowedErrorsIndicator loading />
      ) : (
        <AllowedErrorsIndicator
          total={props.total}
          remaining={props.remaining}
          showFixWarning={props.showFixWarning}
          errorsToFix={props.errorsToFix}
        />
      )}
      <div
        className={`mr-2 flex -translate-y-0.5 select-none items-baseline font-sans leading-none ${
          loading ? "text-muted-foreground/50" : "text-muted-foreground/70"
        }`}
        role={loading ? undefined : "meter"}
        aria-label={loading ? undefined : "Words completed"}
        aria-valuemin={loading ? undefined : 0}
        aria-valuemax={totalWords}
        aria-valuenow={loading ? undefined : completedWords}
      >
        <span className="font-mono text-sm font-medium tabular-nums tracking-[0.12em]">
          {completedWords}/
          {loading ? (
            <span className="inline-block w-[2ch] text-center">-</span>
          ) : (
            totalWords
          )}
        </span>
      </div>
    </div>
  );
}
