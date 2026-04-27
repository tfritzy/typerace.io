export function throttle<T>(callback: (value: T) => void, waitMs: number) {
  let lastRunAt = 0;
  let timeout: ReturnType<typeof setTimeout> | null = null;
  let pendingValue: T;
  let hasPendingValue = false;

  const runPending = () => {
    if (!hasPendingValue) return;
    const value = pendingValue;
    hasPendingValue = false;
    lastRunAt = Date.now();
    callback(value);
  };

  const throttled = (value: T) => {
    pendingValue = value;
    hasPendingValue = true;
    const elapsed = Date.now() - lastRunAt;

    if (lastRunAt === 0 || elapsed >= waitMs) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      runPending();
      return;
    }

    if (!timeout) {
      timeout = setTimeout(() => {
        timeout = null;
        runPending();
      }, waitMs - elapsed);
    }
  };

  throttled.cancel = () => {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
    hasPendingValue = false;
  };

  return throttled;
}
