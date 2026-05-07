import { useState } from "react";
import { Skull, Copy, Check, RotateCcw } from "lucide-react";

type GameOverScreenProps = {
  wave: number;
  score: number;
  kills: number;
  onPlayAgain: () => void;
};

export const GameOverScreen = ({ wave, score, kills, onPlayAgain }: GameOverScreenProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const text = `🌍 Cosmic Defense\nWave: ${wave} | Score: ${score.toLocaleString()} | Kills: ${kills}`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {});
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-[rgba(10,10,26,0.85)]">
      <div
        className="flex flex-col items-center gap-5 rounded-2xl border border-[rgba(249,226,175,0.25)] px-10 py-8 shadow-[0_0_48px_rgba(249,226,175,0.12)]"
        style={{ background: "rgba(17,17,27,0.96)", minWidth: 260 }}
      >
        <div className="flex flex-col items-center gap-1">
          <Skull className="w-10 h-10 text-[#f38ba8]" />
          <div className="text-[22px] font-bold uppercase tracking-[0.1em] text-[#f38ba8]">
            Planet Destroyed
          </div>
        </div>

        <div className="flex flex-col items-center gap-3 w-full">
          <div className="flex w-full justify-between gap-6">
            <div className="flex flex-col items-center flex-1 gap-0.5 rounded-xl border border-[rgba(255,255,255,0.06)] py-2.5 px-3" style={{ background: "rgba(255,255,255,0.04)" }}>
              <span className="text-[10px] uppercase tracking-[0.18em] text-[#a6adc8]">Wave</span>
              <span className="text-[20px] font-bold text-[#f9e2af] tabular-nums">{wave}</span>
            </div>
            <div className="flex flex-col items-center flex-1 gap-0.5 rounded-xl border border-[rgba(255,255,255,0.06)] py-2.5 px-3" style={{ background: "rgba(255,255,255,0.04)" }}>
              <span className="text-[10px] uppercase tracking-[0.18em] text-[#a6adc8]">Score</span>
              <span className="text-[20px] font-bold text-[#cdd6f4] tabular-nums">{score.toLocaleString()}</span>
            </div>
            <div className="flex flex-col items-center flex-1 gap-0.5 rounded-xl border border-[rgba(255,255,255,0.06)] py-2.5 px-3" style={{ background: "rgba(255,255,255,0.04)" }}>
              <span className="text-[10px] uppercase tracking-[0.18em] text-[#a6adc8]">Kills</span>
              <span className="text-[20px] font-bold text-[#a6e3a1] tabular-nums">{kills}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 w-full">
          <button
            onClick={handleCopy}
            className="flex items-center justify-center gap-2 w-full rounded-xl border border-[rgba(249,226,175,0.2)] py-2 text-[13px] font-semibold text-[#f9e2af] transition-colors hover:bg-[rgba(249,226,175,0.08)] active:bg-[rgba(249,226,175,0.12)]"
            style={{ background: "rgba(249,226,175,0.04)" }}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy Results
              </>
            )}
          </button>
          <button
            onClick={onPlayAgain}
            className="flex items-center justify-center gap-2 w-full rounded-xl py-2.5 text-[13px] font-bold text-[#1e1e2e] transition-colors hover:opacity-90 active:opacity-80"
            style={{ background: "#cdd6f4" }}
          >
            <RotateCcw className="w-4 h-4" />
            Play Again
          </button>
        </div>
      </div>
    </div>
  );
};
