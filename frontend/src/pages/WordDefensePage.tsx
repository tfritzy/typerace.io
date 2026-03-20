import { useEffect } from "react";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { TerrainCanvas } from "../components/TerrainCanvas";

export const WordDefensePage = () => {
  useEffect(() => {
    document.title = "Word Defense - TypeRace.io";
    return () => {
      document.title = "typerace.io - PvP typing";
    };
  }, []);

  return (
    <div className="relative h-full flex flex-col overflow-hidden">
      <Header />
      <main className="flex-1 overflow-y-auto p-4">
        <div className="content-container">
          <h1 className="text-3xl font-bold mb-6 text-foreground">
            Word Defense
          </h1>

          <div className="box p-6">
            <TerrainCanvas />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};
