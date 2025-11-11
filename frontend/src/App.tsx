import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./App.css";
import "./components/SelectionButton.css";
import type { DbConnection, GameMode, PlayerProgress } from "../module_bindings";
import { useSpacetimeDB, useTable } from "spacetimedb/react";
import { TypeBox } from "./components/TypeBox";
import { ChatBox } from "./components/ChatBox";
import { ModeSelector } from "./components/ModeSelector";
import { MatchTypeSelector } from "./components/MatchTypeSelector";

function App() {
  const [selectedMode, setSelectedMode] = useState<GameMode>({ tag: "English500" });
  const [isPrivate, setIsPrivate] = useState(false);

  const conn = useSpacetimeDB<DbConnection>();
  const navigate = useNavigate();

  const handlePhraseComplete = useCallback(() => {
    if (conn) {
      conn.reducers.JoinGame(selectedMode);
    }
  }, [conn, selectedMode]);

  useTable<DbConnection, PlayerProgress>("player_progress", {
    onInsert: (row: PlayerProgress) => {
      if (conn.identity && row.PlayerId.isEqual(conn.identity)) {
        navigate(`/game/${row.GameId.toString()}`);
      }
    }
  });

  return (
    <div className="relative min-h-screen">
      <div className="flex items-center justify-center min-h-screen p-4" style={{ paddingBottom: '400px' }}>
        <ChatBox>
          <TypeBox phrase="Put me in coach" onComplete={handlePhraseComplete} />
        </ChatBox>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4">
        <div className="w-full max-w-5xl mx-auto">
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
