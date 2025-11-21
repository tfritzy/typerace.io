export function xpProgressToNextLevel(currentXp: number, xpRequiredForNextLevel: number): number {
    if (xpRequiredForNextLevel === 0) {
        return 0;
    }
    
    return Math.min(100, Math.max(0, (currentXp / xpRequiredForNextLevel) * 100));
}
