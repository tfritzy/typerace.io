import { useEffect, useRef, useState } from "react";
import {
  Circle,
  Flag,
  Flame,
  Quote,
  Target,
  Trophy,
  type LucideIcon,
} from "lucide-react";
import type { XpAward } from "../types/stdb";

interface XpGainPopupProps {
  xpAward: XpAward;
  onComplete: () => void;
}

const EFFECT_DELAY_MS = 500;
const COMPLETED_HOLD_MS = 5_000;
const TOTAL_ANIMATION_MS = 440;

const effectIcons: Record<string, LucideIcon> = {
  streak: Flame,
  race: Flag,
  difficulty: Quote,
  placement: Trophy,
  accuracy: Target,
};

function formatEffectValue(operator: { tag: string }, value: number) {
  const formattedValue = new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 2,
  }).format(value);

  return operator.tag === "Add" ? `${formattedValue} xp` : `×${formattedValue}`;
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

function useAnimatedNumber(target: number) {
  const [displayedValue, setDisplayedValue] = useState(0);
  const displayedValueRef = useRef(0);

  useEffect(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      displayedValueRef.current = target;
      setDisplayedValue(target);
      return;
    }

    const startValue = displayedValueRef.current;
    const difference = target - startValue;
    const startTime = performance.now();
    let animationFrame = 0;

    const updateValue = (now: number) => {
      const progress = Math.min(1, (now - startTime) / TOTAL_ANIMATION_MS);
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      const nextValue = Math.round(startValue + difference * easedProgress);

      displayedValueRef.current = nextValue;
      setDisplayedValue(nextValue);

      if (progress < 1) animationFrame = requestAnimationFrame(updateValue);
    };

    animationFrame = requestAnimationFrame(updateValue);
    return () => cancelAnimationFrame(animationFrame);
  }, [target]);

  return displayedValue;
}

export const XpGainPopup = ({ xpAward, onComplete }: XpGainPopupProps) => {
  const revealCompleteMs =
    400 + Math.max(0, xpAward.effects.length - 1) * EFFECT_DELAY_MS;
  const lifetimeMs = revealCompleteMs + COMPLETED_HOLD_MS;
  const [visibleEffectCount, setVisibleEffectCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const targetTotal =
    visibleEffectCount === xpAward.effects.length
      ? xpAward.totalXp
      : calculateVisibleTotal(xpAward.effects, visibleEffectCount);
  const visibleTotal = useAnimatedNumber(targetTotal);

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
      className={`w-[min(15rem,calc(100vw-2rem))] rounded-md border border-border bg-card text-card-foreground transition-all duration-200 motion-reduce:transition-none ${
        isVisible ? "translate-y-0 opacity-100" : "-translate-y-1 opacity-0"
      }`}
    >
      <div className="p-3">
        {xpAward.effects.length > 0 && (
          <div className="space-y-2">
            {xpAward.effects.map((effect, index) => (
              <div
                key={`${effect.category}:${effect.label}:${index}`}
                className={`flex items-baseline justify-between gap-3 text-xs leading-[1.125rem] transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
                  index < visibleEffectCount
                    ? "translate-x-0 opacity-100"
                    : "-translate-x-1.5 opacity-0"
                }`}
              >
                <span className="flex min-w-0 items-center gap-2 font-medium text-muted-foreground">
                  {(() => {
                    const Icon = effectIcons[effect.category] ?? Circle;
                    return (
                      <Icon
                        aria-hidden="true"
                        className="size-3.5 shrink-0 text-muted-foreground"
                        strokeWidth={1.75}
                      />
                    );
                  })()}
                  <span className="truncate">{effect.label}</span>
                </span>
                <span className="shrink-0 font-mono font-medium tabular-nums text-muted-foreground">
                  {formatEffectValue(effect.operator, effect.value)}
                </span>
              </div>
            ))}
          </div>
        )}

        <div
          className={`flex items-baseline justify-between gap-3 ${
            xpAward.effects.length > 0 ? "mt-3" : ""
          }`}
        >
          <span className="text-xs font-medium text-card-foreground">Total</span>
          <p
            aria-label={`Total ${xpAward.totalXp} xp`}
            className="shrink-0 leading-none"
          >
            <span
              aria-hidden="true"
              className="font-mono text-lg font-semibold tabular-nums text-accent-primary"
            >
              {visibleTotal}
            </span>{" "}
            <span
              aria-hidden="true"
              className="text-[0.6875rem] font-medium text-muted-foreground"
            >
              xp
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};
