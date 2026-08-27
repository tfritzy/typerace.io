export function formatStopwatchTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const deciseconds = Math.floor((seconds % 1) * 10);

  if (minutes > 0) {
    return `${minutes}m ${secs}.${deciseconds}s`;
  }
  return `${secs}.${deciseconds}s`;
}

export function formatShareTime(seconds: number): string {
  const totalHundredths = Math.floor(seconds * 100);
  const minutes = Math.floor(totalHundredths / 6_000);
  const remainingHundredths = totalHundredths % 6_000;
  const wholeSeconds = Math.floor(remainingHundredths / 100);
  const hundredths = remainingHundredths % 100;

  return `${String(minutes).padStart(2, "0")}:${String(wholeSeconds).padStart(2, "0")}.${String(hundredths).padStart(2, "0")}`;
}

export function getOrdinalPlacement(placement: number): string {
  if (placement === -1) return "-";

  const suffixes = ["th", "st", "nd", "rd"];
  const value = placement % 100;
  return (
    placement + (suffixes[(value - 20) % 10] || suffixes[value] || suffixes[0])
  );
}

export function formatNumber(num: number): string {
  return num.toLocaleString("en-US");
}

export function formatTimeSpent(milliseconds: number): string {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    return `${minutes}m`;
  } else {
    return `${totalSeconds}s`;
  }
}
