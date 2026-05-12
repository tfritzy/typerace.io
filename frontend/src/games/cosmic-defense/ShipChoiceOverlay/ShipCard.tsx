import { ChevronRight } from "lucide-react";
import { FRIENDLY_CONFIG_MAP, getScaledConfig } from "../enemyConfig";
import type { EntityType } from "../types";
import { ACCENT_COLOR, plain } from "./textSegments";
import { SHIP_BLUEPRINT_MAP } from "../shipCatalog";

const CARD_WIDTH = 180;
const CARD_HEIGHT = 270;

interface ShipCardProps {
  entityType: EntityType;
  hotkey: number;
  preview: string | undefined;
  isUpgrade: boolean;
  currentLevel: number;
  onSelect: (entityType: EntityType) => void;
}

export const ShipCard = ({
  entityType,
  hotkey,
  preview,
  isUpgrade,
  currentLevel,
  onSelect,
}: ShipCardProps) => {
  const baseConfig = FRIENDLY_CONFIG_MAP.get(entityType)!;
  const currentConfig = isUpgrade
    ? getScaledConfig(baseConfig, currentLevel)
    : baseConfig;
  const displayConfig = isUpgrade
    ? getScaledConfig(baseConfig, currentLevel + 1)
    : baseConfig;

  const accent = ACCENT_COLOR;
  const blueprint = SHIP_BLUEPRINT_MAP.get(entityType);
  const descriptionFn = blueprint?.descriptionFn;
  const cardText = descriptionFn
    ? isUpgrade
      ? descriptionFn(currentConfig, displayConfig)
      : descriptionFn(displayConfig)
    : [plain("")];
  const charges = displayConfig.chargesRequired;
  const truncated = charges > 10;
  return (
    <button
      onClick={() => onSelect(entityType)}
      className="relative flex flex-col rounded-xl cursor-pointer transition-all text-left overflow-hidden"
      style={{
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        background:
          "linear-gradient(160deg, #20223f 0%, #161731 50%, #0a0c1c 100%)",
        border: "1px solid rgba(255,255,255,0.08)",
        boxShadow:
          "0 20px 44px -18px rgba(0,0,0,0.9), 0 0 0 1px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-5px)";
        e.currentTarget.style.boxShadow =
          "0 28px 52px -16px rgba(0,0,0,0.95), 0 0 0 1px rgba(255,255,255,0.18), inset 0 1px 0 rgba(255,255,255,0.08)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow =
          "0 20px 44px -18px rgba(0,0,0,0.9), 0 0 0 1px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)";
      }}
    >
      <div
        className="flex items-center justify-between px-3 pt-2.5"
        style={{
          fontSize: 9,
          fontWeight: 700,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <span
          style={{
            color: isUpgrade ? "#fbbf24" : "#86efac",
          }}
        >
          {isUpgrade ? "Upgrade" : "New Ship"}
        </span>
        <span
          style={{
            color: "#94a3b8",
            fontFamily: "ui-monospace, SFMono-Regular, monospace",
            letterSpacing: 0,
            display: "inline-flex",
            alignItems: "center",
          }}
        >
          {isUpgrade ? (
            <>
              Lv {currentLevel}
              <ChevronRight
                size={9}
                strokeWidth={2.5}
                style={{ color: "#64748b", margin: "0 1px" }}
              />
              {currentLevel + 1}
            </>
          ) : (
            "Lv 1"
          )}
        </span>
      </div>

      <div
        className="relative mx-2 mt-2 rounded-md overflow-hidden flex items-center justify-center"
        style={{
          height: 100,
          background: `radial-gradient(ellipse at 50% 50%, ${accent}1a 0%, ${accent}08 40%, rgba(0,0,0,0.55) 85%)`,
          border: "1px solid rgba(255,255,255,0.06)",
          boxShadow:
            `inset 0 0 0 1px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06), inset 0 -1px 0 rgba(0,0,0,0.5), 0 0 12px -10px ${accent}33`,
        }}
      >
        {preview && (
          <img
            src={preview}
            alt={entityType}
            style={{
              width: 64,
              height: 64,
              objectFit: "contain",
              imageRendering: "pixelated",
              filter: `drop-shadow(0 3px 6px rgba(0,0,0,0.55)) drop-shadow(0 0 3px ${accent}55)`,
            }}
          />
        )}
      </div>

      <div
        className="relative z-10 flex items-center justify-between mx-1.5 -mt-2 px-2.5 py-1.5 rounded-md"
        style={{
          border: "1px solid rgba(255,255,255,0.12)",
          background:
            "linear-gradient(160deg, rgba(22,23,49,0.9) 0%, rgba(10,12,28,0.9) 100%)",
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,0.05), inset 0 -1px 0 rgba(0,0,0,0.35), 0 6px 12px -8px rgba(0,0,0,0.8)",
        }}
      >
        <span
          className="font-bold tracking-wide truncate"
          style={{
            fontSize: 13,
            fontFamily: "system-ui, sans-serif",
            color: "#f1f5f9",
            textShadow: `0 0 10px ${accent}55`,
          }}
        >
          {entityType}
        </span>
        <div className="flex gap-1 ml-2 shrink-0 items-center">
          {truncated ? (
            <>
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: `radial-gradient(circle at 30% 30%, ${accent} 0%, ${accent}cc 60%, ${accent}55 100%)`,
                  boxShadow: `0 0 5px ${accent}cc, inset 0 1px 0 rgba(255,255,255,0.5)`,
                  border: "1px solid rgba(0,0,0,0.5)",
                }}
              />
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: accent,
                  textShadow: `0 0 8px ${accent}66`,
                  lineHeight: 1,
                  fontFamily: "ui-monospace, SFMono-Regular, monospace",
                }}
              >
                ×{charges}
              </span>
            </>
          ) : (
            Array.from({ length: charges }, (_, i) => (
              <span
                key={i}
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: `radial-gradient(circle at 30% 30%, ${accent} 0%, ${accent}cc 60%, ${accent}55 100%)`,
                  boxShadow: `0 0 5px ${accent}cc, inset 0 1px 0 rgba(255,255,255,0.5)`,
                  border: "1px solid rgba(0,0,0,0.5)",
                }}
              />
            ))
          )}
        </div>
      </div>

      <div
        className="relative px-3 pt-2 pb-3 leading-snug flex-1"
        style={{
          fontFamily: "system-ui, sans-serif",
          fontSize: 11,
          color: "#cbd5e1",
        }}
      >
        {cardText.map((seg, i) => (
          <span
            key={i}
            style={{
              color: seg.color ?? "#cbd5e1",
              fontWeight: seg.bold ? 700 : 400,
              textShadow: seg.color && seg.bold ? `0 0 10px ${seg.color}66` : undefined,
            }}
          >
            {seg.node ?? seg.text}
          </span>
        ))}
      </div>
      <div
        className="flex items-center justify-center pb-2 pt-1 select-none"
        style={{
          color: "#94a3b8",
          fontFamily: "ui-monospace, SFMono-Regular, monospace",
          fontSize: 13,
          fontWeight: 700,
          letterSpacing: "0.04em",
        }}
      >
        {hotkey}
      </div>
    </button>
  );
};
