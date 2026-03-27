import { useEffect, useRef, useState, useCallback } from "react";
import {
  createThrusterEditor,
  cycleEngineType,
  addEngine,
  removeEngine,
  exportConfig,
} from "./thrusterEditor";
import type { Application } from "pixi.js";
import { SHIP_TYPE_COUNT } from "./types";

const SHIP_NAMES: string[] = [
  "Vanguard", "Sentinel", "Corsair", "Falcon", "Scout", "Dart", "Wasp", "Phoenix",
  "Hawk", "Sparrow", "Gnat", "Stinger", "Needle", "Mite", "Titan", "Raptor",
  "Lance", "Javelin", "Pip", "Raven", "Osprey", "Leviathan", "Talon", "Hornet",
  "Behemoth", "Dreadnought", "Marauder", "Eagle", "Pike", "Arrow", "Juggernaut", "Warden",
  "Specter", "Harrier", "Viper", "Flea", "Broadside", "Kestrel", "Finch", "Striker",
  "Robin", "Cricket", "Moth", "Colossus", "Cutlass", "Sabre", "Mantis", "Speck",
  "Crest", "Piston", "Vulture", "Orb", "Flicker", "Barb", "Sliver", "Flagship",
  "Aegis", "Bolt", "Spur", "Dot", "Rampart", "Clipper",
];

export const ThrusterEditorPage = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<Application | null>(null);
  const [selectedShip, setSelectedShip] = useState<number | null>(null);
  const [configVersion, setConfigVersion] = useState(0);
  const [exported, setExported] = useState<string>("");

  const onConfigChange = useCallback(() => {
    setConfigVersion((v) => v + 1);
  }, []);

  useEffect(() => {
    const div = containerRef.current;
    if (!div) return;
    let app: Application | null = null;
    createThrusterEditor(div, { onConfigChange }).then((a) => {
      app = a;
      appRef.current = a;
    });
    return () => {
      app?.destroy(true);
      appRef.current = null;
    };
  }, [onConfigChange]);

  const handleCycleType = useCallback(
    (dir: 1 | -1) => {
      if (selectedShip !== null && appRef.current) {
        cycleEngineType(appRef.current, selectedShip, dir);
      }
    },
    [selectedShip]
  );

  const handleAddEngine = useCallback(() => {
    if (selectedShip !== null && appRef.current) {
      addEngine(appRef.current, selectedShip);
    }
  }, [selectedShip]);

  const handleRemoveEngine = useCallback(() => {
    if (selectedShip !== null && appRef.current) {
      removeEngine(appRef.current, selectedShip);
    }
  }, [selectedShip]);

  const handleExport = useCallback(() => {
    if (appRef.current) {
      setExported(exportConfig(appRef.current));
    }
  }, []);

  const handleCopyExport = useCallback(() => {
    if (exported) {
      navigator.clipboard.writeText(exported);
    }
  }, [exported]);

  return (
    <div style={{ padding: 16, background: "#111", minHeight: "100vh" }}>
      <h1
        style={{
          color: "#fff",
          marginBottom: 8,
          fontFamily: "monospace",
          fontSize: 20,
        }}
      >
        Thruster Editor — Drag red handles to reposition engines
      </h1>

      <div
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 12,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <span style={{ color: "#aaa", fontFamily: "monospace", fontSize: 13 }}>
          Ship:
        </span>
        <select
          value={selectedShip ?? ""}
          onChange={(e) =>
            setSelectedShip(e.target.value ? Number(e.target.value) : null)
          }
          style={{
            background: "#222",
            color: "#fff",
            border: "1px solid #555",
            padding: "4px 8px",
            fontFamily: "monospace",
            fontSize: 13,
          }}
        >
          <option value="">-- select ship --</option>
          {Array.from({ length: SHIP_TYPE_COUNT }, (_, i) => (
            <option key={i} value={i}>
              {i}: {SHIP_NAMES[i]}
            </option>
          ))}
        </select>

        <button
          onClick={() => handleCycleType(-1)}
          disabled={selectedShip === null}
          style={btnStyle}
        >
          ◀ Prev Engine Type
        </button>
        <button
          onClick={() => handleCycleType(1)}
          disabled={selectedShip === null}
          style={btnStyle}
        >
          Next Engine Type ▶
        </button>
        <button
          onClick={handleAddEngine}
          disabled={selectedShip === null}
          style={btnStyle}
        >
          + Add Engine
        </button>
        <button
          onClick={handleRemoveEngine}
          disabled={selectedShip === null}
          style={btnStyle}
        >
          − Remove Engine
        </button>
        <button onClick={handleExport} style={{ ...btnStyle, background: "#2a5a2a" }}>
          Export Config
        </button>
        {exported && (
          <button
            onClick={handleCopyExport}
            style={{ ...btnStyle, background: "#2a2a5a" }}
          >
            Copy to Clipboard
          </button>
        )}
        <span
          style={{
            color: "#666",
            fontFamily: "monospace",
            fontSize: 11,
            marginLeft: 8,
          }}
          key={configVersion}
        >
          v{configVersion}
        </span>
      </div>

      <div ref={containerRef} />

      {exported && (
        <div style={{ marginTop: 16 }}>
          <h3
            style={{
              color: "#fff",
              fontFamily: "monospace",
              fontSize: 14,
              marginBottom: 8,
            }}
          >
            Exported Config (paste into shipPrefab.ts):
          </h3>
          <textarea
            readOnly
            value={exported}
            style={{
              width: "100%",
              height: 400,
              background: "#1a1a2e",
              color: "#0f0",
              border: "1px solid #333",
              fontFamily: "monospace",
              fontSize: 12,
              padding: 8,
              resize: "vertical",
            }}
          />
        </div>
      )}
    </div>
  );
};

const btnStyle: React.CSSProperties = {
  background: "#333",
  color: "#fff",
  border: "1px solid #555",
  padding: "4px 12px",
  fontFamily: "monospace",
  fontSize: 13,
  cursor: "pointer",
};
