import { useEffect, type ReactNode } from "react";
import { useParams } from "react-router-dom";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { ScoreLeaderboards } from "./components/ScoreLeaderboards";
import { getLanguageFromSlug } from "../utils/modes";

type GameLayoutProps = {
  title: string;
  children: ReactNode;
  aspectRatio?: number;
  viewportChromeOffsetPx?: number;
};

export const GameLayout = ({
  title,
  children,
  aspectRatio = 16 / 9,
  viewportChromeOffsetPx = 220,
}: GameLayoutProps) => {
  const { gameId, lang } = useParams();
  const language = getLanguageFromSlug(lang).slug || "en";

  useEffect(() => {
    document.title = `${title} - TypeRace.io`;
    return () => {
      document.title = "typerace.io - PvP typing";
    };
  }, [title]);
  const maxWidthFromHeight = `calc((100dvh - ${viewportChromeOffsetPx}px) * ${aspectRatio})`;

  return (
    <div className="relative h-full flex flex-col overflow-hidden">
      <Header />
      <main className="flex-1 overflow-y-auto px-4 py-3 md:py-4">
        <div className="w-full max-w-[1800px] mx-auto space-y-3 md:space-y-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{title}</h1>
          <section className="w-full flex justify-center">
            <div
              className="w-full"
              style={{
                width: `min(100%, ${maxWidthFromHeight})`,
                maxWidth: "100%",
              }}
            >
              <div
                className="w-full box overflow-hidden"
                style={{ aspectRatio: String(aspectRatio) }}
              >
                {children}
              </div>
            </div>
          </section>
          {gameId && <ScoreLeaderboards gameId={gameId} language={language} />}
        </div>
      </main>
      <Footer />
    </div>
  );
};
