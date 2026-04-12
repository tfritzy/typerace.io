import { GameLayout } from "../GameLayout";
import { GameCanvas } from "./GameCanvas";

export const CosmicDefensePage = () => {
  return (
    <GameLayout title="Cosmic Defense" aspectRatio={16 / 9}>
      <GameCanvas />
    </GameLayout>
  );
};
