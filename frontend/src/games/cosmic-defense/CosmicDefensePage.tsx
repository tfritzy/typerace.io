import { GameLayout } from "../GameLayout";
import { GameCanvas } from "./GameCanvas";
import { useGameTheme } from "../useGameTheme";
import { getGameTheme } from "../gameThemes";

export const CosmicDefensePage = () => {
  useGameTheme(getGameTheme("cosmic-defense"));
  return (
    <GameLayout title="Cosmic Defense" aspectRatio={16 / 9}>
      <GameCanvas />
    </GameLayout>
  );
};
