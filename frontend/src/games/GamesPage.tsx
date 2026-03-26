import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";

const GAMES = [
  {
    slug: "word-defense",
    title: "Word Defense",
    description:
      "A wave-based typing defense game. Type words to shoot down enemies before they break through your shield.",
  },
  {
    slug: "starship-demo",
    title: "Starship Demo",
    description:
      "An asset showcase featuring every ship from the Pixel Starships kit with color presets, animated engines, drifting asteroids, star particles, and a tiled space background.",
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
