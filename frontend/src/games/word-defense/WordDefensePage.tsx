import { GameLayout } from "../GameLayout";
import { GameCanvas } from "./GameCanvas";

export const WordDefensePage = () => {
  return (
    <GameLayout title="Word Defense" aspectRatio={16 / 9}>
      <GameCanvas />
    </GameLayout>
  );
};
