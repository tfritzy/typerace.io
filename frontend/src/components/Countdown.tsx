import { useEffect, useRef, useState } from "react";
import bufoLetsGo from "../assets/bufo-lets-goo.gif";
import { useCountdownTiming } from "../hooks/useCountdownTiming";

const PULSE_PERIOD_MS = 1000;
const PULSE_BRIGHT_MS = 150;
const PULSE_FADE_MS = 800;
const MIN_INITIAL_NUMBER_MS = 800;

const getCountdownPosition = (remainingMs: number) => {
  const count = Math.max(0, Math.ceil(remainingMs / PULSE_PERIOD_MS));
  const timeUntilNextNumber =
    remainingMs - (count - 1) * PULSE_PERIOD_MS;
  return { count, timeUntilNextNumber };
};

export const Countdown = () => {
  const { timing: raceTiming } = useCountdownTiming();
  const [count, setCount] = useState(3);
  const [showCount, setShowCount] = useState(false);
  const [showImage, setShowImage] = useState(false);
  const [pulseOn, setPulseOn] = useState(false);
  const previousGameState = useRef<string>();
  const isCountdown = raceTiming.phase === "countdown";
  const isRacing = raceTiming.phase === "racing";
  const deadlineMs = isCountdown ? raceTiming.deadlineMs : null;
  const tag = raceTiming.phase;

  useEffect(() => {
    if (!isCountdown) {
      setShowCount(false);
      return;
    }
    if (deadlineMs === null) return;

    const updateCount = () => {
      const remainingMs = deadlineMs - performance.now();
      const nextCount = Math.max(
        0,
        Math.ceil(remainingMs / PULSE_PERIOD_MS),
      );
      setCount(nextCount);
      setShowCount(nextCount > 0);
      return { remainingMs, displayedCount: nextCount };
    };

    const initialRemainingMs = deadlineMs - performance.now();
    const initialPosition = getCountdownPosition(initialRemainingMs);
    const skipInitialNumber =
      initialPosition.count > 1 &&
      initialPosition.timeUntilNextNumber <= MIN_INITIAL_NUMBER_MS;
    let current = skipInitialNumber
      ? {
          remainingMs: initialRemainingMs,
          displayedCount: initialPosition.count,
        }
      : updateCount();
    if (skipInitialNumber) setShowCount(false);
    setShowImage(false);

    let timeout: ReturnType<typeof setTimeout> | undefined;
    const scheduleNextTick = () => {
      if (current.remainingMs <= 0 || current.displayedCount <= 0) return;
      const untilNextBoundary = Math.max(
        1,
        current.remainingMs -
          (current.displayedCount - 1) * PULSE_PERIOD_MS,
      );
      timeout = setTimeout(() => {
        current = updateCount();
        scheduleNextTick();
      }, untilNextBoundary);
    };
    scheduleNextTick();

    return () => clearTimeout(timeout);
  }, [isCountdown, deadlineMs]);

  useEffect(() => {
    const previousState = previousGameState.current;
    previousGameState.current = tag;

    if (isCountdown) {
      setShowImage(false);
      return;
    }

    if (!isRacing) {
      setShowImage(false);
      return;
    }

    if (previousState !== "countdown") return;

    setShowImage(true);
    const timeout = setTimeout(() => setShowImage(false), 2000);
    return () => clearTimeout(timeout);
  }, [isCountdown, isRacing, tag]);

  useEffect(() => {
    if (!isCountdown || deadlineMs === null) {
      setPulseOn(false);
      return;
    }

    let offTimer: ReturnType<typeof setTimeout> | null = null;
    let nextPulseTimer: ReturnType<typeof setTimeout> | null = null;

    const fire = () => {
      setPulseOn(true);
      offTimer = setTimeout(() => setPulseOn(false), PULSE_BRIGHT_MS);
    };

    const scheduleNextPulse = (displayedCount: number) => {
      const remainingMs = deadlineMs - performance.now();
      if (displayedCount <= 1) return;

      const untilNextBoundary = Math.max(
        1,
        remainingMs - (displayedCount - 1) * PULSE_PERIOD_MS,
      );
      nextPulseTimer = setTimeout(() => {
        fire();
        const nextCount = Math.max(
          0,
          Math.ceil((deadlineMs - performance.now()) / PULSE_PERIOD_MS),
        );
        scheduleNextPulse(nextCount);
      }, untilNextBoundary);
    };

    const initialRemainingMs = deadlineMs - performance.now();
    const initialPosition = getCountdownPosition(initialRemainingMs);
    const skipInitialPulse =
      initialPosition.count > 1 &&
      initialPosition.timeUntilNextNumber <= MIN_INITIAL_NUMBER_MS;

    if (skipInitialPulse) {
      nextPulseTimer = setTimeout(() => {
        fire();
        const nextCount = Math.max(
          0,
          Math.ceil((deadlineMs - performance.now()) / PULSE_PERIOD_MS),
        );
        scheduleNextPulse(nextCount);
      }, Math.max(1, initialPosition.timeUntilNextNumber));
    } else {
      fire();
      scheduleNextPulse(initialPosition.count);
    }

    return () => {
      if (nextPulseTimer) clearTimeout(nextPulseTimer);
      if (offTimer) clearTimeout(offTimer);
      setPulseOn(false);
    };
  }, [isCountdown, deadlineMs]);

  const showBorder = isCountdown || isRacing;
  const bright = isRacing || pulseOn;
  const accent = "var(--accent-primary)";

  return (
    <>
      {showBorder && (
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            borderRadius: "calc(var(--radius, 8px) * 2)",
            border: `1px solid ${accent}`,
            opacity: bright ? 1 : 0,
            boxShadow: bright
              ? `0 0 12px 0 color-mix(in srgb, ${accent} 35%, transparent)`
              : "0 0 0 0 transparent",
            transition: bright
              ? "none"
              : `opacity ${PULSE_FADE_MS}ms ease-in, box-shadow ${PULSE_FADE_MS}ms ease-out`,
          }}
        />
      )}
      {showCount && isCountdown && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
          <div
            key={count}
            className="countdown-number text-accent relative -top-6"
            style={{
              fontSize: "9rem",
              animation: "countdownPop 1s ease-out forwards",
            }}
          >
            {count}
          </div>
          <style>{`
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
      `}</style>
        </div>
      )}
      {showImage && (
        <div className="absolute top-0 left-0 pointer-events-none z-50 -translate-x-full -ml-1">
          <img
            src={bufoLetsGo}
            alt=""
            aria-hidden="true"
            className="w-10 h-10 sm:w-14 sm:h-14"
            style={{
              animation: "fadeInOut 2s ease-out forwards",
            }}
          />
          <style>{`
        @keyframes fadeInOut {
          0% {
            transform: scale(0.9) scaleX(-1);
          }
          20% {
            opacity: 1;
            transform: scale(1) scaleX(-1);
          }
          80% {
            opacity: 1;
            transform: scale(1) scaleX(-1);
          }
          100% {
            opacity: 0;
            transform: scale(0.8) scaleX(-1);
          }
        }
      `}</style>
        </div>
      )}
    </>
  );
};
