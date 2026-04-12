import { IconImage } from "./SpriteIcon";
import { type AttributeDefinition, type ItemAttribute, calculateItemPower } from "./attributes";
import { LucideIcon } from "./LucideIcon";

interface ItemPreviewProps {
  itemName: string;
  filePath: string;
  attributes: ItemAttribute[];
  definitions: AttributeDefinition[];
  charges: number;
  compact?: boolean;
}

function PreviewChargesBadge({ charges }: { charges: number }) {
  if (charges <= 0) return null;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 5,
        flexWrap: "wrap",
        justifyContent: "flex-end",
      }}
    >
      {Array.from({ length: charges }, (_, i) => (
        <div
          key={i}
          style={{
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #e0af68 0%, #c49a52 100%)",
            border: "1.5px solid rgba(224,175,104,0.6)",
            boxShadow: "0 0 6px rgba(224,175,104,0.4)",
          }}
        />
      ))}
    </div>
  );
}

function PreviewAttackBadge({ value }: { value: string }) {
  if (!value) return null;

  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: 44,
        height: 44,
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
            "0 0 10px rgba(247,118,142,0.4), inset 0 1px 2px rgba(255,255,255,0.2)",
        }}
      />
      <span
        style={{
          position: "relative",
          fontSize: value.length > 2 ? 11 : 16,
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

export function ItemPreview({
  itemName,
  filePath,
  attributes,
  definitions,
  charges,
  compact,
}: ItemPreviewProps) {
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
      style={{
        position: "relative",
        background:
          "linear-gradient(180deg, rgba(30,30,46,0.95) 0%, rgba(24,24,37,0.98) 100%)",
        border: "1px solid rgba(205,214,244,0.12)",
        borderRadius: 10,
        padding: compact ? "16px 16px 24px" : "24px 24px 32px",
        width: compact ? "100%" : 280,
        minWidth: compact ? undefined : 280,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: compact ? 10 : 14,
        boxShadow:
          "0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(205,214,244,0.05)",
        alignSelf: "flex-start",
      }}
    >
      <div
        style={{
          width: compact ? 72 : 96,
          height: compact ? 72 : 96,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "rgba(205,214,244,0.04)",
          borderRadius: 8,
          border: "1px solid rgba(205,214,244,0.08)",
        }}
      >
        <IconImage filePath={filePath} size={compact ? 64 : 80} />
      </div>

      <div
        style={{
          fontSize: compact ? 14 : 16,
          fontWeight: 700,
          color: "#c0caf5",
          textAlign: "center",
          fontFamily: "'Inter', sans-serif",
          letterSpacing: 0.3,
        }}
      >
        {itemName}
      </div>

      {otherAttrs.length > 0 && (
        <div
          style={{
            width: "100%",
            borderTop: "1px solid rgba(205,214,244,0.1)",
            paddingTop: compact ? 8 : 12,
            display: "flex",
            flexDirection: "column",
            gap: compact ? 6 : 8,
          }}
        >
          {otherAttrs.map((attr) => (
            <div
              key={attr.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "4px 0",
              }}
            >
              <LucideIcon name={attr.icon} size={16} color={attr.color} />
              <span
                style={{
                  fontSize: 13,
                  color: attr.color,
                  fontFamily: "'Inter', sans-serif",
                  flex: 1,
                }}
              >
                {attr.name}
              </span>
              <span
                style={{
                  fontSize: 13,
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

      {otherAttrs.length === 0 && !attackAttr && charges <= 0 && (
        <div
          style={{
            fontSize: 12,
            color: "rgba(205,214,244,0.2)",
            fontStyle: "italic",
          }}
        >
          No attributes assigned
        </div>
      )}

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
            alignItems: "center",
            width: "100%",
            marginTop: 8,
            paddingTop: 8,
            borderTop: "1px solid rgba(205,214,244,0.08)",
          }}
        >
          {attackAttr && <PreviewAttackBadge value={attackAttr.value} />}
          {charges > 0 && <PreviewChargesBadge charges={charges} />}
        </div>
      )}

      <div
        style={{
          width: "100%",
          marginTop: 8,
          paddingTop: 8,
          borderTop: "1px solid rgba(205,214,244,0.08)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 6,
        }}
      >
        <span
          style={{
            fontSize: 11,
            color: "rgba(205,214,244,0.35)",
            fontFamily: "'Inter', sans-serif",
            textTransform: "uppercase",
            letterSpacing: 1,
          }}
        >
          Power
        </span>
        <span
          style={{
            fontSize: 14,
            fontWeight: 700,
            color: "#bb9af7",
            fontFamily: "'Inter', sans-serif",
          }}
        >
          {calculateItemPower(attributes, definitions, charges)}
        </span>
      </div>
    </div>
  );
}
