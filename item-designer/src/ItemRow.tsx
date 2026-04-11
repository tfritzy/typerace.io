import { useState, useEffect, useRef, useCallback } from "react";
import { SwordFrame } from "./spriteData";
import { SpriteIcon } from "./SpriteIcon";
import { loadNote, saveNote } from "./notes";
import {
  AttributeDefinition,
  ItemAttribute,
  loadItemAttributes,
  saveItemAttributes,
} from "./attributes";
import { ItemPreview } from "./ItemPreview";
import { LucideIcon } from "./LucideIcon";
import { Plus, X } from "lucide-react";

interface ItemRowProps {
  name: string;
  frame: SwordFrame;
  selected: boolean;
  excluded: boolean;
  compact?: boolean;
  onSelect: () => void;
  onToggleExclude: () => void;
}

export function ItemRow({
  name,
  frame,
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
        <SpriteIcon frame={frame} size={iconSize} />
        <span
          style={{
            fontSize: 13,
            fontFamily: "'Inter', sans-serif",
            textDecoration: excluded ? "line-through" : "none",
          }}
        >
          {name}
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
  itemName: string;
  frame: SwordFrame;
  definitions: AttributeDefinition[];
  onBack?: () => void;
  compact?: boolean;
}

export function NoteEditor({
  itemName,
  frame,
  definitions,
  onBack,
  compact,
}: NoteEditorProps) {
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [itemAttrs, setItemAttrs] = useState<ItemAttribute[]>([]);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const attrSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentItemRef = useRef(itemName);

  useEffect(() => {
    currentItemRef.current = itemName;
    setLoaded(false);
    loadNote(itemName)
      .then((note) => {
        if (currentItemRef.current === itemName) {
          setText(note);
          setLoaded(true);
        }
      })
      .catch(() => {
        if (currentItemRef.current === itemName) {
          setLoaded(true);
        }
      });
    loadItemAttributes(itemName)
      .then((attrs) => {
        if (currentItemRef.current === itemName) {
          setItemAttrs(attrs);
        }
      })
      .catch(() => {});
  }, [itemName]);

  const handleSave = useCallback(
    (value: string) => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
      saveTimerRef.current = setTimeout(() => {
        setSaving(true);
        saveNote(itemName, value).finally(() => setSaving(false));
      }, 400);
    },
    [itemName]
  );

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setText(value);
    handleSave(value);
  };

  const persistAttrs = useCallback(
    (next: ItemAttribute[]) => {
      setItemAttrs(next);
      if (attrSaveTimerRef.current) {
        clearTimeout(attrSaveTimerRef.current);
      }
      attrSaveTimerRef.current = setTimeout(() => {
        saveItemAttributes(itemName, next).catch(() => {});
      }, 400);
    },
    [itemName]
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
        padding: compact ? 16 : 24,
        overflow: "auto",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: compact ? 10 : 16,
          marginBottom: compact ? 12 : 16,
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
        <SpriteIcon frame={frame} size={compact ? 48 : 64} />
        <div>
          <h2
            style={{
              fontSize: compact ? 15 : 18,
              fontWeight: 600,
              margin: 0,
              color: "#cdd6f4",
            }}
          >
            {itemName}
          </h2>
          <span
            style={{
              fontSize: 12,
              color: saving ? "#f7768e" : "rgba(205,214,244,0.4)",
            }}
          >
            {saving ? "saving..." : "saved"}
          </span>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: compact ? 16 : 24,
          flex: 1,
          minHeight: 0,
          flexDirection: compact ? "column" : "row",
        }}
      >
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: 12,
            minWidth: 0,
          }}
        >
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
                      minWidth: 80,
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
              fontSize: 14,
              fontFamily: "'Inter', sans-serif",
              resize: "none",
              outline: "none",
              lineHeight: 1.6,
              minHeight: compact ? 120 : 200,
            }}
          />
        </div>

        <div
          style={{
            flexShrink: 0,
            display: "flex",
            justifyContent: compact ? "center" : "flex-start",
          }}
        >
          <ItemPreview
            itemName={itemName}
            frame={frame}
            attributes={itemAttrs}
            definitions={definitions}
            compact={compact}
          />
        </div>
      </div>
    </div>
  );
}
