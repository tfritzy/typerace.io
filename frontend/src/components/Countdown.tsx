import { useEffect, useState } from "react";
import bufoLetsGo from "../assets/bufo-lets-goo.gif";

interface CountdownProps {
  raceStartsAt: number | null;
  countdownComplete: boolean;
  errorBorder?: boolean;
}

export const Countdown = ({
  raceStartsAt,
  countdownComplete,
  errorBorder = false,
}: CountdownProps) => {
  const [cue, setCue] = useState<number | null>(null);

  useEffect(() => {
    setCue(null);
    if (raceStartsAt === null || countdownComplete) return;

    const remainingMs = raceStartsAt - performance.now();
    const timers = [3, 2, 1].flatMap((count) => {
      const delayMs = remainingMs - count * 1000;
      return delayMs >= 0 ? [setTimeout(() => setCue(count), delayMs)] : [];
    });

    return () => timers.forEach(clearTimeout);
  }, [countdownComplete, raceStartsAt]);

  const isRacing = countdownComplete && raceStartsAt !== null;
  const accent = errorBorder
    ? "var(--destructive)"
    : "var(--accent-primary)";

  return (
    <>
      {(cue !== null || isRacing || errorBorder) && (
        <div
          key={isRacing ? "go" : cue}
          aria-hidden="true"
          data-error-border={errorBorder || undefined}
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            borderRadius: "calc(var(--radius, 8px) * 2)",
            border: `1px solid ${accent}`,
            opacity: errorBorder ? 0.8 : isRacing ? 0.7 : 0,
            boxShadow: errorBorder || isRacing
              ? `0 0 9px 0 color-mix(in srgb, ${accent} 24%, transparent)`
              : "none",
            animation: errorBorder || isRacing
              ? undefined
              : "countdownPulse 1s linear forwards",
          }}
        />
      )}

      {!isRacing && typeof cue === "number" && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
          <div
            key={cue}
            className="countdown-number text-accent relative -top-6"
            style={{
              fontSize: "9rem",
              animation: "countdownPop 1s ease-out forwards",
            }}
          >
            {cue}
          </div>
        </div>
      )}

      <div
        aria-hidden="true"
        className="absolute top-0 left-0 pointer-events-none z-50 -translate-x-full -ml-1"
        style={{ visibility: isRacing ? "visible" : "hidden" }}
      >
        <img
          src={bufoLetsGo}
          alt=""
          className="w-10 h-10 sm:w-14 sm:h-14"
          style={{
            animation: isRacing
              ? "countdownCelebrate 2s ease-out forwards"
              : undefined,
          }}
        />
      </div>

      <style>{`
        @keyframes countdownPulse {
          0%, 15% {
            opacity: 1;
            box-shadow: 0 0 9px 0 color-mix(in srgb, ${accent} 24%, transparent);
          }
          95%, 100% {
            opacity: 0;
            box-shadow: 0 0 0 0 transparent;
          }
        }

        @keyframes countdownPop {
          0% {
            opacity: 1;
            transform: scale(1);
          }
          100% {
            opacity: 0;
            transform: scale(0.8);
          }
        }

        @keyframes countdownCelebrate {
          0% {
            transform: scale(0.9) scaleX(-1);
          }
          20%, 80% {
            opacity: 1;
            transform: scale(1) scaleX(-1);
          }
          100% {
            opacity: 0;
            transform: scale(0.8) scaleX(-1);
          }
        }
      `}</style>
    </>
  );
};
