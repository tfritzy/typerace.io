import { useEffect } from "react";
import { GameLayout } from "../GameLayout";
import { GameCanvas } from "./GameCanvas";

export const WordDefensePage = () => {
  useEffect(() => {
    document.title = "Word Defense - TypeRace.io";
    return () => {
      document.title = "typerace.io - PvP typing";
    };
  }, []);

  return (
    <GameLayout title="Word Defense" aspectRatio={16 / 9}>
      <GameCanvas />
    </GameLayout>
  );
};
