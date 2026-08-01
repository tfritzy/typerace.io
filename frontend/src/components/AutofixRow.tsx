import { AutofixIndicator } from "./AutofixIndicator";

type AutofixRowProps =
  | { loading: true }
  | {
      loading?: false;
      remaining: number;
      completedWords: number;
      totalWords: number;
    };

export function AutofixRow(props: AutofixRowProps) {
  const loading = props.loading === true;
  const completedWords = loading ? 0 : props.completedWords;
  const totalWords = loading ? undefined : props.totalWords;

  return (
    <div
      className="flex items-center justify-between gap-4 px-1"
      aria-hidden={loading || undefined}
    >
      {loading ? (
        <AutofixIndicator loading />
      ) : (
        <AutofixIndicator remaining={props.remaining} />
      )}
      <div
        className={`mr-2 flex select-none items-baseline font-sans leading-none ${
          loading
            ? "text-muted-foreground/50"
            : "text-muted-foreground"
        }`}
        role={loading ? undefined : "meter"}
        aria-label={loading ? undefined : "Words completed"}
        aria-valuemin={loading ? undefined : 0}
        aria-valuemax={totalWords}
        aria-valuenow={loading ? undefined : completedWords}
      >
        <span
          className={`font-mono text-sm font-medium tabular-nums tracking-[0.12em] ${
            loading ? "" : "text-secondary-foreground"
          }`}
        >
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
