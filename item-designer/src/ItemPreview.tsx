import { IconImage } from "./SpriteIcon";
import { AttributeDefinition, ItemAttribute } from "./attributes";
import { LucideIcon } from "./LucideIcon";

interface ItemPreviewProps {
  itemName: string;
  filePath: string;
  attributes: ItemAttribute[];
  definitions: AttributeDefinition[];
  compact?: boolean;
}

export function ItemPreview({
  itemName,
  filePath,
  attributes,
  definitions,
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

  return (
    <div
      style={{
        background: "linear-gradient(180deg, rgba(30,30,46,0.95) 0%, rgba(24,24,37,0.98) 100%)",
        border: "1px solid rgba(205,214,244,0.12)",
        borderRadius: 10,
        padding: compact ? 16 : 24,
        width: compact ? "100%" : 280,
        minWidth: compact ? undefined : 280,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: compact ? 10 : 14,
        boxShadow: "0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(205,214,244,0.05)",
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

      {resolved.length > 0 && (
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
          {resolved.map((attr) => (
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

      {resolved.length === 0 && (
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
    </div>
  );
}
