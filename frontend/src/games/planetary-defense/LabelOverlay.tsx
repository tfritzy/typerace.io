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
  const strokeRef = useRef("2px");
  const lastScaleRef = useRef(0);

  useEffect(() => {
    let animId: number;

    const applyStroke = (el: HTMLElement, strokePx: string) => {
      el.style.setProperty("-webkit-text-stroke", `${strokePx} #000`);
      el.style.paintOrder = "stroke fill";
    };

    const createLabelDom = (overlay: HTMLDivElement, strokePx: string, fontSize: string): LabelDom => {
      const container = document.createElement("div");
      container.style.position = "absolute";
      container.style.fontFamily = PIXEL_FONT;
      container.style.whiteSpace = "nowrap";
      container.style.pointerEvents = "none";
      container.style.transform = "translate(-50%, -100%)";
      container.style.fontSize = fontSize;
      container.style.lineHeight = "1";

      const typedSpan = document.createElement("span");
      typedSpan.style.color = TYPED_COLOR;
      applyStroke(typedSpan, strokePx);
      container.appendChild(typedSpan);

      const untypedSpan = document.createElement("span");
      untypedSpan.style.color = UNTYPED_COLOR;
      applyStroke(untypedSpan, strokePx);
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
      const fontSize = Math.max(10, Math.round(LABEL_FONT_SIZE * scale));
      const fontSizePx = `${fontSize}px`;

      if (scale !== lastScaleRef.current) {
        lastScaleRef.current = scale;
        strokeRef.current = `${Math.max(1, Math.round(2 * scale))}px`;
        for (const dom of labelDomsRef.current.values()) {
          dom.container.style.fontSize = fontSizePx;
          applyStroke(dom.typedSpan, strokeRef.current);
          applyStroke(dom.untypedSpan, strokeRef.current);
        }
      }

      const activeIds = new Set<number>();
      for (const label of labels) {
        activeIds.add(label.id);
        let dom = labelDomsRef.current.get(label.id);
        if (!dom) {
          dom = createLabelDom(overlay, strokeRef.current, fontSizePx);
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
