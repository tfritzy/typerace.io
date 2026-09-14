import { useEffect, useState } from "react";
import type { XpAward } from "../types/stdb";

interface XpGainPopupProps {
  xpAward: XpAward;
  onComplete: () => void;
}

const EFFECT_DELAY_MS = 300;
const COMPLETED_HOLD_MS = 5_000;

function formatEffectValue(operator: { tag: string }, value: number) {
  const symbol = operator.tag === "Add" ? "+" : "×";
  return `${symbol}${new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 2,
  }).format(value)}`;
}

function calculateVisibleTotal(
  effects: XpAward["effects"],
  visibleEffectCount: number,
) {
  const total = effects
    .slice(0, visibleEffectCount)
    .reduce((current, effect) => {
      if (effect.operator.tag === "Multiply") return current * effect.value;
      return current + effect.value;
    }, 0);

  return Math.round(total);
}

export const XpGainPopup = ({ xpAward, onComplete }: XpGainPopupProps) => {
  const revealCompleteMs =
    400 + Math.max(0, xpAward.effects.length - 1) * EFFECT_DELAY_MS;
  const lifetimeMs = revealCompleteMs + COMPLETED_HOLD_MS;
  const [visibleEffectCount, setVisibleEffectCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const visibleTotal =
    visibleEffectCount === xpAward.effects.length
      ? xpAward.totalXp
      : calculateVisibleTotal(xpAward.effects, visibleEffectCount);

  useEffect(() => {
    const timers = [
      setTimeout(() => setIsVisible(true), 0),
      ...xpAward.effects.map((_, index) =>
        setTimeout(
          () => setVisibleEffectCount(index + 1),
          200 + index * EFFECT_DELAY_MS,
        ),
      ),
      setTimeout(() => setIsVisible(false), lifetimeMs - 180),
      setTimeout(onComplete, lifetimeMs),
    ];

    return () => timers.forEach(clearTimeout);
  }, [lifetimeMs, onComplete, xpAward.effects]);

  return (
    <div
      className={`w-[min(20rem,calc(100vw-2rem))] overflow-hidden rounded-lg border border-border bg-card shadow-xl transition-all duration-200 motion-reduce:transition-none ${
        isVisible ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0"
      }`}
    >
      <div className="px-4 pb-3 pt-4">
        <div className="mb-3 flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-md bg-accent-primary/10 font-mono text-[0.65rem] font-bold tracking-tight text-accent-primary ring-1 ring-accent-primary/20">
            XP
          </div>
          <div className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Experience earned
          </div>
        </div>
        <div className="space-y-0.5">
          {xpAward.effects.map((effect, index) => (
            <div
              key={`${effect.category}:${effect.label}:${index}`}
              className={`flex items-center justify-between gap-6 rounded px-1 py-1.5 transition-all duration-200 motion-reduce:transition-none ${
                index < visibleEffectCount
                  ? "translate-x-0 opacity-100"
                  : "translate-x-2 opacity-0"
              }`}
            >
              <div className="min-w-0 truncate text-sm font-medium text-card-foreground">
                {effect.label}
              </div>
              <span className="shrink-0 font-mono text-sm font-semibold tabular-nums text-accent-primary">
                {formatEffectValue(effect.operator, effect.value)}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-2 flex items-center justify-between rounded-md border border-accent-primary/20 bg-accent-primary/5 px-3 py-2.5">
          <span className="text-sm font-semibold text-card-foreground">Total</span>
          <span
            key={visibleEffectCount}
            className="font-mono text-base font-bold tabular-nums text-accent-primary"
          >
            +{visibleTotal} XP
          </span>
        </div>
      </div>
    </div>
  );
};
