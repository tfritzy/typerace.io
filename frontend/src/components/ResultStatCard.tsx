import { type ReactNode } from "react";

interface ResultStatCardProps {
  label: string;
  value: ReactNode;
  isAccent: boolean;
}

export function ResultStatCard({
  label,
  value,
  isAccent,
}: ResultStatCardProps) {
  return (
    <div
      className={`flex min-w-0 flex-col items-center justify-center rounded-lg border p-3 text-center transition-all duration-300 ${
        isAccent
          ? "border-accent-primary/40 bg-accent-primary/10"
          : "border-border bg-card"
      }`}
    >
      <div
        className={`mb-1 text-[10px] font-semibold uppercase tracking-[1.2px] ${
          isAccent ? "text-accent-primary" : "text-muted-foreground"
        }`}
      >
        {label}
      </div>
      <div
        className={`font-mono text-2xl font-bold leading-none sm:text-3xl ${
          isAccent ? "text-accent-primary" : "text-secondary-foreground"
        }`}
      >
        {value}
      </div>
    </div>
  );
}
