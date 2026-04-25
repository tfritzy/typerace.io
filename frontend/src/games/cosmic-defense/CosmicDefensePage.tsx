import { GameLayout } from "../GameLayout";
import { useDatabase } from "../../contexts/SpacetimeContext";
import { GameCanvas } from "./GameCanvas";

export const CosmicDefensePage = () => {
  const conn = useDatabase();

  return (
    <GameLayout title="Cosmic Defense" aspectRatio={16 / 9} gameId="cosmic_defense">
      <GameCanvas conn={conn} />
    </GameLayout>
  );
};
