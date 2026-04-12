import { useState, useCallback } from "react";
import { type AttributeDefinition, saveAttributeDefinitions } from "./attributes";
import { AVAILABLE_ICONS, ATTRIBUTE_COLORS } from "./iconPicker";
import { LucideIcon } from "./LucideIcon";
import { Trash2, Plus, Pencil, Check } from "lucide-react";

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
  const [newPowerRatio, setNewPowerRatio] = useState("1");
  const [newPerCharge, setNewPerCharge] = useState<boolean>(true);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editIcon, setEditIcon] = useState<string>(AVAILABLE_ICONS[0]);
  const [editColor, setEditColor] = useState<string>(ATTRIBUTE_COLORS[0] ?? "#f7768e");
  const [editPowerRatio, setEditPowerRatio] = useState("1");
  const [editPerCharge, setEditPerCharge] = useState<boolean>(true);

  const persist = useCallback(
    (next: AttributeDefinition[]) => {
      onChange(next);
      setSaveError(null);
      saveAttributeDefinitions(next).catch((err) => {
        console.error("Failed to save attribute definitions:", err);
        setSaveError(String(err?.message || err));
      });
    },
    [onChange]
  );

  const handleAdd = () => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    const id = crypto.randomUUID();
    const parsed = parseFloat(newPowerRatio);
    const next = [...definitions, { id, name: trimmed, icon: newIcon, color: newColor, powerRatio: isNaN(parsed) ? 1 : parsed, perCharge: newPerCharge }];
    persist(next);
    setNewName("");
    setNewPowerRatio("1");
    setNewPerCharge(true);
  };

  const handleRemove = (id: string) => {
    if (editingId === id) setEditingId(null);
    persist(definitions.filter((d) => d.id !== id));
  };

  const startEditing = (def: AttributeDefinition) => {
    setEditingId(def.id);
    setEditName(def.name);
    setEditIcon(def.icon);
    setEditColor(def.color);
    setEditPowerRatio(String(def.powerRatio ?? 1));
    setEditPerCharge(def.perCharge ?? true);
  };

  const commitEdit = () => {
    if (!editingId) return;
    const trimmed = editName.trim();
    if (!trimmed) {
      setEditingId(null);
      return;
    }
    const parsedRatio = parseFloat(editPowerRatio);
    persist(
      definitions.map((d) =>
        d.id === editingId
          ? { ...d, name: trimmed, icon: editIcon, color: editColor, powerRatio: isNaN(parsedRatio) ? 1 : parsedRatio, perCharge: editPerCharge }
          : d
      )
    );
    setEditingId(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleAdd();
  };

  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") commitEdit();
    if (e.key === "Escape") cancelEdit();
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

      {saveError && (
        <div
          style={{
            background: "rgba(247,118,142,0.15)",
            border: "1px solid rgba(247,118,142,0.3)",
            borderRadius: 6,
            padding: "8px 12px",
            marginBottom: 12,
            fontSize: 12,
            color: "#f7768e",
            fontFamily: "'Inter', sans-serif",
          }}
        >
          Save failed: {saveError}
        </div>
      )}

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
        <input
          type="number"
          step="any"
          value={newPowerRatio}
          onChange={(e) => setNewPowerRatio(e.target.value)}
          placeholder="Power ratio"
          title="Power ratio"
          style={{
            width: 80,
            background: "rgba(205,214,244,0.06)",
            border: "1px solid rgba(205,214,244,0.15)",
            borderRadius: 6,
            color: "#cdd6f4",
            padding: "8px 10px",
            fontSize: 13,
            fontFamily: "'Inter', sans-serif",
            outline: "none",
            textAlign: "center",
          }}
        />
        <button
          onClick={() => setNewPerCharge((v) => !v)}
          title={newPerCharge ? "Per charge (divides by charges)" : "Flat (not divided by charges)"}
          style={{
            background: newPerCharge ? "rgba(158,206,106,0.15)" : "rgba(205,214,244,0.06)",
            border: newPerCharge
              ? "1px solid rgba(158,206,106,0.4)"
              : "1px solid rgba(205,214,244,0.15)",
            borderRadius: 6,
            color: newPerCharge ? "#9ece6a" : "rgba(205,214,244,0.5)",
            padding: "8px 10px",
            fontSize: 11,
            fontFamily: "'Inter', sans-serif",
            cursor: "pointer",
            fontWeight: 600,
            whiteSpace: "nowrap",
          }}
        >
          {newPerCharge ? "⚡ /chg" : "― flat"}
        </button>
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
        {definitions.map((def) => {
          const isEditing = editingId === def.id;
          return (
            <div
              key={def.id}
              style={{
                display: "flex",
                flexDirection: "column",
                borderBottom: "1px solid rgba(205,214,244,0.06)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 12px",
                }}
              >
                {isEditing ? (
                  <>
                    <select
                      value={editIcon}
                      onChange={(e) => setEditIcon(e.target.value)}
                      style={{
                        background: "rgba(205,214,244,0.06)",
                        border: "1px solid rgba(122,162,247,0.4)",
                        borderRadius: 4,
                        color: "#cdd6f4",
                        padding: "4px 6px",
                        fontSize: 12,
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
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={handleEditKeyDown}
                      autoFocus
                      style={{
                        flex: 1,
                        fontSize: 14,
                        color: editColor,
                        fontFamily: "'Inter', sans-serif",
                        background: "rgba(205,214,244,0.06)",
                        border: "1px solid rgba(122,162,247,0.4)",
                        borderRadius: 4,
                        padding: "4px 8px",
                        outline: "none",
                      }}
                    />
                    <input
                      type="number"
                      step="any"
                      value={editPowerRatio}
                      onChange={(e) => setEditPowerRatio(e.target.value)}
                      title="Power ratio"
                      style={{
                        width: 60,
                        fontSize: 12,
                        color: "#cdd6f4",
                        fontFamily: "'Inter', sans-serif",
                        background: "rgba(205,214,244,0.06)",
                        border: "1px solid rgba(122,162,247,0.4)",
                        borderRadius: 4,
                        padding: "4px 6px",
                        outline: "none",
                        textAlign: "center",
                      }}
                    />
                    <button
                      onClick={() => setEditPerCharge((v) => !v)}
                      title={editPerCharge ? "Per charge" : "Flat"}
                      style={{
                        background: editPerCharge ? "rgba(158,206,106,0.15)" : "rgba(205,214,244,0.06)",
                        border: editPerCharge
                          ? "1px solid rgba(158,206,106,0.4)"
                          : "1px solid rgba(205,214,244,0.15)",
                        borderRadius: 4,
                        color: editPerCharge ? "#9ece6a" : "rgba(205,214,244,0.5)",
                        padding: "4px 6px",
                        fontSize: 10,
                        fontFamily: "'Inter', sans-serif",
                        cursor: "pointer",
                        fontWeight: 600,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {editPerCharge ? "⚡/chg" : "flat"}
                    </button>
                  </>
                ) : (
                  <>
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
                    <span
                      style={{
                        fontSize: 11,
                        color: "rgba(205,214,244,0.35)",
                        fontFamily: "'Inter', sans-serif",
                      }}
                    >
                      ×{def.powerRatio ?? 1}
                    </span>
                    <span
                      style={{
                        fontSize: 9,
                        color: def.perCharge ? "rgba(158,206,106,0.5)" : "rgba(205,214,244,0.25)",
                        fontFamily: "'Inter', sans-serif",
                      }}
                    >
                      {def.perCharge ? "/chg" : "flat"}
                    </span>
                  </>
                )}
                {isEditing ? (
                  <button
                    onClick={commitEdit}
                    style={{
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      color: "#9ece6a",
                      padding: 4,
                      display: "flex",
                    }}
                  >
                    <Check size={16} />
                  </button>
                ) : (
                  <button
                    onClick={() => startEditing(def)}
                    style={{
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      color: "rgba(205,214,244,0.3)",
                      padding: 4,
                      display: "flex",
                    }}
                  >
                    <Pencil size={16} />
                  </button>
                )}
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
              {isEditing && (
                <div
                  style={{
                    display: "flex",
                    gap: 4,
                    flexWrap: "wrap",
                    padding: "0 12px 10px",
                  }}
                >
                  {ATTRIBUTE_COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => setEditColor(c)}
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: 4,
                        background: c,
                        border:
                          editColor === c
                            ? "2px solid #cdd6f4"
                            : "2px solid transparent",
                        cursor: "pointer",
                        padding: 0,
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
