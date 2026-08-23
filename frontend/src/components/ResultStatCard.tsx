import { type ReactNode } from "react";
import { Box } from "./Box";

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
    <Box
      tone={isAccent ? "accent" : "default"}
      className="flex min-w-0 flex-col items-center justify-center rounded-lg p-3 text-center transition-all duration-300"
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
    </Box>
  );
}
