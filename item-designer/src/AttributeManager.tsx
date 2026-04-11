import { useState, useCallback } from "react";
import { AttributeDefinition, saveAttributeDefinitions } from "./attributes";
import { AVAILABLE_ICONS, ATTRIBUTE_COLORS } from "./iconPicker";
import { LucideIcon } from "./LucideIcon";
import { Trash2, Plus } from "lucide-react";

interface AttributeManagerProps {
  definitions: AttributeDefinition[];
  onChange: (defs: AttributeDefinition[]) => void;
  onBack?: () => void;
  compact?: boolean;
}

export function AttributeManager({
  definitions,
  onChange,
  onBack,
  compact,
}: AttributeManagerProps) {
  const [newName, setNewName] = useState("");
  const [newIcon, setNewIcon] = useState<string>(AVAILABLE_ICONS[0]);
  const [newColor, setNewColor] = useState<string>(ATTRIBUTE_COLORS[0] ?? "#f7768e");

  const persist = useCallback(
    (next: AttributeDefinition[]) => {
      onChange(next);
      saveAttributeDefinitions(next).catch(() => {});
    },
    [onChange]
  );

  const handleAdd = () => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    const id = crypto.randomUUID();
    const next = [...definitions, { id, name: trimmed, icon: newIcon, color: newColor }];
    persist(next);
    setNewName("");
  };

  const handleRemove = (id: string) => {
    persist(definitions.filter((d) => d.id !== id));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleAdd();
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        padding: compact ? 16 : 24,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: compact ? 16 : 20,
        }}
      >
        {onBack && (
          <button
            onClick={onBack}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: "#7aa2f7",
              fontSize: 22,
              padding: "4px 8px 4px 0",
              flexShrink: 0,
            }}
          >
            ←
          </button>
        )}
        <h2
          style={{
            fontSize: compact ? 15 : 18,
            fontWeight: 600,
            margin: 0,
            color: "#cdd6f4",
          }}
        >
          Attribute Definitions
        </h2>
      </div>

      <div
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 20,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Attribute name..."
          style={{
            background: "rgba(205,214,244,0.06)",
            border: "1px solid rgba(205,214,244,0.15)",
            borderRadius: 6,
            color: "#cdd6f4",
            padding: "8px 12px",
            fontSize: 14,
            fontFamily: "'Inter', sans-serif",
            outline: "none",
            flex: 1,
            minWidth: 120,
          }}
        />
        <select
          value={newIcon}
          onChange={(e) => setNewIcon(e.target.value)}
          style={{
            background: "rgba(205,214,244,0.06)",
            border: "1px solid rgba(205,214,244,0.15)",
            borderRadius: 6,
            color: "#cdd6f4",
            padding: "8px 10px",
            fontSize: 13,
            fontFamily: "'Inter', sans-serif",
            outline: "none",
          }}
        >
          {AVAILABLE_ICONS.map((icon) => (
            <option key={icon} value={icon}>
              {icon}
            </option>
          ))}
        </select>
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          {ATTRIBUTE_COLORS.map((c) => (
            <button
              key={c}
              onClick={() => setNewColor(c)}
              style={{
                width: 24,
                height: 24,
                borderRadius: 4,
                background: c,
                border: newColor === c ? "2px solid #cdd6f4" : "2px solid transparent",
                cursor: "pointer",
                padding: 0,
              }}
            />
          ))}
        </div>
        <button
          onClick={handleAdd}
          disabled={!newName.trim()}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: "#7aa2f7",
            border: "none",
            borderRadius: 6,
            color: "#1a1b26",
            padding: "8px 14px",
            fontSize: 13,
            fontWeight: 600,
            cursor: newName.trim() ? "pointer" : "not-allowed",
            opacity: newName.trim() ? 1 : 0.4,
          }}
        >
          <Plus size={16} />
          Add
        </button>
      </div>

      <div style={{ flex: 1, overflowY: "auto" }}>
        {definitions.length === 0 && (
          <div
            style={{
              color: "rgba(205,214,244,0.3)",
              fontSize: 14,
              padding: "20px 0",
              textAlign: "center",
            }}
          >
            No attributes defined yet
          </div>
        )}
        {definitions.map((def) => (
          <div
            key={def.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "10px 12px",
              borderBottom: "1px solid rgba(205,214,244,0.06)",
            }}
          >
            <LucideIcon name={def.icon} size={20} color={def.color} />
            <span
              style={{
                flex: 1,
                fontSize: 14,
                color: def.color,
                fontFamily: "'Inter', sans-serif",
              }}
            >
              {def.name}
            </span>
            <button
              onClick={() => handleRemove(def.id)}
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                color: "rgba(205,214,244,0.3)",
                padding: 4,
                display: "flex",
              }}
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
