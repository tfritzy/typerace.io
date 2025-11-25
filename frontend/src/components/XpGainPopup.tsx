import { useEffect } from "react";
import type { XpGain } from "../../module_bindings/xp_gain_type";

interface XpGainPopupProps {
    xpGain: XpGain;
    onComplete: () => void;
}

export const XpGainPopup = ({ xpGain, onComplete }: XpGainPopupProps) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onComplete();
        }, 5000);

        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <div
            className="rounded-lg px-4 py-3 shadow-lg min-w-[280px] animate-[modalFadeIn_0.3s_ease-out,modalFadeOut_0.3s_ease-in_5.3s_forwards]"
            style={{
                backgroundColor: 'var(--color-box-bg)',
                border: '1px solid var(--color-box-border)',
            }}
        >
            <div className="space-y-0.5 text-xs">
                {xpGain.multipliers.map((multiplier, index) => (
                    <MultiplierRow
                        key={index}
                        label={multiplier.label}
                        value={multiplier.value}
                    />
                ))}

                <div className="my-2 border-t" style={{ borderColor: 'rgba(255, 255, 255, 0.15)' }} />

                <div
                    className="flex items-center justify-between py-2 px-3 rounded font-semibold text-sm"
                    style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.08)',
                        color: 'rgba(255, 255, 255, 0.95)',
                    }}
                >
                    <span>Total XP</span>
                    <span
                        className="tabular-nums text-base"
                        style={{
                            color: 'rgba(255, 255, 255, 0.95)',
                        }}
                    >
                        +{xpGain.totalXp}
                    </span>
                </div>
            </div>
        </div>
    );
};

interface MultiplierRowProps {
    label: string;
    value: string;
}

const MultiplierRow = ({ label, value }: MultiplierRowProps) => {
    const isBonus = value.includes('×') && !value.includes('×1.0');

    return (
        <div
            className="flex items-center justify-between py-1.5 px-2"
            style={{
                color: isBonus ? 'rgba(255, 255, 255, 0.85)' : 'rgba(255, 255, 255, 0.65)',
            }}
        >
            <span className="font-medium text-sm">{label}</span>
            <span
                className="font-bold tabular-nums text-sm tracking-wide"
                style={{
                    color: isBonus ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.75)',
                }}
            >
                {value}
            </span>
        </div>
    );
};
