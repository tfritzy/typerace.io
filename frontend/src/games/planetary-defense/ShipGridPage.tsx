import { useEffect, useRef } from "react";
import { createShipGrid } from "./shipGrid";

export const ShipGridPage = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const div = containerRef.current;
    if (!div) return;
    let app: Awaited<ReturnType<typeof createShipGrid>> | null = null;
    createShipGrid(div).then((a) => {
      app = a;
    });
    return () => {
      app?.destroy(true);
    };
  }, []);

  return (
    <div style={{ padding: 16, background: "#111" }}>
      <h1 style={{ color: "#fff", marginBottom: 8, fontFamily: "monospace" }}>
        Ship Grid — All 62 Ships with Engines
      </h1>
      <div ref={containerRef} />
    </div>
  );
};
