import { useEffect } from "react";
import type { XpGain } from "../types/stdb";

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
            className="rounded-lg px-4 py-3 shadow-lg min-w-[280px] animate-[modalFadeIn_0.3s_ease-out,modalFadeOut_0.3s_ease-in_5.3s_forwards] bg-card border border-border"
        >
            <div className="space-y-0.5 text-xs">
                {xpGain.multipliers.map((multiplier: any, index: number) => (
                    <MultiplierRow
                        key={index}
                        label={multiplier.label}
                        value={multiplier.value}
                    />
                ))}

                <div className="my-2 border-t border-border" />

                <div
                    className="flex items-center justify-between py-2 px-3 rounded font-semibold text-sm bg-secondary text-secondary-foreground"
                >
                    <span>Total XP</span>
                    <span
                        className="tabular-nums text-base text-secondary-foreground"
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
            className={`flex items-center justify-between py-1.5 px-2 ${isBonus ? 'text-secondary-foreground' : 'text-muted-foreground'}`}
        >
            <span className="font-medium text-sm">{label}</span>
            <span
                className={`font-bold tabular-nums text-sm tracking-wide ${isBonus ? 'text-secondary-foreground' : 'text-muted-foreground'}`}
            >
                {value}
            </span>
        </div>
    );
};
