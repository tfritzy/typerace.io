import type { PlayerProgress } from "../../module_bindings/player_progress_type";
import { RaceResultsChart } from "./RaceResultsChart";
import { ProgressOverTimeChart } from "./ProgressOverTimeChart";
import { getFinalWpm, getRaceTime, getAccuracy } from "../utils/wpmCalculator";
import { formatStopwatchTime, getOrdinalPlacement } from "../utils/formatters";

interface RaceResultsProps {
    playerProgress: PlayerProgress;
    allPlayerProgress: PlayerProgress[];
    phraseLength: number;
    raceStartTimestamp: bigint;
    placement: number;
}

export const RaceResults = ({
    playerProgress,
    allPlayerProgress,
    phraseLength,
    raceStartTimestamp,
    placement
}: RaceResultsProps) => {
    const finalWpm = getFinalWpm(playerProgress);
    const raceTime = getRaceTime(playerProgress);
    const accuracy = getAccuracy(playerProgress.characterHistory);

    const isFirstPlace = placement === 1;
    const isPerfectAccuracy = accuracy === 100;
    const isHighWpm = finalWpm >= 100;

    return (
        <div style={{ width: '100%' }}>
            <div style={{
                display: 'flex',
                gap: '16px',
                marginBottom: '16px',
                alignItems: 'stretch',
                minHeight: '140px'
            }}>
                <div style={{
                    flex: '1',
                    backgroundColor: isHighWpm ? 'rgba(255, 183, 0, 0.08)' : 'var(--color-box-bg)',
                    border: `1px solid ${isHighWpm ? 'rgba(255, 183, 0, 0.3)' : 'var(--color-box-border)'}`,
                    borderRadius: '8px',
                    padding: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.3s ease'
                }}>
                    <div style={{
                        fontSize: '11px',
                        color: isHighWpm ? 'var(--color-accent)' : 'rgba(255, 255, 255, 0.5)',
                        textTransform: 'uppercase',
                        letterSpacing: '1.2px',
                        marginBottom: '12px',
                        fontWeight: '600'
                    }}>
                        WPM
                    </div>
                    <div style={{
                        fontSize: '48px',
                        fontWeight: '700',
                        color: isHighWpm ? 'var(--color-accent)' : 'rgba(255, 255, 255, 0.95)',
                        lineHeight: '1'
                    }}>
                        {Math.round(finalWpm)}
                    </div>
                </div>

                <div style={{
                    flex: '1',
                    backgroundColor: isFirstPlace ? 'rgba(255, 183, 0, 0.08)' : 'var(--color-box-bg)',
                    border: `1px solid ${isFirstPlace ? 'rgba(255, 183, 0, 0.3)' : 'var(--color-box-border)'}`,
                    borderRadius: '8px',
                    padding: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.3s ease'
                }}>
                    <div style={{
                        fontSize: '11px',
                        color: isFirstPlace ? 'var(--color-accent)' : 'rgba(255, 255, 255, 0.5)',
                        textTransform: 'uppercase',
                        letterSpacing: '1.2px',
                        marginBottom: '12px',
                        fontWeight: '600'
                    }}>
                        Time
                    </div>
                    <div style={{
                        fontSize: '48px',
                        fontWeight: '700',
                        color: isFirstPlace ? 'var(--color-accent)' : 'rgba(255, 255, 255, 0.95)',
                        fontFamily: 'monospace',
                        lineHeight: '1',
                        letterSpacing: '0.02em'
                    }}>
                        {formatStopwatchTime(raceTime)}
                    </div>
                </div>

                <div style={{
                    flex: '1',
                    backgroundColor: isFirstPlace ? 'rgba(255, 183, 0, 0.08)' : 'var(--color-box-bg)',
                    border: `1px solid ${isFirstPlace ? 'rgba(255, 183, 0, 0.3)' : 'var(--color-box-border)'}`,
                    borderRadius: '8px',
                    padding: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.3s ease'
                }}>
                    <div style={{
                        fontSize: '11px',
                        color: isFirstPlace ? 'var(--color-accent)' : 'rgba(255, 255, 255, 0.5)',
                        textTransform: 'uppercase',
                        letterSpacing: '1.2px',
                        marginBottom: '12px',
                        fontWeight: '600'
                    }}>
                        Place
                    </div>
                    <div style={{
                        fontSize: '48px',
                        fontWeight: '700',
                        color: isFirstPlace ? 'var(--color-accent)' : 'rgba(255, 255, 255, 0.95)',
                        lineHeight: '1'
                    }}>
                        {getOrdinalPlacement(placement)}
                    </div>
                </div>

                <div style={{
                    flex: '1',
                    backgroundColor: isPerfectAccuracy ? 'rgba(255, 183, 0, 0.08)' : 'var(--color-box-bg)',
                    border: `1px solid ${isPerfectAccuracy ? 'rgba(255, 183, 0, 0.3)' : 'var(--color-box-border)'}`,
                    borderRadius: '8px',
                    padding: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.3s ease'
                }}>
                    <div style={{
                        fontSize: '11px',
                        color: isPerfectAccuracy ? 'var(--color-accent)' : 'rgba(255, 255, 255, 0.5)',
                        textTransform: 'uppercase',
                        letterSpacing: '1.2px',
                        marginBottom: '12px',
                        fontWeight: '600'
                    }}>
                        Accuracy
                    </div>
                    <div style={{
                        fontSize: '48px',
                        fontWeight: '700',
                        color: isPerfectAccuracy ? 'var(--color-accent)' : 'rgba(255, 255, 255, 0.95)',
                        lineHeight: '1'
                    }}>
                        {Math.round(accuracy)}%
                    </div>
                </div>
            </div>

            <div style={{
                backgroundColor: 'var(--color-box-bg)',
                border: '1px solid var(--color-box-border)',
                borderRadius: '8px',
                padding: '24px'
            }}>
                <RaceResultsChart
                    playerProgress={playerProgress}
                    raceStartTimestamp={raceStartTimestamp}
                />
            </div>

            <div style={{
                backgroundColor: 'var(--color-box-bg)',
                border: '1px solid var(--color-box-border)',
                borderRadius: '8px',
                padding: '24px',
                marginTop: '16px'
            }}>
                <div style={{
                    fontSize: '11px',
                    color: 'rgba(255, 255, 255, 0.5)',
                    textTransform: 'uppercase',
                    letterSpacing: '1.2px',
                    marginBottom: '16px',
                    fontWeight: '600'
                }}>
                    Race Progress
                </div>
                <ProgressOverTimeChart
                    allPlayerProgress={allPlayerProgress}
                    phraseLength={phraseLength}
                    raceStartTimestamp={raceStartTimestamp}
                />
            </div>
        </div>
    );
};
