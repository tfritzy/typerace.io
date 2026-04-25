import { GameLayout } from "../GameLayout";
import { GameCanvas } from "./GameCanvas";

export const PlanetaryDefensePage = () => {
  return (
    <GameLayout title="Planetary Defense" aspectRatio={16 / 9} gameId="planetary_defense">
      <GameCanvas />
    </GameLayout>
  );
};
