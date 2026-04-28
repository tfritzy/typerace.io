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
      <div className="absolute inset-0 z-40" style={{ background: "rgba(0,0,0,0.82)" }} />
      <div
        className="absolute inset-0 z-50 flex flex-col items-center justify-center"
        style={{ pointerEvents: "auto" }}
      >
        <div
          className="text-[11px] uppercase tracking-[0.3em] mb-6"
          style={{ color: "#f9e2af", opacity: 0.7 }}
        >
          Relic Acquired
        </div>
        <div
          className="rounded-2xl flex flex-col items-center"
          style={{
            background: "rgba(12,14,30,0.98)",
            border: "1px solid rgba(249,226,175,0.25)",
            boxShadow: "0 0 60px rgba(249,226,175,0.12)",
            padding: "40px 56px 44px",
            minWidth: 320,
          }}
        >
          <div
            className="rounded-xl flex items-center justify-center mb-6"
            style={{
              width: 96,
              height: 96,
              background: "rgba(249,226,175,0.07)",
              border: "1px solid rgba(249,226,175,0.18)",
            }}
          >
            <img
              src={relic.sprite}
              alt={relic.name}
              style={{ width: 64, height: 64, imageRendering: "pixelated" }}
            />
          </div>
          <div
            className="text-[22px] font-bold mb-3"
            style={{ color: "#f9e2af", letterSpacing: "0.03em" }}
          >
            {relic.name}
          </div>
          <div
            className="text-[14px] text-center leading-relaxed mb-8"
            style={{ color: "#cdd6f4", maxWidth: 240 }}
          >
            {relic.description}
          </div>
          <button
            className="flex items-center gap-3 rounded-lg px-6 py-3 font-semibold text-[14px] transition-all"
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
            onClick={onContinue}
          >
            Continue
            <span
              className="text-[12px] font-bold rounded px-2 py-0.5"
              style={{
                background: "rgba(249,226,175,0.15)",
                border: "1px solid rgba(249,226,175,0.3)",
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
