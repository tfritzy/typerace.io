import { useEffect, useState } from "react";

export interface ChartColors {
  accent: string;
  border: string;
  foreground: string;
  grid: string;
  input: string;
  muted: string;
  secondaryForeground: string;
}

const readChartColors = (): ChartColors => {
  if (typeof document === "undefined") {
    return {
      accent: "#888",
      border: "#444",
      foreground: "#fff",
      grid: "#333",
      input: "#222",
      muted: "#999",
      secondaryForeground: "#ccc",
    };
  }

  const styles = getComputedStyle(document.documentElement);
  const cssColor = (property: string) =>
    styles.getPropertyValue(property).trim();

  return {
    accent: cssColor("--accent-primary"),
    border: cssColor("--border"),
    foreground: cssColor("--foreground"),
    grid: cssColor("--grid-line"),
    input: cssColor("--input"),
    muted: cssColor("--muted-foreground"),
    secondaryForeground: cssColor("--secondary-foreground"),
  };
};

const sameColors = (a: ChartColors, b: ChartColors) =>
  Object.keys(a).every(
    (key) => a[key as keyof ChartColors] === b[key as keyof ChartColors],
  );

export const useChartColors = () => {
  const [colors, setColors] = useState(readChartColors);

  useEffect(() => {
    let frame = 0;
    const updateColors = () => {
      frame = 0;
      const nextColors = readChartColors();
      setColors((current) =>
        sameColors(current, nextColors) ? current : nextColors,
      );
    };
    const scheduleUpdate = () => {
      if (!frame) frame = requestAnimationFrame(updateColors);
    };
    const observer = new MutationObserver(scheduleUpdate);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-mode", "style"],
    });

    updateColors();
    return () => {
      observer.disconnect();
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return colors;
};
