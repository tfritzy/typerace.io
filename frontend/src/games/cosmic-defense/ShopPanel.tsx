import { SHIP_BLUEPRINTS, type ShipBlueprint } from "./shipCatalog";
import type { EntityType } from "./types";

interface ShopPanelProps {
  onSelectShip: (blueprint: ShipBlueprint) => void;
  onClose: () => void;
  shipPreviews: Map<EntityType, string>;
}

export const ShopPanel = ({ onSelectShip, onClose, shipPreviews }: ShopPanelProps) => {
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 20,
        background: "rgba(0, 0, 0, 0.6)",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "linear-gradient(180deg, rgba(12, 14, 30, 0.97) 0%, rgba(8, 10, 24, 0.97) 100%)",
          border: "1px solid rgba(120, 140, 200, 0.2)",
          borderRadius: 10,
          padding: "14px 16px 16px",
          maxWidth: 560,
          width: "90%",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 12,
            padding: "0 2px",
          }}
        >
          <span
            style={{
              color: "#cdd6f4",
              fontSize: 14,
              fontWeight: 600,
              letterSpacing: 0.5,
            }}
          >
            Defensive Fleet
          </span>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "#585b70",
              fontSize: 18,
              cursor: "pointer",
              padding: "0 2px",
              lineHeight: 1,
            }}
          >
            ✕
          </button>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(5, 1fr)",
            gap: 6,
          }}
        >
          {SHIP_BLUEPRINTS.map((bp) => (
            <div
              key={bp.entityType}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: "10px 4px 8px",
                borderRadius: 6,
                border: "1px solid rgba(120, 140, 200, 0.12)",
                background: "rgba(255, 255, 255, 0.02)",
                cursor: "pointer",
                transition: "background 0.15s, border-color 0.15s",
              }}
              onPointerEnter={(e) => {
                const el = e.currentTarget as HTMLDivElement;
                el.style.background = "rgba(120, 140, 200, 0.1)";
                el.style.borderColor = "rgba(120, 140, 200, 0.3)";
              }}
              onPointerLeave={(e) => {
                const el = e.currentTarget as HTMLDivElement;
                el.style.background = "rgba(255, 255, 255, 0.02)";
                el.style.borderColor = "rgba(120, 140, 200, 0.12)";
              }}
              onClick={() => onSelectShip(bp)}
            >
              <div
                style={{
                  width: 56,
                  height: 56,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 6,
                }}
              >
                {shipPreviews.get(bp.entityType) ? (
                  <img
                    src={shipPreviews.get(bp.entityType)}
                    alt={bp.entityType}
                    style={{
                      maxWidth: 56,
                      maxHeight: 56,
                      imageRendering: "pixelated",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      background: "rgba(120, 140, 200, 0.15)",
                      borderRadius: 4,
                    }}
                  />
                )}
              </div>
              <span
                style={{
                  color: "#bac2de",
                  fontSize: 10,
                  fontWeight: 500,
                  marginBottom: 2,
                  textAlign: "center",
                }}
              >
                {bp.entityType}
              </span>
              <span
                style={{
                  color: "#f9e2af",
                  fontSize: 9,
                  fontWeight: 500,
                }}
              >
                {bp.cost} gold
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
