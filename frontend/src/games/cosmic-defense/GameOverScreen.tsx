import { useState, useCallback, useEffect } from "react";

type GameOverScreenProps = {
  wave: number;
  score: number;
  kills: number;
  onPlayAgain: () => void;
};

export const GameOverScreen = ({ wave, score, kills, onPlayAgain }: GameOverScreenProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    const text = `☄️ Cosmic Defense — Wave ${wave} | Score: ${score.toLocaleString()} | Kills: ${kills}`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {});
  }, [wave, score, kills]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key.toLowerCase() === "r") {
      e.preventDefault();
      onPlayAgain();
    }
    if (e.key.toLowerCase() === "c") {
      e.preventDefault();
      handleCopy();
    }
  }, [onPlayAgain, handleCopy]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <>
      <div
        className="absolute inset-0 z-[60] animate-fadeIn"
        style={{
          background:
            "radial-gradient(ellipse 80% 80% at 50% 50%, rgba(0,0,0,0.95) 20%, rgba(0,0,0,0.75) 65%, rgba(0,0,0,0.15) 100%)",
        }}
      />
      <div
        className="absolute inset-0 z-[70] flex items-center justify-center animate-fadeIn"
        style={{ pointerEvents: "auto" }}
      >
        <div className="flex flex-col items-center">
          <div
            className="text-[10px] uppercase tracking-[0.36em] mb-1.5"
            style={{ color: "#f38ba8", opacity: 0.85 }}
          >
            Mission Failed
          </div>
          <div
            className="text-[28px] font-bold uppercase tracking-[0.08em] mb-6 text-center"
            style={{
              color: "#f9e2af",
              textShadow: "0 0 28px rgba(249,226,175,0.45)",
            }}
          >
            Planet Destroyed
          </div>

          <div className="flex gap-8 mb-7">
            <div className="flex flex-col items-center gap-0.5">
              <span
                className="text-[10px] uppercase tracking-[0.28em]"
                style={{ color: "#a6adc8", opacity: 0.7 }}
              >
                Wave
              </span>
              <span
                className="text-[26px] font-bold tabular-nums"
                style={{ color: "#f9e2af" }}
              >
                {wave}
              </span>
            </div>
            <div
              style={{
                width: 1,
                alignSelf: "stretch",
                background: "rgba(255,255,255,0.08)",
              }}
            />
            <div className="flex flex-col items-center gap-0.5">
              <span
                className="text-[10px] uppercase tracking-[0.28em]"
                style={{ color: "#a6adc8", opacity: 0.7 }}
              >
                Score
              </span>
              <span
                className="text-[26px] font-bold tabular-nums"
                style={{ color: "#cdd6f4" }}
              >
                {score.toLocaleString()}
              </span>
            </div>
            <div
              style={{
                width: 1,
                alignSelf: "stretch",
                background: "rgba(255,255,255,0.08)",
              }}
            />
            <div className="flex flex-col items-center gap-0.5">
              <span
                className="text-[10px] uppercase tracking-[0.28em]"
                style={{ color: "#a6adc8", opacity: 0.7 }}
              >
                Kills
              </span>
              <span
                className="text-[26px] font-bold tabular-nums"
                style={{ color: "#a6e3a1" }}
              >
                {kills}
              </span>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              className="flex items-center gap-2.5 rounded-lg px-5 py-2 font-semibold text-[12px] transition-all"
              style={{
                background: "rgba(249,226,175,0.08)",
                border: "1px solid rgba(249,226,175,0.28)",
                color: "#f9e2af",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(249,226,175,0.18)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(249,226,175,0.08)";
              }}
              onClick={handleCopy}
            >
              {copied ? "Copied!" : "Copy Results"}
              <span
                className="text-[10px] font-bold rounded px-1.5 py-0.5"
                style={{
                  background: "rgba(249,226,175,0.12)",
                  border: "1px solid rgba(249,226,175,0.25)",
                  color: "#f9e2af",
                  opacity: 0.8,
                }}
              >
                C
              </span>
            </button>
            <button
              className="flex items-center gap-2.5 rounded-lg px-5 py-2 font-semibold text-[12px] transition-all"
              style={{
                background: "rgba(249,226,175,0.12)",
                border: "1px solid rgba(249,226,175,0.35)",
                color: "#f9e2af",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(249,226,175,0.22)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(249,226,175,0.12)";
              }}
              onClick={onPlayAgain}
            >
              Play Again
              <span
                className="text-[10px] font-bold rounded px-1.5 py-0.5"
                style={{
                  background: "rgba(249,226,175,0.12)",
                  border: "1px solid rgba(249,226,175,0.25)",
                  color: "#f9e2af",
                  opacity: 0.8,
                }}
              >
                R
              </span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
