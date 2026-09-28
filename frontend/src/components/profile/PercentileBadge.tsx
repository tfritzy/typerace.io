import { useMemo } from "react";
import type { StatDistribution } from "@/types/stdb";

export function PercentileBadge({ distribution, value }: { distribution: StatDistribution | undefined, value: number | undefined }) {
    const displayPercentile = useMemo(() => {
        if (!distribution || value === undefined) return undefined;

        const val = BigInt(Math.floor(value));
        const bucketIndex = Math.min(
            distribution.buckets.length - 1,
            Math.max(0, Number(val / distribution.bucketSize))
        );
        let total = 0n;
        let countBelow = 0n;
        for (let i = 0; i < distribution.buckets.length; i++) {
            const count = distribution.buckets[i];
            total += count;
            if (i < bucketIndex) countBelow += count;
        }
        if (total === 0n) return null;

    }, [distribution, value]);

    if (!displayPercentile) return null;

    return (
        <span className="inline-flex items-center rounded-[5px] border border-current px-1.5 py-0.5 text-xs font-medium">
            Top {displayPercentile}%
        </span>
    );
}
