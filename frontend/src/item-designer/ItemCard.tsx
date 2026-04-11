import { IconImage } from "./SpriteIcon";
import { type AttributeDefinition, type ItemAttribute } from "./attributes";
import { LucideIcon } from "./LucideIcon";

interface ItemCardProps {
  itemName: string;
  filePath: string;
  attributes: ItemAttribute[];
  definitions: AttributeDefinition[];
  charges: number;
  selected: boolean;
  excluded: boolean;
  onSelect: () => void;
  onToggleExclude: () => void;
}

function ChargesBadge({ charges }: { charges: number }) {
  if (charges <= 0) return null;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 4,
        flexWrap: "wrap",
        justifyContent: "flex-end",
      }}
    >
      {Array.from({ length: charges }, (_, i) => (
        <div
          key={i}
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #e0af68 0%, #c49a52 100%)",
            border: "1.5px solid rgba(224,175,104,0.6)",
            boxShadow: "0 0 5px rgba(224,175,104,0.4)",
          }}
        />
      ))}
    </div>
  );
}

function AttackBadge({ value }: { value: string }) {
  if (!value) return null;

  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: 36,
        height: 36,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(135deg, #f7768e 0%, #d65d75 100%)",
          borderRadius: "50%",
          border: "2px solid rgba(247,118,142,0.6)",
          boxShadow:
            "0 0 8px rgba(247,118,142,0.4), inset 0 1px 2px rgba(255,255,255,0.2)",
        }}
      />
      <span
        style={{
          position: "relative",
          fontSize: value.length > 2 ? 10 : 14,
          fontWeight: 800,
          color: "#1a1b26",
          fontFamily: "'Inter', sans-serif",
          lineHeight: 1,
        }}
      >
        {value}
      </span>
    </div>
  );
}

export function ItemCard({
  itemName,
  filePath,
  attributes,
  definitions,
  charges,
  selected,
  excluded,
  onSelect,
  onToggleExclude,
}: ItemCardProps) {
  const defMap = new Map(definitions.map((d) => [d.id, d]));
  const resolved = attributes
    .map((a) => {
      const def = defMap.get(a.attributeId);
      if (!def) return null;
      return { ...def, value: a.value };
    })
    .filter(Boolean) as (AttributeDefinition & { value: string })[];

  const attackAttr = resolved.find(
    (a) => a.name.toLowerCase() === "attack"
  );
  const otherAttrs = resolved.filter(
    (a) => a.name.toLowerCase() !== "attack"
  );

  return (
    <div
      onClick={onSelect}
      style={{
        position: "relative",
        background: selected
          ? "linear-gradient(180deg, rgba(122,162,247,0.12) 0%, rgba(30,30,46,0.95) 100%)"
          : "linear-gradient(180deg, rgba(30,30,46,0.95) 0%, rgba(24,24,37,0.98) 100%)",
        border: selected
          ? "2px solid rgba(122,162,247,0.5)"
          : "1px solid rgba(205,214,244,0.12)",
        borderRadius: 10,
        padding: "16px 12px 20px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
        cursor: "pointer",
        opacity: excluded ? 0.4 : 1,
        boxShadow: selected
          ? "0 4px 20px rgba(122,162,247,0.2), inset 0 1px 0 rgba(205,214,244,0.08)"
          : "0 2px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(205,214,244,0.05)",
        transition: "box-shadow 0.15s, border-color 0.15s",
        minHeight: 200,
      }}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleExclude();
        }}
        title={excluded ? "Include in pack" : "Exclude from pack"}
        style={{
          position: "absolute",
          top: 4,
          right: 4,
          background: "transparent",
          border: "none",
          cursor: "pointer",
          padding: "2px 6px",
          fontSize: 12,
          color: excluded ? "#9ece6a" : "rgba(205,214,244,0.2)",
          lineHeight: 1,
          zIndex: 1,
        }}
      >
        {excluded ? "↩" : "✕"}
      </button>

      <div
        style={{
          width: 56,
          height: 56,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "rgba(205,214,244,0.04)",
          borderRadius: 8,
          border: "1px solid rgba(205,214,244,0.08)",
        }}
      >
        <IconImage filePath={filePath} size={48} />
      </div>

      <div
        style={{
          fontSize: 12,
          fontWeight: 700,
          color: excluded ? "rgba(205,214,244,0.4)" : "#c0caf5",
          textAlign: "center",
          fontFamily: "'Inter', sans-serif",
          letterSpacing: 0.2,
          lineHeight: 1.3,
          textDecoration: excluded ? "line-through" : "none",
        }}
      >
        {itemName}
      </div>

      {otherAttrs.length > 0 && (
        <div
          style={{
            width: "100%",
            borderTop: "1px solid rgba(205,214,244,0.08)",
            paddingTop: 6,
            display: "flex",
            flexDirection: "column",
            gap: 3,
          }}
        >
          {otherAttrs.map((attr) => (
            <div
              key={attr.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "2px 0",
              }}
            >
              <LucideIcon name={attr.icon} size={12} color={attr.color} />
              <span
                style={{
                  fontSize: 10,
                  color: attr.color,
                  fontFamily: "'Inter', sans-serif",
                  flex: 1,
                  opacity: 0.8,
                }}
              >
                {attr.name}
              </span>
              <span
                style={{
                  fontSize: 10,
                  color: "#cdd6f4",
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 600,
                }}
              >
                {attr.value}
              </span>
            </div>
          ))}
        </div>
      )}

      <div style={{ flex: 1 }} />

      {(attackAttr || charges > 0) && (
        <div
          style={{
            display: "flex",
            justifyContent:
              attackAttr && charges > 0
                ? "space-between"
                : attackAttr
                  ? "flex-start"
                  : "flex-end",
            alignItems: "flex-end",
            width: "100%",
            marginTop: 4,
          }}
        >
          {attackAttr && <AttackBadge value={attackAttr.value} />}
          {charges > 0 && <ChargesBadge charges={charges} />}
        </div>
      )}
    </div>
  );
}
