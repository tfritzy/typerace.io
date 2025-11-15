export function formatStopwatchTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const deciseconds = Math.floor((seconds % 1) * 10);
    
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(deciseconds)}`;
}

export function getOrdinalPlacement(placement: number): string {
    const suffixes = ["th", "st", "nd", "rd"];
    const value = placement % 100;
    return placement + (suffixes[(value - 20) % 10] || suffixes[value] || suffixes[0]);
}
