import { useSyncExternalStore } from "react";

export type RaceTiming =
  | { phase: "idle" }
  | { phase: "countdown"; deadlineMs: number | null }
  | { phase: "racing" };

let timing: RaceTiming = { phase: "idle" };
let serverPhase: string | undefined;
let deadlineMs: number | null = null;
let countdownComplete = false;
let oneWayLatencyMs: number | null = null;
let completionTimer: ReturnType<typeof setTimeout> | null = null;
const listeners = new Set<() => void>();

const emitIfChanged = (next: RaceTiming) => {
  const changed =
    next.phase !== timing.phase ||
    (next.phase === "countdown" &&
      (timing.phase !== "countdown" ||
        next.deadlineMs !== timing.deadlineMs));
  if (!changed) return;

  timing = next;
  listeners.forEach((listener) => listener());
};

const updateTiming = () => {
  if (
    serverPhase === "Racing" ||
    (serverPhase === "Countdown" && countdownComplete)
  ) {
    emitIfChanged({ phase: "racing" });
  } else if (serverPhase === "Countdown") {
    emitIfChanged({ phase: "countdown", deadlineMs });
  } else {
    emitIfChanged({ phase: "idle" });
  }
};

const setOneWayLatency = (latencyMs: number | null) => {
  oneWayLatencyMs = latencyMs;
};

const setServerPhase = (phase?: string) => {
  serverPhase = phase;
  updateTiming();
};

const clear = () => {
  if (completionTimer) clearTimeout(completionTimer);
  completionTimer = null;
  deadlineMs = null;
  countdownComplete = false;
  updateTiming();
};

const reset = () => {
  serverPhase = undefined;
  clear();
};

const start = (durationMs: number) => {
  if (completionTimer) clearTimeout(completionTimer);

  const adjustedDurationMs = Math.max(
    0,
    durationMs - (oneWayLatencyMs ?? 0),
  );
  deadlineMs = performance.now() + adjustedDurationMs;
  countdownComplete = false;
  updateTiming();

  completionTimer = setTimeout(() => {
    completionTimer = null;
    countdownComplete = true;
    updateTiming();
  }, adjustedDurationMs);
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

const getSnapshot = () => timing;

export const useCountdownTiming = () => {
  const currentTiming = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getSnapshot,
  );

  return {
    timing: currentTiming,
    start,
    clear,
    reset,
    setServerPhase,
    setOneWayLatency,
  };
};
