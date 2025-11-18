import { useState } from "react";
import type { PlayerProgress } from "../../module_bindings/player_progress_type";
import type { Player } from "../../module_bindings/player_type";
import { PlayerColor } from "../../module_bindings/player_color_type";
import { RaceResultsChart } from "./RaceResultsChart";
import { PlayerAvatar } from "./PlayerAvatar";
import { getFinalWpm, getRaceTime, getAccuracy } from "../utils/wpmCalculator";
import { formatStopwatchTime, getOrdinalPlacement } from "../utils/formatters";

interface RaceResultsProps {
    playerProgress: PlayerProgress;
    allPlayerProgress: PlayerProgress[];
    allPlayers: readonly Player[];
    raceStartTimestamp: bigint;
    placement: number;
}

export const RaceResults = ({
    playerProgress,
    allPlayerProgress,
    allPlayers,
    raceStartTimestamp,
    placement
}: RaceResultsProps) => {
    const [selectedPlayerId, setSelectedPlayerId] = useState<string>(playerProgress.playerId.toHexString());

    const selectedPlayerProgress = allPlayerProgress.find(
        pp => pp.playerId.toHexString() === selectedPlayerId
    ) || playerProgress;

    const getPlayerColor = (playerId: any): PlayerColor => {
        if (!playerId) {
            return PlayerColor.Amber;
        }
        const player = allPlayers.find(p => p.id.isEqual(playerId));
        return player?.color ?? PlayerColor.Amber;
    };

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
                gap: '12px',
                marginBottom: '12px',
                alignItems: 'stretch',
                minHeight: '100px'
            }}>
                <div style={{
                    flex: '1',
                    backgroundColor: 'var(--color-box-bg)',
                    border: `1px solid var(--color-box-border)`,
                    borderRadius: '8px',
                    padding: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.3s ease'
                }}>
                    <div style={{
                        fontSize: '10px',
                        color: isHighWpm ? 'var(--color-accent)' : 'rgba(255, 255, 255, 0.5)',
                        textTransform: 'uppercase',
                        letterSpacing: '1.2px',
                        marginBottom: '8px',
                        fontWeight: '600'
                    }}>
                        WPM
                    </div>
                    <div style={{
                        fontSize: '36px',
                        fontWeight: '700',
                        color: isHighWpm ? 'var(--color-accent)' : 'rgba(255, 255, 255, 0.95)',
                        lineHeight: '1'
                    }}>
                        {Math.round(finalWpm)}
                    </div>
                </div>

                <div style={{
                    flex: '1',
                    backgroundColor: 'var(--color-box-bg)',
                    border: `1px solid var(--color-box-border)`,
                    borderRadius: '8px',
                    padding: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.3s ease'
                }}>
                    <div style={{
                        fontSize: '10px',
                        color: isFirstPlace ? 'var(--color-accent)' : 'rgba(255, 255, 255, 0.5)',
                        textTransform: 'uppercase',
                        letterSpacing: '1.2px',
                        marginBottom: '8px',
                        fontWeight: '600'
                    }}>
                        Time
                    </div>
                    <div style={{
                        fontSize: '36px',
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
                    backgroundColor: 'var(--color-box-bg)',
                    border: `1px solid var(--color-box-border)`,
                    borderRadius: '8px',
                    padding: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.3s ease'
                }}>
                    <div style={{
                        fontSize: '10px',
                        color: isFirstPlace ? 'var(--color-accent)' : 'rgba(255, 255, 255, 0.5)',
                        textTransform: 'uppercase',
                        letterSpacing: '1.2px',
                        marginBottom: '8px',
                        fontWeight: '600'
                    }}>
                        Place
                    </div>
                    <div style={{
                        fontSize: '36px',
                        fontWeight: '700',
                        color: isFirstPlace ? 'var(--color-accent)' : 'rgba(255, 255, 255, 0.95)',
                        lineHeight: '1'
                    }}>
                        {getOrdinalPlacement(placement)}
                    </div>
                </div>

                <div style={{
                    flex: '1',
                    backgroundColor: 'var(--color-box-bg)',
                    border: `1px solid var(--color-box-border)`,
                    borderRadius: '8px',
                    padding: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.3s ease'
                }}>
                    <div style={{
                        fontSize: '10px',
                        color: isPerfectAccuracy ? 'var(--color-accent)' : 'rgba(255, 255, 255, 0.5)',
                        textTransform: 'uppercase',
                        letterSpacing: '1.2px',
                        marginBottom: '8px',
                        fontWeight: '600'
                    }}>
                        Accuracy
                    </div>
                    <div style={{
                        fontSize: '36px',
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
                padding: '12px'
            }}>
                <div style={{
                    display: 'flex',
                    gap: '12px',
                    marginBottom: '12px',
                    flexWrap: 'wrap'
                }}>
                    {allPlayerProgress.map((pp) => (
                        <button
                            key={pp.playerId.toHexString()}
                            onClick={() => setSelectedPlayerId(pp.playerId.toHexString())}
                            style={{
                                padding: '8px 12px',
                                backgroundColor: selectedPlayerId === pp.playerId.toHexString()
                                    ? 'rgba(255, 255, 255, 0.1)'
                                    : 'transparent',
                                color: selectedPlayerId === pp.playerId.toHexString()
                                    ? 'rgba(255, 255, 255, 0.95)'
                                    : 'rgba(255, 255, 255, 0.5)',
                                border: '1px solid var(--color-box-border)',
                                borderRadius: '6px',
                                fontSize: '13px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                letterSpacing: '0.5px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}
                        >
                            <PlayerAvatar
                                size={24}
                                identity={pp.playerId.toHexString()}
                                color={getPlayerColor(pp.playerId)}
                            />
                            {pp.playerName}
                        </button>
                    ))}
                </div>

                <RaceResultsChart
                    playerProgress={selectedPlayerProgress}
                    raceStartTimestamp={raceStartTimestamp}
                    playerColor={getPlayerColor(selectedPlayerProgress.playerId)}
                />
            </div>
        </div>
    );
};
