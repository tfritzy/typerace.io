import { useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";
import "../components/SelectionButton.css";
import type { DbConnection, GameMode } from "../../module_bindings";
import { useSpacetimeDB, useTable } from "spacetimedb/react";
import { TypeBox, type TypeBoxRef } from "../components/TypeBox";
import { ModeSelector } from "../components/ModeSelector";
import { MatchTypeSelector } from "../components/MatchTypeSelector";
import { Header } from "../components/Header";

export const LobbyPage = () => {
  const [selectedMode, setSelectedMode] = useState<GameMode>({ tag: "English500" });
  const [isPrivate, setIsPrivate] = useState(false);
  const conn = useSpacetimeDB<DbConnection>();
  const navigate = useNavigate();
  const typeBoxRef = useRef<TypeBoxRef>(null);

  const handlePhraseComplete = useCallback(() => {
    if (conn) {
      const joinCode = `join_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      
      conn.reducers.onJoinGame((ctx) => {
        if (ctx.event.status.tag === "Committed") {
          const myProgress = Array.from(conn.db.playerprogress.iter())
            .filter(row => row.playerId.isEqual(conn.identity!) && row.joinCode === joinCode);

          console.log(myProgress);

          if (myProgress.length > 0) {
            navigate(`/game/${myProgress[0].gameId.toString()}`);
          }
        }
      });
      conn.reducers.joinGame(selectedMode, joinCode);
    }
  }, [conn, selectedMode, navigate]);

  const player_progress = useTable("player");
  console.log(player_progress);

  return (
    <div className="relative min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="content-container">
          <div className="text-xl mb-[400px]">
            <TypeBox ref={typeBoxRef} phrase="asdf" onComplete={handlePhraseComplete} />
          </div>
        </div>
      </div>
      <div className="fixed bottom-0 left-0 right-0 p-4">
        <div className="content-container">
          <MatchTypeSelector isPrivate={isPrivate} setIsPrivate={setIsPrivate} />
          <ModeSelector
            selectedMode={selectedMode}
            onModeSelect={setSelectedMode}
          />
        </div>
      </div>
    </div>
  );
};
