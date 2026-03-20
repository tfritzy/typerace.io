import { useEffect } from "react";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { WebGPUCanvas } from "../components/WebGPUCanvas";

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

          <div className="box p-6 mb-6">
            <WebGPUCanvas />
          </div>

          <div className="box p-8 mb-8 text-foreground">
            <h2 className="text-2xl font-semibold mb-4">How to Play</h2>
            <p className="leading-relaxed">
              Word Defense is a wave-based typing defense game. Enemies approach
              from the air while your characters defend from the ground. Type
              the words above enemies to fire at them. Survive each day, collect
              gold from fallen enemies, and upgrade your weapons and equipment
              between rounds.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};
