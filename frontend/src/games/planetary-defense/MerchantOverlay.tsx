import { useEffect, useRef } from "react";
import type { PlanetaryDefenseGame } from "./game";
import { CANVAS_WIDTH, CANVAS_HEIGHT, PIXEL_FONT } from "./constants";

const NAME_LABEL_OFFSET_Y = -50;

interface MerchantDom {
  label: HTMLDivElement;
}

interface TooltipDom {
  container: HTMLDivElement;
}

interface PromptDom {
  container: HTMLDivElement;
}

export const MerchantOverlay = ({
  gameRef,
}: {
  gameRef: React.RefObject<PlanetaryDefenseGame | null>;
}) => {
  const overlayRef = useRef<HTMLDivElement>(null);
  const merchantDomsRef = useRef(new Map<number, MerchantDom>());
  const tooltipRef = useRef<TooltipDom | null>(null);
  const tooltipMerchantIdRef = useRef<number | null>(null);
  const promptRef = useRef<PromptDom | null>(null);
  const promptVisibleRef = useRef(false);

  useEffect(() => {
    let animId = 0;

    const createLabel = (
      overlay: HTMLDivElement,
      name: string
    ): MerchantDom => {
      const label = document.createElement("div");
      label.style.position = "absolute";
      label.style.fontFamily = PIXEL_FONT;
      label.style.transform = "translate(-50%, -50%)";
      label.style.pointerEvents = "none";
      label.style.whiteSpace = "nowrap";
      label.style.fontSize = "9px";
      label.style.color = "#ffd700";
      label.style.background = "rgba(17, 17, 34, 0.85)";
      label.style.border = "1px solid rgba(255, 215, 0, 0.5)";
      label.style.borderRadius = "4px";
      label.style.padding = "5px 8px";
      label.style.lineHeight = "1.4";
      label.textContent = name;
      overlay.appendChild(label);
      return { label };
    };

    const createTooltip = (
      overlay: HTMLDivElement,
      name: string,
      description: string
    ): TooltipDom => {
      const container = document.createElement("div");
      container.style.position = "absolute";
      container.style.fontFamily = PIXEL_FONT;
      container.style.pointerEvents = "none";
      container.style.background = "rgba(13, 13, 26, 0.95)";
      container.style.border = "1.5px solid rgba(255, 215, 0, 0.6)";
      container.style.borderRadius = "6px";
      container.style.padding = "10px";
      container.style.width = "220px";
      container.style.transform = "translate(-100%, -50%)";
      container.style.marginLeft = "-60px";

      const title = document.createElement("div");
      title.style.fontSize = "10px";
      title.style.color = "#ffd700";
      title.style.lineHeight = "1.6";
      title.style.marginBottom = "8px";
      title.textContent = name;
      container.appendChild(title);

      const desc = document.createElement("div");
      desc.style.fontSize = "7px";
      desc.style.color = "#a6adc8";
      desc.style.lineHeight = "1.8";
      desc.textContent = description;
      container.appendChild(desc);

      overlay.appendChild(container);
      return { container };
    };

    const createPrompt = (overlay: HTMLDivElement): PromptDom => {
      const container = document.createElement("div");
      container.style.position = "absolute";
      container.style.fontFamily = PIXEL_FONT;
      container.style.pointerEvents = "none";
      container.style.transform = "translate(-50%, -50%)";
      container.style.textAlign = "center";
      container.style.background = "rgba(17, 17, 34, 0.9)";
      container.style.border = "1px solid rgba(255, 215, 0, 0.4)";
      container.style.borderRadius = "6px";
      container.style.padding = "12px 24px";

      const title = document.createElement("div");
      title.style.fontSize = "12px";
      title.style.color = "#ffd700";
      title.style.lineHeight = "1.4";
      title.textContent = "CHOOSE A MERCHANT";
      container.appendChild(title);

      const hint = document.createElement("div");
      hint.style.fontSize = "8px";
      hint.style.color = "#a6adc8";
      hint.style.marginTop = "8px";
      hint.style.lineHeight = "1.4";
      hint.textContent = "click a ship to browse its wares";
      container.appendChild(hint);

      overlay.appendChild(container);
      return { container };
    };

    const loop = () => {
      animId = requestAnimationFrame(loop);
      const game = gameRef.current;
      const overlay = overlayRef.current;
      if (!game || !overlay) return;

      const merchants = game.state.merchants;
      const hoveredId = game.hoveredMerchantId;

      const activeIds = new Set<number>();
      for (const merchant of merchants) {
        activeIds.add(merchant.id);

        let dom = merchantDomsRef.current.get(merchant.id);
        if (!dom) {
          dom = createLabel(overlay, merchant.name);
          merchantDomsRef.current.set(merchant.id, dom);
        }

        const labelX = (merchant.x / CANVAS_WIDTH) * 100;
        const labelY =
          ((merchant.y + NAME_LABEL_OFFSET_Y) / CANVAS_HEIGHT) * 100;
        dom.label.style.left = `${labelX}%`;
        dom.label.style.top = `${labelY}%`;
      }

      for (const [id, dom] of merchantDomsRef.current) {
        if (!activeIds.has(id)) {
          dom.label.remove();
          merchantDomsRef.current.delete(id);
        }
      }

      const hoveredMerchant =
        hoveredId !== null
          ? merchants.find((m) => m.id === hoveredId && !m.departing)
          : null;

      if (hoveredMerchant) {
        if (tooltipMerchantIdRef.current !== hoveredMerchant.id) {
          if (tooltipRef.current) {
            tooltipRef.current.container.remove();
          }
          tooltipRef.current = createTooltip(
            overlay,
            hoveredMerchant.name,
            hoveredMerchant.description
          );
          tooltipMerchantIdRef.current = hoveredMerchant.id;
        }
        const tooltip = tooltipRef.current;
        if (tooltip) {
          const tx = (hoveredMerchant.x / CANVAS_WIDTH) * 100;
          const ty = (hoveredMerchant.y / CANVAS_HEIGHT) * 100;
          tooltip.container.style.left = `${tx}%`;
          tooltip.container.style.top = `${ty}%`;
        }
      } else {
        if (tooltipRef.current) {
          tooltipRef.current.container.remove();
          tooltipRef.current = null;
          tooltipMerchantIdRef.current = null;
        }
      }

      const hasNonDeparting = merchants.some((m) => !m.departing);
      const anySelected = merchants.some((m) => m.shopOpenable);
      const showPrompt = hasNonDeparting && !anySelected;

      if (showPrompt) {
        if (!promptVisibleRef.current) {
          if (promptRef.current) {
            promptRef.current.container.remove();
          }
          promptRef.current = createPrompt(overlay);
          promptVisibleRef.current = true;
        }
        const prompt = promptRef.current;
        if (prompt) {
          const promptX = ((CANVAS_WIDTH - 250) / CANVAS_WIDTH) * 100;
          const promptY = ((CANVAS_HEIGHT / 2 - 200) / CANVAS_HEIGHT) * 100;
          prompt.container.style.left = `${promptX}%`;
          prompt.container.style.top = `${promptY}%`;
        }
      } else {
        if (promptVisibleRef.current && promptRef.current) {
          promptRef.current.container.remove();
          promptRef.current = null;
          promptVisibleRef.current = false;
        }
      }
    };

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      for (const dom of merchantDomsRef.current.values()) {
        dom.label.remove();
      }
      merchantDomsRef.current.clear();
      if (tooltipRef.current) {
        tooltipRef.current.container.remove();
        tooltipRef.current = null;
      }
      if (promptRef.current) {
        promptRef.current.container.remove();
        promptRef.current = null;
      }
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
