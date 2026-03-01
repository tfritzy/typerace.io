import { useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import type { DbConnection } from "../../module_bindings";
import { type GameMode, type Reducers } from "../types/stdb";
import type { GameTypeValue } from "../components/MatchTypeSelector";
import { useFindGame } from "../hooks/useFindGame";

type ActionBarProps = {
  mode?: GameMode;
  gameType?: GameTypeValue;
  gameId?: string;
  rematchDisabled?: boolean;
  conn?: DbConnection;
};

export const ActionBar = ({ mode, gameType, gameId, rematchDisabled, conn }: ActionBarProps) => {
  const navigate = useNavigate();
  const { findGame } = useFindGame();

  const canRematch = !rematchDisabled;

  const handleRematch = useCallback(() => {
    if (conn && gameId && canRematch) {
      ((conn.reducers as unknown) as Reducers).Rematch({ gameId });
    }
  }, [conn, gameId, canRematch]);

  const handlePlayAgain = useCallback(() => {
    const selectedMode: GameMode = mode || { tag: "English500" };
    const selectedGameType = gameType || "Public";
    findGame(selectedMode, selectedGameType);
  }, [findGame, mode, gameType]);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (gameType !== "Private" && (event.key === "p" || event.key === "P")) {
        handlePlayAgain();
      } else if (event.key === "m" || event.key === "M") {
        navigate("/");
      } else if ((event.key === "r" || event.key === "R") && canRematch) {
        handleRematch();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [navigate, gameType, canRematch, handlePlayAgain, handleRematch]);

  return (
    <div className="flex gap-3 mt-3 animate-slideUpFadeIn" style={{ animationDelay: '0.2s' }}>
      <button
        onClick={() => navigate("/")}
        className="box rounded-lg px-8 py-4 bg-transparent text-white text-base font-semibold cursor-pointer opacity-80 flex-1"
      >
        Main Menu <span className="ml-1 border px-1 rounded-xs font-light border-white/40 text-white/75">M</span>
      </button>
      {gameId && gameType === "Private" && (
        <div className="relative flex-1 group">
          <button
            onClick={handleRematch}
            disabled={!canRematch}
            className={`box rounded-lg px-8 py-4 bg-transparent text-white text-base font-semibold w-full ${canRematch ? 'cursor-pointer opacity-80' : 'cursor-not-allowed opacity-40'
              }`}
          >
            Rematch <span className="ml-1 border px-1 rounded-xs font-light border-white/40 text-white/75">R</span>
          </button>
          {!canRematch && (
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-black/90 text-white text-sm rounded-lg whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200">
              Only the game owner can start a rematch
              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-black/90"></div>
            </div>
          )}
        </div>
      )}
      {gameType !== "Private" && (
        <button
          onClick={handlePlayAgain}
          className="box rounded-lg px-8 py-4 bg-transparent text-white text-base font-semibold cursor-pointer opacity-80 flex-1"
        >
          Play Again <span className="ml-1 border px-1 rounded-xs font-light border-white/40 text-white/75">P</span>
        </button>
      )}
    </div>
  );
};
