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
            className="rounded-lg px-3 py-2 shadow-lg min-w-[260px] animate-[modalFadeIn_0.3s_ease-out,modalFadeOut_0.3s_ease-in_5.3s_forwards]"
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

                <div className="my-1.5 border-t" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />

                <div
                    className="flex items-center justify-between py-1 px-2 rounded font-semibold"
                    style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        color: 'rgba(255, 255, 255, 0.9)'
                    }}
                >
                    <span>Total</span>
                    <span className="tabular-nums" style={{ color: 'var(--color-accent)' }}>
                        +{xpGain.totalXp} XP
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
    return (
        <div
            className="flex items-center justify-between py-1 px-2 rounded"
            style={{
                color: 'rgba(255, 255, 255, 0.7)'
            }}
        >
            <span className="font-medium">{label}</span>
            <span className="font-bold tabular-nums">{value}</span>
        </div>
    );
};
