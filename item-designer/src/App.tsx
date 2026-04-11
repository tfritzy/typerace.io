import { useState, useEffect } from "react";
import { SpriteSheet, SPRITESHEET_JSON_PATH } from "./spriteData";
import { ItemRow, NoteEditor } from "./ItemRow";

export default function App() {
  const [spriteSheet, setSpriteSheet] = useState<SpriteSheet | null>(null);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

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
  }, []);

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
  const selectedFrame = selectedItem ? spriteSheet.frames[selectedItem] : null;

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
        {entries.map(([name, data]) => (
          <ItemRow
            key={name}
            name={name}
            frame={data}
            selected={name === selectedItem}
            onSelect={() => setSelectedItem(name)}
          />
        ))}
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
