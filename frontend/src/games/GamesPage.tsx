import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";

const GAMES = [
  {
    slug: "cosmic-defense",
    title: "Cosmic Defense",
    description:
      "Defend your planet from waves of incoming enemy ships. Survive as long as you can.",
  },
];

export const GamesPage = () => {
  useEffect(() => {
    document.title = "Games - TypeRace.io";
    return () => {
      document.title = "typerace.io - PvP typing";
    };
  }, []);

  return (
    <div className="relative h-full flex flex-col overflow-hidden">
      <Header />
      <main className="flex-1 overflow-y-auto p-4">
        <div className="content-container">
          <h1 className="text-3xl font-bold mb-6 text-foreground">Games</h1>
          <div className="grid gap-4">
            {GAMES.map((game) => (
              <Link
                key={game.slug}
                to={`/games/${game.slug}`}
                className="box p-6 hover:border-border-hover transition-colors no-underline"
              >
                <h2 className="text-2xl font-semibold mb-2 text-foreground">
                  {game.title}
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  {game.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};
