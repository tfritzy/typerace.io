import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./App.css";
import "./components/SelectionButton.css";
import type { DbConnection, GameMode } from "../module_bindings";
import { useSpacetimeDB, useTable } from "spacetimedb/react";
import { TypeBox } from "./components/TypeBox";
import { ChatBox } from "./components/ChatBox";
import { ModeSelector } from "./components/ModeSelector";
import { MatchTypeSelector } from "./components/MatchTypeSelector";
import { ProfileAvatar } from "./components/ProfileAvatar";

function App() {
  const [selectedMode, setSelectedMode] = useState<GameMode>({ tag: "English500" });
  const [isPrivate, setIsPrivate] = useState(false);
  const conn = useSpacetimeDB<DbConnection>();
  const navigate = useNavigate();

  const handlePhraseComplete = useCallback(() => {
    if (conn) {
      conn.reducers.onJoinGame((ctx) => {
        if (ctx.event.status.tag === "Committed") {
          const myProgress = Array.from(conn.db.playerprogress.iter())
            .filter(row => row.playerId.isEqual(conn.identity!))
            .sort((a, b) => Number(b.createdAt - a.createdAt));

          console.log(myProgress);

          if (myProgress.length > 0) {
            navigate(`/game/${myProgress[0].gameId.toString()}`);
          }
        }
      });
      conn.reducers.joinGame(selectedMode);
    }
  }, [conn, selectedMode, navigate]);

  const player_progress = useTable("player");
  console.log(player_progress);

  return (
    <div className="relative min-h-screen">
      <div className="fixed top-4 left-0 right-0 z-10 px-4">
        <div className="content-container flex justify-end">
          <ProfileAvatar />
        </div>
      </div>
      <div className="flex items-center justify-center min-h-screen p-4" style={{ paddingBottom: '400px' }}>
        <div className="content-container">
          <ChatBox>
            <TypeBox phrase="Put me in coach" onComplete={handlePhraseComplete} />
          </ChatBox>
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
}

export default App;