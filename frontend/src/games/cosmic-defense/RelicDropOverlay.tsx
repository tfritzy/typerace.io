import { useEffect, useCallback } from "react";
import { RELIC_MAP, type RelicId } from "./relics";

interface RelicDropOverlayProps {
  relicId: RelicId;
  onContinue: () => void;
}

export const RelicDropOverlay = ({ relicId, onContinue }: RelicDropOverlayProps) => {
  const relic = RELIC_MAP.get(relicId);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "c") {
        e.preventDefault();
        onContinue();
      }
    },
    [onContinue]
  );

  useEffect(() => {
    if (!relic) return;
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown, relic]);

  if (!relic) return null;

  return (
    <>
      <style>{`
        @keyframes relic-icon-drop {
          0%   { transform: translateY(-90px) scale(0.3) rotate(-8deg); opacity: 0; }
          55%  { transform: translateY(10px)  scale(1.08) rotate(2deg); opacity: 1; }
          75%  { transform: translateY(-4px)  scale(0.97) rotate(-1deg); opacity: 1; }
          100% { transform: translateY(0)     scale(1)    rotate(0deg); opacity: 1; }
        }
        @keyframes relic-content-in {
          from { transform: translateY(20px); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
      `}</style>

      <div
        className="fixed inset-0 z-40"
        style={{
          background:
            "radial-gradient(ellipse 75% 75% at 50% 50%, rgba(0,0,0,0.88) 30%, rgba(0,0,0,0.55) 65%, rgba(0,0,0,0.0) 100%)",
        }}
      />

      <div
        className="fixed inset-0 z-50 flex flex-col items-center justify-center"
        style={{ pointerEvents: "auto" }}
      >
        <img
          src={relic.sprite}
          alt={relic.name}
          style={{
            width: 160,
            height: 160,
            imageRendering: "pixelated",
            filter: "drop-shadow(0 0 32px rgba(249,226,175,0.55))",
            animation: "relic-icon-drop 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards",
          }}
        />

        <div
          style={{
            animation: "relic-content-in 0.4s ease-out 0.55s both",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <div
            className="text-[11px] uppercase tracking-[0.3em] mt-7 mb-2 text-center"
            style={{ color: "#f9e2af", opacity: 0.6 }}
          >
            Relic Acquired
          </div>
          <div
            className="text-[24px] font-bold text-center mb-2"
            style={{ color: "#f9e2af", letterSpacing: "0.03em", textShadow: "0 0 20px rgba(249,226,175,0.5)" }}
          >
            {relic.name}
          </div>
          <div
            className="text-[13px] text-center leading-relaxed mb-7"
            style={{ color: "#cdd6f4", maxWidth: 260, opacity: 0.85 }}
          >
            {relic.description}
          </div>
          <button
            className="flex items-center gap-3 rounded-lg px-6 py-2.5 font-semibold text-[13px] transition-all"
            style={{
              background: "rgba(249,226,175,0.1)",
              border: "1px solid rgba(249,226,175,0.3)",
              color: "#f9e2af",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(249,226,175,0.2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(249,226,175,0.1)";
            }}
            onClick={onContinue}
          >
            Continue
            <span
              className="text-[11px] font-bold rounded px-1.5 py-0.5"
              style={{
                background: "rgba(249,226,175,0.15)",
                border: "1px solid rgba(249,226,175,0.28)",
                color: "#f9e2af",
              }}
            >
              C
            </span>
          </button>
        </div>
      </div>
    </>
  );
};
