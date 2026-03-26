import { GameLayout } from "../GameLayout";
import { GameCanvas } from "./GameCanvas";

export const StarshipDemoPage = () => {
  return (
    <GameLayout title="Planetary Defense" aspectRatio={16 / 9}>
      <GameCanvas />
    </GameLayout>
  );
};
