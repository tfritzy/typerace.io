const SECOND_MS = 1000;

export interface CountdownStep {
  count: number | null;
  delayMs: number;
  complete: boolean;
}

export const getCountdownStep = (
  remainingMs: number,
  initial = false,
): CountdownStep => {
  const count = Math.max(0, Math.ceil(remainingMs / SECOND_MS));
  if (count === 0) {
    return { count: null, delayMs: 0, complete: true };
  }

  const delayMs = remainingMs - (count - 1) * SECOND_MS;
  const hidePartialInitialNumber = initial && delayMs !== SECOND_MS;

  return {
    count: hidePartialInitialNumber ? null : count,
    delayMs: Math.max(1, delayMs),
    complete: false,
  };
};
