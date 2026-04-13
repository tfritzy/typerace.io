import { SHIP_BLUEPRINTS, type ShipBlueprint } from "./shipCatalog";

const containerStyle: React.CSSProperties = {
  position: "absolute",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 20,
  background: "rgba(0, 0, 0, 0.55)",
};

const panelStyle: React.CSSProperties = {
  background: "rgba(15, 15, 35, 0.95)",
  border: "1px solid rgba(255, 255, 255, 0.15)",
  borderRadius: 8,
  padding: "16px 20px",
  display: "flex",
  flexDirection: "column",
  gap: 10,
  minWidth: 220,
};

const titleStyle: React.CSSProperties = {
  color: "#a6adc8",
  fontSize: 13,
  fontWeight: 600,
  textAlign: "center",
  marginBottom: 4,
};

const itemStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "6px 10px",
  borderRadius: 4,
  border: "1px solid rgba(255,255,255,0.1)",
  cursor: "pointer",
  transition: "background 0.15s",
  background: "rgba(255,255,255,0.03)",
};

const nameStyle: React.CSSProperties = {
  color: "#cdd6f4",
  fontSize: 12,
};

const costStyle: React.CSSProperties = {
  color: "#f9e2af",
  fontSize: 11,
};

const closeStyle: React.CSSProperties = {
  fontSize: 11,
  color: "#a6adc8",
  background: "none",
  border: "1px solid rgba(255,255,255,0.15)",
  borderRadius: 4,
  padding: "4px 10px",
  cursor: "pointer",
  marginTop: 4,
  alignSelf: "center",
};

interface ShopPanelProps {
  onSelectShip: (blueprint: ShipBlueprint) => void;
  onClose: () => void;
}

export const ShopPanel = ({ onSelectShip, onClose }: ShopPanelProps) => {
  return (
    <div style={containerStyle} onClick={onClose}>
      <div style={panelStyle} onClick={(e) => e.stopPropagation()}>
        <div style={titleStyle}>Defensive Ships</div>
        {SHIP_BLUEPRINTS.map((bp) => (
          <div
            key={bp.entityType}
            style={itemStyle}
            onPointerEnter={(e) => {
              (e.currentTarget as HTMLDivElement).style.background =
                "rgba(255,255,255,0.08)";
            }}
            onPointerLeave={(e) => {
              (e.currentTarget as HTMLDivElement).style.background =
                "rgba(255,255,255,0.03)";
            }}
            onClick={() => onSelectShip(bp)}
          >
            <span style={nameStyle}>{bp.name}</span>
            <span style={costStyle}>{bp.cost} gold</span>
          </div>
        ))}
        <button style={closeStyle} onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
};
