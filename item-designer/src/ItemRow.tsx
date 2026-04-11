import { useState, useEffect, useRef, useCallback } from "react";
import { SwordFrame } from "./spriteData";
import { SpriteIcon } from "./SpriteIcon";
import { loadNote, saveNote } from "./notes";

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
  onBack?: () => void;
  compact?: boolean;
}

export function NoteEditor({
  itemName,
  frame,
  onBack,
  compact,
}: NoteEditorProps) {
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
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
        }}
      />
    </div>
  );
}
