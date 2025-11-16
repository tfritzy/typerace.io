export function xpRequiredForLevel(level: number): number {
    if (level <= 1) {
        return 0;
    }
    
    if (level > 100) {
        return 5000;
    }
    
    const baseXp = 100.0;
    const maxXp = 5000.0;
    const growthRate = Math.log(maxXp / baseXp) / (100.0 - 2.0);
    
    return Math.round(baseXp * Math.exp(growthRate * (level - 2)));
}

export function totalXpForLevel(level: number): number {
    let total = 0;
    for (let i = 2; i <= level; i++) {
        total += xpRequiredForLevel(i);
    }
    return total;
}

export function xpProgressToNextLevel(currentXp: number, currentLevel: number): number {
    const totalXpForCurrentLevel = totalXpForLevel(currentLevel);
    const xpIntoCurrentLevel = currentXp - totalXpForCurrentLevel;
    const xpNeededForNextLevel = xpRequiredForLevel(currentLevel + 1);
    
    if (xpNeededForNextLevel === 0) {
        return 0;
    }
    
    return Math.min(100, Math.max(0, (xpIntoCurrentLevel / xpNeededForNextLevel) * 100));
}
