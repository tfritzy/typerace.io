import { useState, useEffect, useRef, useCallback } from "react";
import { type ItemIcon } from "./iconData";
import { IconImage } from "./SpriteIcon";
import { loadNote, saveNote, type Rarity } from "./notes";
import {
  type AttributeDefinition,
  type ItemAttribute,
  loadItemAttributes,
  saveItemAttributes,
} from "./attributes";
import { LucideIcon } from "./LucideIcon";
import { Plus, X } from "lucide-react";

const RARITIES: Rarity[] = ["common", "rare", "legendary"];

const RARITY_COLORS: Record<Rarity, string> = {
  common: "#9ece6a",
  rare: "#7aa2f7",
  legendary: "#e0af68",
};

interface ItemRowProps {
  icon: ItemIcon;
  displayName: string;
  selected: boolean;
  excluded: boolean;
  compact?: boolean;
  onSelect: () => void;
  onToggleExclude: () => void;
}

export function ItemRow({
  icon,
  displayName,
  selected,
  excluded,
  compact,
  onSelect,
  onToggleExclude,
}: ItemRowProps) {
  const iconSize = compact ? 36 : 48;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        borderLeft: selected ? "3px solid #7aa2f7" : "3px solid transparent",
        background: selected ? "rgba(205,214,244,0.1)" : "transparent",
        transition: "background 0.15s",
      }}
    >
      <button
        onClick={onSelect}
        style={{
          display: "flex",
          alignItems: "center",
          gap: compact ? 10 : 12,
          padding: compact ? "6px 10px" : "8px 12px",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          flex: 1,
          textAlign: "left",
          color: excluded ? "rgba(205,214,244,0.3)" : "#cdd6f4",
          opacity: excluded ? 0.5 : 1,
        }}
      >
        <IconImage filePath={icon.filePath} size={iconSize} />
        <span
          style={{
            fontSize: 13,
            fontFamily: "'Inter', sans-serif",
            textDecoration: excluded ? "line-through" : "none",
          }}
        >
          {displayName}
        </span>
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleExclude();
        }}
        title={excluded ? "Include in pack" : "Exclude from pack"}
        style={{
          background: "transparent",
          border: "none",
          cursor: "pointer",
          padding: compact ? "4px 12px" : "4px 10px",
          fontSize: compact ? 18 : 16,
          color: excluded ? "#9ece6a" : "rgba(205,214,244,0.3)",
          flexShrink: 0,
        }}
      >
        {excluded ? "↩" : "✕"}
      </button>
    </div>
  );
}

interface NoteEditorProps {
  icon: ItemIcon;
  displayName: string;
  definitions: AttributeDefinition[];
  onBack?: () => void;
  compact?: boolean;
  onNameChange: (defaultName: string, newName: string) => void;
  charges: number;
  onChargesChange: (defaultName: string, charges: number) => void;
  rarity: Rarity;
  onRarityChange: (defaultName: string, rarity: Rarity) => void;
  onItemAttrsChange?: (defaultName: string, attrs: ItemAttribute[]) => void;
}

export function NoteEditor({
  icon,
  displayName,
  definitions,
  onBack,
  compact,
  onNameChange,
  charges,
  onChargesChange,
  rarity,
  onRarityChange,
  onItemAttrsChange,
}: NoteEditorProps) {
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [itemAttrs, setItemAttrs] = useState<ItemAttribute[]>([]);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(displayName);
  const [attrSaveError, setAttrSaveError] = useState<string | null>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentItemRef = useRef(icon.defaultName);
  const pendingAttrSave = useRef<ItemAttribute[] | null>(null);

  useEffect(() => {
    currentItemRef.current = icon.defaultName;
    setLoaded(false);
    setEditingName(false);
    setNameInput(displayName);
    loadNote(icon.defaultName)
      .then((note) => {
        if (currentItemRef.current === icon.defaultName) {
          setText(note);
          setLoaded(true);
        }
      })
      .catch((err) => {
        console.error("Failed to load note:", err);
        if (currentItemRef.current === icon.defaultName) {
          setLoaded(true);
        }
      });
    loadItemAttributes(icon.defaultName)
      .then((attrs) => {
        if (currentItemRef.current === icon.defaultName) {
          setItemAttrs(attrs);
        }
      })
      .catch((err) => console.error("Failed to load item attributes:", err));
  }, [icon.defaultName]);

  useEffect(() => {
    setNameInput(displayName);
  }, [displayName]);

  useEffect(() => {
    return () => {
      if (pendingAttrSave.current) {
        saveItemAttributes(currentItemRef.current, pendingAttrSave.current).catch(
          (err) => console.error("Failed to flush attributes on unmount:", err)
        );
      }
    };
  }, []);

  const handleSave = useCallback(
    (value: string) => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
      saveTimerRef.current = setTimeout(() => {
        setSaving(true);
        saveNote(icon.defaultName, value).finally(() => setSaving(false));
      }, 400);
    },
    [icon.defaultName]
  );

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setText(value);
    handleSave(value);
  };

  const persistAttrs = useCallback(
    (next: ItemAttribute[]) => {
      setItemAttrs(next);
      setAttrSaveError(null);
      pendingAttrSave.current = next;
      onItemAttrsChange?.(icon.defaultName, next);
      saveItemAttributes(icon.defaultName, next)
        .then(() => {
          pendingAttrSave.current = null;
        })
        .catch((err) => {
          console.error("Failed to save item attributes:", err);
          setAttrSaveError(String(err?.message || err));
        });
    },
    [icon.defaultName, onItemAttrsChange]
  );

  const addAttribute = (defId: string) => {
    if (itemAttrs.some((a) => a.attributeId === defId)) return;
    persistAttrs([...itemAttrs, { attributeId: defId, value: "" }]);
  };

  const removeAttribute = (defId: string) => {
    persistAttrs(itemAttrs.filter((a) => a.attributeId !== defId));
  };

  const updateAttributeValue = (defId: string, value: string) => {
    persistAttrs(
      itemAttrs.map((a) => (a.attributeId === defId ? { ...a, value } : a))
    );
  };

  const commitNameEdit = () => {
    setEditingName(false);
    const trimmed = nameInput.trim();
    if (trimmed && trimmed !== displayName) {
      onNameChange(icon.defaultName, trimmed);
    } else {
      setNameInput(displayName);
    }
  };

  const unassigned = definitions.filter(
    (d) => !itemAttrs.some((a) => a.attributeId === d.id)
  );
  const defMap = new Map(definitions.map((d) => [d.id, d]));

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        padding: compact ? 16 : 20,
        overflow: "auto",
        gap: compact ? 12 : 16,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: compact ? 10 : 16,
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
        <IconImage filePath={icon.filePath} size={compact ? 40 : 48} />
        <div style={{ flex: 1 }}>
          {editingName ? (
            <input
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onBlur={commitNameEdit}
              onKeyDown={(e) => {
                if (e.key === "Enter") commitNameEdit();
                if (e.key === "Escape") {
                  setNameInput(displayName);
                  setEditingName(false);
                }
              }}
              autoFocus
              style={{
                fontSize: compact ? 14 : 16,
                fontWeight: 600,
                color: "#cdd6f4",
                background: "rgba(205,214,244,0.06)",
                border: "1px solid rgba(122,162,247,0.4)",
                borderRadius: 4,
                padding: "2px 6px",
                fontFamily: "'Inter', sans-serif",
                outline: "none",
                width: "100%",
              }}
            />
          ) : (
            <h2
              onClick={() => {
                setNameInput(displayName);
                setEditingName(true);
              }}
              style={{
                fontSize: compact ? 14 : 16,
                fontWeight: 600,
                margin: 0,
                color: "#cdd6f4",
                cursor: "pointer",
              }}
              title="Click to rename"
            >
              {displayName}
            </h2>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span
              style={{
                fontSize: 11,
                color: saving ? "#f7768e" : "rgba(205,214,244,0.4)",
              }}
            >
              {saving ? "saving..." : "saved"}
            </span>
            <span
              style={{
                fontSize: 10,
                color: "rgba(205,214,244,0.2)",
                fontFamily: "'Inter', sans-serif",
              }}
            >
              {icon.filePath}
            </span>
          </div>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          background: "rgba(205,214,244,0.04)",
          borderRadius: 6,
          padding: "8px 12px",
        }}
      >
        <span style={{ fontSize: 16 }}>⚡</span>
        <span
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "#e0af68",
            fontFamily: "'Inter', sans-serif",
            minWidth: 60,
          }}
        >
          Charges
        </span>
        <input
          type="number"
          min={0}
          value={charges}
          onChange={(e) => {
            const val = parseInt(e.target.value, 10);
            onChargesChange(icon.defaultName, isNaN(val) || val < 0 ? 0 : val);
          }}
          style={{
            width: 70,
            background: "rgba(205,214,244,0.06)",
            border: "1px solid rgba(205,214,244,0.1)",
            borderRadius: 4,
            color: "#cdd6f4",
            padding: "4px 8px",
            fontSize: 13,
            fontFamily: "'Inter', sans-serif",
            outline: "none",
            textAlign: "center",
          }}
        />
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          background: "rgba(205,214,244,0.04)",
          borderRadius: 6,
          padding: "8px 12px",
        }}
      >
        <span style={{ fontSize: 16 }}>💎</span>
        <span
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: RARITY_COLORS[rarity],
            fontFamily: "'Inter', sans-serif",
            minWidth: 60,
          }}
        >
          Rarity
        </span>
        <div style={{ display: "flex", gap: 6 }}>
          {RARITIES.map((r) => (
            <button
              key={r}
              onClick={() => onRarityChange(icon.defaultName, r)}
              style={{
                background:
                  rarity === r
                    ? `${RARITY_COLORS[r]}22`
                    : "rgba(205,214,244,0.06)",
                border:
                  rarity === r
                    ? `1.5px solid ${RARITY_COLORS[r]}`
                    : "1px solid rgba(205,214,244,0.1)",
                borderRadius: 4,
                color: rarity === r ? RARITY_COLORS[r] : "rgba(205,214,244,0.5)",
                padding: "4px 10px",
                fontSize: 12,
                fontFamily: "'Inter', sans-serif",
                cursor: "pointer",
                fontWeight: rarity === r ? 700 : 400,
                textTransform: "capitalize",
              }}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        <div
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: "rgba(205,214,244,0.4)",
            textTransform: "uppercase",
            letterSpacing: 1.2,
          }}
        >
          Attributes
        </div>
        {attrSaveError && (
          <div
            style={{
              background: "rgba(247,118,142,0.15)",
              border: "1px solid rgba(247,118,142,0.3)",
              borderRadius: 6,
              padding: "6px 10px",
              fontSize: 11,
              color: "#f7768e",
              fontFamily: "'Inter', sans-serif",
            }}
          >
            Save failed: {attrSaveError}
          </div>
        )}
        {itemAttrs.map((attr) => {
          const def = defMap.get(attr.attributeId);
          if (!def) return null;
          return (
            <div
              key={attr.attributeId}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                background: "rgba(205,214,244,0.04)",
                borderRadius: 6,
                padding: "6px 10px",
              }}
            >
              <LucideIcon name={def.icon} size={16} color={def.color} />
              <span
                style={{
                  fontSize: 13,
                  color: def.color,
                  fontFamily: "'Inter', sans-serif",
                  minWidth: 70,
                }}
              >
                {def.name}
              </span>
              <input
                value={attr.value}
                onChange={(e) =>
                  updateAttributeValue(attr.attributeId, e.target.value)
                }
                placeholder="value..."
                style={{
                  flex: 1,
                  background: "rgba(205,214,244,0.06)",
                  border: "1px solid rgba(205,214,244,0.1)",
                  borderRadius: 4,
                  color: "#cdd6f4",
                  padding: "4px 8px",
                  fontSize: 13,
                  fontFamily: "'Inter', sans-serif",
                  outline: "none",
                }}
              />
              <button
                onClick={() => removeAttribute(attr.attributeId)}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: "rgba(205,214,244,0.3)",
                  padding: 2,
                  display: "flex",
                  flexShrink: 0,
                }}
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
        {unassigned.length > 0 && (
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {unassigned.map((def) => (
              <button
                key={def.id}
                onClick={() => addAttribute(def.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  background: "rgba(205,214,244,0.04)",
                  border: "1px dashed rgba(205,214,244,0.15)",
                  borderRadius: 4,
                  color: "rgba(205,214,244,0.5)",
                  padding: "4px 8px",
                  fontSize: 12,
                  fontFamily: "'Inter', sans-serif",
                  cursor: "pointer",
                }}
              >
                <Plus size={12} />
                <LucideIcon name={def.icon} size={12} color={def.color} />
                {def.name}
              </button>
            ))}
          </div>
        )}
      </div>

      <textarea
        value={text}
        onChange={handleChange}
        disabled={!loaded}
        placeholder="Type notes here..."
        style={{
          flex: 1,
          background: "rgba(205,214,244,0.04)",
          border: "1px solid rgba(205,214,244,0.1)",
          borderRadius: 6,
          color: "#cdd6f4",
          padding: 12,
          fontSize: 13,
          fontFamily: "'Inter', sans-serif",
          resize: "none",
          outline: "none",
          lineHeight: 1.6,
          minHeight: compact ? 80 : 120,
        }}
      />
    </div>
  );
}
