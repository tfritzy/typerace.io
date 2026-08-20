import type { LucideIcon } from "lucide-react";

interface ProfileMetricLabelProps {
  icon: LucideIcon;
  label: string;
}

export const profileMetricCardClass =
  "flex min-h-[4.5rem] min-w-0 flex-col items-start rounded-lg border border-border/60 bg-card px-4 py-3";

export function ProfileMetricLabel({
  icon: Icon,
  label,
}: ProfileMetricLabelProps) {
  return (
    <span className="flex min-w-0 items-center gap-2 text-accent-primary/70">
      <Icon aria-hidden className="h-4 w-4 shrink-0" strokeWidth={1.75} />
      <span
        className="truncate text-xs font-semibold capitalize"
        title={label}
      >
        {label}
      </span>
    </span>
  );
}
