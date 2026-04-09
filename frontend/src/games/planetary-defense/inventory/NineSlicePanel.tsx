import { type ReactNode } from "react";

interface NineSlicePanelProps {
  children: ReactNode;
  className?: string;
}

export const NineSlicePanel = ({ children, className = "" }: NineSlicePanelProps) => {
  return (
    <div
      className={`relative rounded-lg border border-indigo-400/20 bg-slate-900/85 backdrop-blur-sm shadow-lg shadow-indigo-950/40 p-1.5 ${className}`}
    >
      {children}
    </div>
  );
};
