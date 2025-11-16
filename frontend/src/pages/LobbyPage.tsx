import { useState, useCallback, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";
import "../components/SelectionButton.css";
import type {
  DbConnection,
  GameMode,
} from "../../module_bindings";
import { useSpacetimeDB, useTable } from "spacetimedb/react";
import { TypeBox, type TypeBoxRef } from "../components/TypeBox";
import { ModeSelector } from "../components/ModeSelector";
import {
  MatchTypeSelector,
  type GameTypeValue,
} from "../components/MatchTypeSelector";
import { Header } from "../components/Header";

export const LobbyPage = () => {
  const [selectedMode, setSelectedMode] = useState<GameMode>({
    tag: "English500",
  });
  const [gameType, setGameType] = useState<GameTypeValue>("Public");
  const [joinCode, setJoinCode] = useState<string | null>(null);
  const conn = useSpacetimeDB<DbConnection>();
  const navigate = useNavigate();
  const typeBoxRef = useRef<TypeBoxRef>(null);
  const playerProgress = useTable(
    "playerprogress"
  ).rows;

  useEffect(() => {
    if (!joinCode || !conn.identity) return;

    const myProgress = playerProgress.find(
      (row) => row.playerId.isEqual(conn.identity!) && row.joinCode === joinCode
    );

    if (myProgress) {
      navigate(`/game/${myProgress.gameId.toString()}`);
    }
  }, [playerProgress, joinCode, conn.identity, navigate]);

  const handlePhraseComplete = useCallback(() => {
    if (conn) {
      const newJoinCode = `join_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      setJoinCode(newJoinCode);

      const gameTypeEnum = { tag: gameType };
      conn.reducers.joinGame(selectedMode, newJoinCode, gameTypeEnum);
    }
  }, [conn, selectedMode, gameType]);

  return (
    <div className="relative min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="content-container">
          <div className="text-xl mb-[400px]">
            <TypeBox
              ref={typeBoxRef}
              phrase="asdf"
              onComplete={handlePhraseComplete}
              resetOnComplete={true}
            />
          </div>
        </div>
      </div>
      <div className="fixed bottom-0 left-0 right-0 p-4">
        <div className="content-container">
          <MatchTypeSelector gameType={gameType} setGameType={setGameType} />
          <ModeSelector
            selectedMode={selectedMode}
            onModeSelect={setSelectedMode}
          />
        </div>
      </div>
    </div>
  );
};
