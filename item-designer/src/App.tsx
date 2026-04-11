import { useState, useEffect, useCallback } from "react";
import { SpriteSheet, SwordFrame, SPRITESHEET_JSON_PATH } from "./spriteData";
import { ItemRow, NoteEditor } from "./ItemRow";
import { loadExcluded, saveExcluded } from "./notes";

export default function App() {
  const [spriteSheet, setSpriteSheet] = useState<SpriteSheet | null>(null);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [excluded, setExcluded] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch(SPRITESHEET_JSON_PATH)
      .then((r) => r.json())
      .then((data: SpriteSheet) => {
        setSpriteSheet(data);
        const firstItem = Object.keys(data.frames)[0];
        if (firstItem) {
          setSelectedItem(firstItem);
        }
      });

    loadExcluded()
      .then(setExcluded)
      .catch(() => {});
  }, []);

  const toggleExclude = useCallback(
    (name: string) => {
      setExcluded((prev) => {
        const next = new Set(prev);
        if (next.has(name)) {
          next.delete(name);
        } else {
          next.add(name);
        }
        saveExcluded(next).catch(() => {});
        return next;
      });
    },
    []
  );

  if (!spriteSheet) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100dvh",
          color: "rgba(205,214,244,0.5)",
        }}
      >
        Loading...
      </div>
    );
  }

  const entries = Object.entries(spriteSheet.frames);
  const included = entries.filter(([name]) => !excluded.has(name));
  const excludedItems = entries.filter(([name]) => excluded.has(name));
  const selectedFrame: SwordFrame | undefined = selectedItem
    ? spriteSheet.frames[selectedItem]
    : undefined;

  return (
    <div
      style={{
        display: "flex",
        height: "100dvh",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: 280,
          minWidth: 280,
          borderRight: "1px solid rgba(205,214,244,0.1)",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            padding: "16px 12px",
            borderBottom: "1px solid rgba(205,214,244,0.1)",
            fontSize: 14,
            fontWeight: 600,
            color: "#7aa2f7",
            fontFamily: "'Press Start 2P', monospace",
            letterSpacing: 1,
          }}
        >
          Swordtember
        </div>
        {included.map(([name, data]) => (
          <ItemRow
            key={name}
            name={name}
            frame={data}
            selected={name === selectedItem}
            excluded={false}
            onSelect={() => setSelectedItem(name)}
            onToggleExclude={() => toggleExclude(name)}
          />
        ))}
        {excludedItems.length > 0 && (
          <>
            <div
              style={{
                padding: "12px 12px 6px",
                fontSize: 10,
                fontWeight: 600,
                color: "rgba(205,214,244,0.25)",
                fontFamily: "'Inter', sans-serif",
                textTransform: "uppercase",
                letterSpacing: 1.5,
                borderTop: "1px solid rgba(205,214,244,0.06)",
                marginTop: 8,
              }}
            >
              Excluded ({excludedItems.length})
            </div>
            {excludedItems.map(([name, data]) => (
              <ItemRow
                key={name}
                name={name}
                frame={data}
                selected={name === selectedItem}
                excluded={true}
                onSelect={() => setSelectedItem(name)}
                onToggleExclude={() => toggleExclude(name)}
              />
            ))}
          </>
        )}
      </div>
      <div style={{ flex: 1, overflow: "hidden" }}>
        {selectedItem && selectedFrame ? (
          <NoteEditor
            key={selectedItem}
            itemName={selectedItem}
            frame={selectedFrame}
          />
        ) : (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              color: "rgba(205,214,244,0.3)",
            }}
          >
            Select an item
          </div>
        )}
      </div>
    </div>
  );
}
