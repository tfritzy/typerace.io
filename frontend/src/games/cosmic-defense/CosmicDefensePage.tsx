import { GameLayout } from "../GameLayout";
import { Navigate, useParams } from "react-router-dom";
import { GameCanvas } from "./GameCanvas";

export const CosmicDefensePage = () => {
  const { gameId } = useParams();
  if (gameId !== "cosmic-defense") return <Navigate to="/games/cosmic-defense" replace />;

  return (
    <GameLayout title="Cosmic Defense" aspectRatio={16 / 9}>
      <GameCanvas />
    </GameLayout>
  );
};
