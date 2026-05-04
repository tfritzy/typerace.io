import { useState } from "react";
import { GameLayout } from "../GameLayout";
import { GameCanvas } from "./GameCanvas";

export const CosmicDefensePage = () => {
  const [autoTyperWpm, setAutoTyperWpm] = useState(150);

  const controls = (
    <div className="flex items-center gap-3 px-1">
      <span className="text-sm text-muted-foreground whitespace-nowrap">
        Auto-typer: {autoTyperWpm} WPM
      </span>
      <input
        type="range"
        min={10}
        max={300}
        step={10}
        value={autoTyperWpm}
        onChange={(e) => setAutoTyperWpm(Number(e.target.value))}
        className="flex-1 accent-[#f9e2af]"
      />
    </div>
  );

  return (
    <GameLayout title="Cosmic Defense" aspectRatio={16 / 9} controls={controls}>
      <GameCanvas autoTyperWpm={autoTyperWpm} />
    </GameLayout>
  );
};
