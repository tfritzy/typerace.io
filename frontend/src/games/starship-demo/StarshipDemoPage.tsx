import { useEffect } from "react";
import { GameLayout } from "../GameLayout";
import { GameCanvas } from "./GameCanvas";

export const StarshipDemoPage = () => {
  useEffect(() => {
    document.title = "Starship Demo - TypeRace.io";
    return () => {
      document.title = "typerace.io - PvP typing";
    };
  }, []);

  return (
    <GameLayout title="Starship Demo" aspectRatio={16 / 9}>
      <GameCanvas />
    </GameLayout>
  );
};
