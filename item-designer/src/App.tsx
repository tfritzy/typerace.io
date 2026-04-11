import { useState, useEffect, useCallback } from "react";
import { SpriteSheet, SwordFrame, SPRITESHEET_JSON_PATH } from "./spriteData";
import { ItemRow, NoteEditor } from "./ItemRow";
import { loadExcluded, saveExcluded } from "./notes";
import { useIsMobile } from "./useIsMobile";

export default function App() {
  const [spriteSheet, setSpriteSheet] = useState<SpriteSheet | null>(null);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [excluded, setExcluded] = useState<Set<string>>(new Set());
  const [mobileShowEditor, setMobileShowEditor] = useState(false);
  const isMobile = useIsMobile();

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

  const toggleExclude = useCallback((name: string) => {
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
  }, []);

  const handleSelect = useCallback(
    (name: string) => {
      setSelectedItem(name);
      if (isMobile) {
        setMobileShowEditor(true);
      }
    },
    [isMobile]
  );

  const handleBack = useCallback(() => {
    setMobileShowEditor(false);
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
  const included = entries.filter(([name]) => !excluded.has(name));
  const excludedItems = entries.filter(([name]) => excluded.has(name));
  const selectedFrame: SwordFrame | undefined = selectedItem
    ? spriteSheet.frames[selectedItem]
    : undefined;

  const sidebar = (
    <div
      style={{
        width: isMobile ? "100%" : 280,
        minWidth: isMobile ? undefined : 280,
        borderRight: isMobile ? "none" : "1px solid rgba(205,214,244,0.1)",
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
        height: isMobile ? "100dvh" : undefined,
      }}
    >
      <div
        style={{
          padding: isMobile ? "14px 16px" : "16px 12px",
          borderBottom: "1px solid rgba(205,214,244,0.1)",
          fontSize: isMobile ? 12 : 14,
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
          compact={isMobile}
          onSelect={() => handleSelect(name)}
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
              compact={isMobile}
              onSelect={() => handleSelect(name)}
              onToggleExclude={() => toggleExclude(name)}
            />
          ))}
        </>
      )}
    </div>
  );

  const editor =
    selectedItem && selectedFrame ? (
      <NoteEditor
        key={selectedItem}
        itemName={selectedItem}
        frame={selectedFrame}
        onBack={isMobile ? handleBack : undefined}
        compact={isMobile}
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
    );

  if (isMobile) {
    return mobileShowEditor ? (
      <div style={{ height: "100dvh", overflow: "hidden" }}>{editor}</div>
    ) : (
      sidebar
    );
  }

  return (
    <div
      style={{
        display: "flex",
        height: "100dvh",
        overflow: "hidden",
      }}
    >
      {sidebar}
      <div style={{ flex: 1, overflow: "hidden" }}>{editor}</div>
    </div>
  );
}
