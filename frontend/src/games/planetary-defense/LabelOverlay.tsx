import { useEffect, useRef } from "react";
import type { PlanetaryDefenseGame } from "./game";
import type { LabelData } from "./game";
import { CANVAS_WIDTH, CANVAS_HEIGHT } from "./constants";

const PIXEL_FONT = "'Press Start 2P', monospace";
const LABEL_FONT_SIZE = 16;
const TYPED_COLOR = "#90ee90";
const UNTYPED_COLOR = "#ffffff";

interface LabelDom {
  container: HTMLDivElement;
  typedSpan: HTMLSpanElement;
  untypedSpan: HTMLSpanElement;
}

export const LabelOverlay = ({ gameRef }: { gameRef: React.RefObject<PlanetaryDefenseGame | null> }) => {
  const overlayRef = useRef<HTMLDivElement>(null);
  const labelDomsRef = useRef(new Map<number, LabelDom>());
  const shadowRef = useRef("");
  const lastScaleRef = useRef(0);

  useEffect(() => {
    let animId: number;

    const buildShadow = (s: number): string => {
      return [
        `${-s}px ${-s}px 0 #000`,
        `${s}px ${-s}px 0 #000`,
        `${-s}px ${s}px 0 #000`,
        `${s}px ${s}px 0 #000`,
        `0 ${-s}px 0 #000`,
        `0 ${s}px 0 #000`,
        `${-s}px 0 0 #000`,
        `${s}px 0 0 #000`,
      ].join(", ");
    };

    const createLabelDom = (overlay: HTMLDivElement, shadow: string, fontSize: string): LabelDom => {
      const container = document.createElement("div");
      container.style.position = "absolute";
      container.style.fontFamily = PIXEL_FONT;
      container.style.whiteSpace = "nowrap";
      container.style.pointerEvents = "none";
      container.style.transform = "translate(-50%, -100%)";
      container.style.fontSize = fontSize;
      container.style.textShadow = shadow;
      container.style.lineHeight = "1";

      const typedSpan = document.createElement("span");
      typedSpan.style.color = TYPED_COLOR;
      container.appendChild(typedSpan);

      const untypedSpan = document.createElement("span");
      untypedSpan.style.color = UNTYPED_COLOR;
      container.appendChild(untypedSpan);

      overlay.appendChild(container);
      return { container, typedSpan, untypedSpan };
    };

    const loop = () => {
      animId = requestAnimationFrame(loop);
      const game = gameRef.current;
      const overlay = overlayRef.current;
      if (!game || !overlay) return;

      const labels: LabelData[] = game.labels;
      const containerWidth = overlay.clientWidth;
      const scale = containerWidth / CANVAS_WIDTH;
      const fontSize = Math.max(6, Math.round(LABEL_FONT_SIZE * scale));
      const fontSizePx = `${fontSize}px`;

      if (scale !== lastScaleRef.current) {
        lastScaleRef.current = scale;
        const strokePx = Math.max(1, Math.round(2 * scale));
        shadowRef.current = buildShadow(strokePx);
        for (const dom of labelDomsRef.current.values()) {
          dom.container.style.fontSize = fontSizePx;
          dom.container.style.textShadow = shadowRef.current;
        }
      }

      const activeIds = new Set<number>();
      for (const label of labels) {
        activeIds.add(label.id);
        let dom = labelDomsRef.current.get(label.id);
        if (!dom) {
          dom = createLabelDom(overlay, shadowRef.current, fontSizePx);
          labelDomsRef.current.set(label.id, dom);
        }

        dom.container.style.left = `${(label.x / CANVAS_WIDTH) * 100}%`;
        dom.container.style.top = `${(label.y / CANVAS_HEIGHT) * 100}%`;
        dom.typedSpan.textContent = label.word.slice(0, label.typedCount);
        dom.untypedSpan.textContent = label.word.slice(label.typedCount);
      }

      for (const [id, dom] of labelDomsRef.current) {
        if (!activeIds.has(id)) {
          dom.container.remove();
          labelDomsRef.current.delete(id);
        }
      }
    };

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      for (const dom of labelDomsRef.current.values()) {
        dom.container.remove();
      }
      labelDomsRef.current.clear();
    };
  }, [gameRef]);

  return (
    <div
      ref={overlayRef}
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        overflow: "hidden",
      }}
    />
  );
};
