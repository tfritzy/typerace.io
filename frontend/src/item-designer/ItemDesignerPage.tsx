import { useState, useEffect, useCallback, useRef } from "react";
import { ICONS, type ItemIcon } from "./iconData";
import { ItemRow, NoteEditor } from "./ItemRow";
import {
  loadExcluded,
  saveExcluded,
  loadNameOverrides,
  saveNameOverrides,
  loadNote,
  loadCharges,
  saveCharges,
} from "./notes";
import {
  type AttributeDefinition,
  loadAttributeDefinitions,
  loadItemAttributes,
} from "./attributes";
import { AttributeManager } from "./AttributeManager";
import { useIsMobile } from "./useIsMobile";
import { Settings, Download } from "lucide-react";

type View = "items" | "attributes";

export function ItemDesignerPage() {
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [excluded, setExcluded] = useState<Set<string>>(new Set());
  const [definitions, setDefinitions] = useState<AttributeDefinition[]>([]);
  const [nameOverrides, setNameOverrides] = useState<Record<string, string>>(
    {}
  );
  const [mobileShowEditor, setMobileShowEditor] = useState(false);
  const [activeView, setActiveView] = useState<View>("items");
  const [exporting, setExporting] = useState(false);
  const [charges, setCharges] = useState<Record<string, number>>({});
  const [loadError, setLoadError] = useState<string | null>(null);
  const isMobile = useIsMobile();
  const nameOverrideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const chargesTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sidebarRef = useRef<HTMLDivElement | null>(null);
  const savedScrollTop = useRef(0);

  useEffect(() => {
    const first = ICONS[0];
    if (first && !selectedKey) {
      setSelectedKey(first.defaultName);
    }

    loadExcluded()
      .then(setExcluded)
      .catch((err) => {
        console.error("Failed to load exclusions:", err);
        setLoadError(String(err?.message || err));
      });

    loadAttributeDefinitions()
      .then(setDefinitions)
      .catch((err) => {
        console.error("Failed to load attribute definitions:", err);
        setLoadError(String(err?.message || err));
      });

    loadNameOverrides()
      .then(setNameOverrides)
      .catch((err) => {
        console.error("Failed to load name overrides:", err);
        setLoadError(String(err?.message || err));
      });

    loadCharges()
      .then(setCharges)
      .catch((err) => {
        console.error("Failed to load charges:", err);
        setLoadError(String(err?.message || err));
      });
  }, []);

  const getDisplayName = useCallback(
    (icon: ItemIcon) => nameOverrides[icon.defaultName] || icon.defaultName,
    [nameOverrides]
  );

  const handleNameChange = useCallback(
    (defaultName: string, newName: string) => {
      setNameOverrides((prev) => {
        const next =
          newName === defaultName
            ? ((() => {
                const copy = { ...prev };
                delete copy[defaultName];
                return copy;
              })() as Record<string, string>)
            : { ...prev, [defaultName]: newName };
        if (nameOverrideTimerRef.current) {
          clearTimeout(nameOverrideTimerRef.current);
        }
        nameOverrideTimerRef.current = setTimeout(() => {
          saveNameOverrides(next).catch((err) =>
            console.error("Failed to save name overrides:", err)
          );
        }, 400);
        return next;
      });
    },
    []
  );

  const handleChargesChange = useCallback(
    (defaultName: string, value: number) => {
      setCharges((prev) => {
        const next = { ...prev, [defaultName]: value };
        if (chargesTimerRef.current) {
          clearTimeout(chargesTimerRef.current);
        }
        chargesTimerRef.current = setTimeout(() => {
          saveCharges(next).catch((err) =>
            console.error("Failed to save charges:", err)
          );
        }, 400);
        return next;
      });
    },
    []
  );

  const toggleExclude = useCallback((defaultName: string) => {
    setExcluded((prev) => {
      const next = new Set(prev);
      if (next.has(defaultName)) {
        next.delete(defaultName);
      } else {
        next.add(defaultName);
      }
      saveExcluded(next).catch((err) =>
        console.error("Failed to save exclusions:", err)
      );
      return next;
    });
  }, []);

  const handleSelect = useCallback(
    (defaultName: string) => {
      if (isMobile && sidebarRef.current) {
        savedScrollTop.current = sidebarRef.current.scrollTop;
      }
      setSelectedKey(defaultName);
      if (isMobile) {
        setMobileShowEditor(true);
      }
    },
    [isMobile]
  );

  const handleBack = useCallback(() => {
    setMobileShowEditor(false);
  }, []);

  const handleToggleView = useCallback(() => {
    setActiveView((v) => (v === "items" ? "attributes" : "items"));
    if (isMobile) {
      setMobileShowEditor(false);
    }
  }, [isMobile]);

  const handleExport = useCallback(async () => {
    setExporting(true);
    try {
      const includedIcons = ICONS.filter(
        (icon) => !excluded.has(icon.defaultName)
      );
      const defMap = new Map(definitions.map((d) => [d.id, d]));

      const items = await Promise.all(
        includedIcons.map(async (icon) => {
          const displayName =
            nameOverrides[icon.defaultName] || icon.defaultName;
          let notes = "";
          try {
            notes = await loadNote(icon.defaultName);
          } catch {
            /* offline */
          }
          let attrs: { attributeId: string; value: string }[] = [];
          try {
            attrs = await loadItemAttributes(icon.defaultName);
          } catch {
            /* offline */
          }

          const resolvedAttrs = attrs
            .map((a) => {
              const def = defMap.get(a.attributeId);
              if (!def) return null;
              return {
                name: def.name,
                icon: def.icon,
                color: def.color,
                value: a.value,
              };
            })
            .filter(Boolean);

          return {
            name: displayName,
            defaultName: icon.defaultName,
            filePath: icon.filePath,
            charges: charges[icon.defaultName] ?? 4,
            notes,
            attributes: resolvedAttrs,
          };
        })
      );

      const json = JSON.stringify(items, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "items-export.json";
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  }, [excluded, definitions, nameOverrides, charges]);

  const included = ICONS.filter((icon) => !excluded.has(icon.defaultName));
  const excludedItems = ICONS.filter((icon) => excluded.has(icon.defaultName));
  const selectedIcon = ICONS.find((icon) => icon.defaultName === selectedKey);

  const sidebarCallbackRef = useCallback(
    (node: HTMLDivElement | null) => {
      sidebarRef.current = node;
      if (node && savedScrollTop.current > 0) {
        node.scrollTop = savedScrollTop.current;
      }
    },
    [mobileShowEditor]
  );

  const sidebar = (
    <div
      ref={sidebarCallbackRef}
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
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span
          style={{
            fontSize: isMobile ? 12 : 14,
            fontWeight: 600,
            color: "#7aa2f7",
            fontFamily: "'Press Start 2P', monospace",
            letterSpacing: 1,
          }}
        >
          Items
        </span>
        <div style={{ display: "flex", gap: 4 }}>
          <button
            onClick={handleExport}
            disabled={exporting}
            title="Export items as JSON"
            style={{
              background: "transparent",
              border: "none",
              cursor: exporting ? "wait" : "pointer",
              color: exporting
                ? "rgba(205,214,244,0.2)"
                : "rgba(205,214,244,0.4)",
              padding: 6,
              borderRadius: 6,
              display: "flex",
              alignItems: "center",
            }}
          >
            <Download size={18} />
          </button>
          <button
            onClick={handleToggleView}
            title={
              activeView === "items" ? "Manage attributes" : "Back to items"
            }
            style={{
              background:
                activeView === "attributes"
                  ? "rgba(122,162,247,0.15)"
                  : "transparent",
              border: "none",
              cursor: "pointer",
              color:
                activeView === "attributes"
                  ? "#7aa2f7"
                  : "rgba(205,214,244,0.4)",
              padding: 6,
              borderRadius: 6,
              display: "flex",
              alignItems: "center",
            }}
          >
            <Settings size={18} />
          </button>
        </div>
      </div>
      {loadError && (
        <div
          style={{
            background: "rgba(247,118,142,0.15)",
            border: "1px solid rgba(247,118,142,0.3)",
            borderRadius: 6,
            padding: "8px 12px",
            margin: "8px 12px",
            fontSize: 11,
            color: "#f7768e",
            fontFamily: "'Inter', sans-serif",
          }}
        >
          Firestore error: {loadError}
        </div>
      )}
      {included.map((icon) => (
        <ItemRow
          key={icon.defaultName}
          icon={icon}
          displayName={getDisplayName(icon)}
          selected={icon.defaultName === selectedKey && activeView === "items"}
          excluded={false}
          compact={isMobile}
          onSelect={() => handleSelect(icon.defaultName)}
          onToggleExclude={() => toggleExclude(icon.defaultName)}
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
          {excludedItems.map((icon) => (
            <ItemRow
              key={icon.defaultName}
              icon={icon}
              displayName={getDisplayName(icon)}
              selected={
                icon.defaultName === selectedKey && activeView === "items"
              }
              excluded={true}
              compact={isMobile}
              onSelect={() => handleSelect(icon.defaultName)}
              onToggleExclude={() => toggleExclude(icon.defaultName)}
            />
          ))}
        </>
      )}
    </div>
  );

  const mainPanel =
    activeView === "attributes" ? (
      <AttributeManager
        definitions={definitions}
        onChange={setDefinitions}
        onBack={isMobile ? () => setActiveView("items") : undefined}
        compact={isMobile}
      />
    ) : selectedIcon ? (
      <NoteEditor
        key={selectedIcon.defaultName}
        icon={selectedIcon}
        displayName={getDisplayName(selectedIcon)}
        definitions={definitions}
        onBack={isMobile ? handleBack : undefined}
        compact={isMobile}
        onNameChange={handleNameChange}
        charges={charges[selectedIcon.defaultName] ?? 4}
        onChargesChange={handleChargesChange}
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
    if (activeView === "attributes") {
      return (
        <div style={{ height: "100dvh", overflow: "hidden" }}>{mainPanel}</div>
      );
    }
    return mobileShowEditor ? (
      <div style={{ height: "100dvh", overflow: "hidden" }}>{mainPanel}</div>
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
      <div style={{ flex: 1, overflow: "hidden" }}>{mainPanel}</div>
    </div>
  );
}
