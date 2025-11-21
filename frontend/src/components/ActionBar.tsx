import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { GameMode, DbConnection } from "../../module_bindings";
import type { GameTypeValue } from "../components/MatchTypeSelector";

type ActionBarProps = {
  mode?: GameMode;
  gameType?: GameTypeValue;
  gameId?: string;
  rematchDisabled?: boolean;
  conn?: DbConnection;
};

export const ActionBar = ({ mode, gameType, gameId, rematchDisabled, conn }: ActionBarProps) => {
  const navigate = useNavigate();

  const getModeTag = () => {
    return mode?.tag || "English500";
  };

  const getGameType = () => {
    return gameType || "Public";
  };

  const canRematch = !rematchDisabled;

  const handleRematch = () => {
    if (conn && gameId && canRematch) {
      conn.reducers.rematch(gameId);
    }
  };

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (gameType !== "Private" && (event.key === "p" || event.key === "P")) {
        navigate(`/game?mode=${getModeTag()}&gameType=${getGameType()}`, { replace: true });
      } else if (event.key === "m" || event.key === "M") {
        navigate("/");
      } else if ((event.key === "r" || event.key === "R") && canRematch) {
        handleRematch();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [navigate, mode, gameType, canRematch]);

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
          onClick={() => navigate(`/game?mode=${getModeTag()}&gameType=${getGameType()}`, { replace: true })}
          className="box rounded-lg px-8 py-4 bg-transparent text-white text-base font-semibold cursor-pointer opacity-80 flex-1"
        >
          Play Again <span className="ml-1 border px-1 rounded-xs font-light border-white/40 text-white/75">P</span>
        </button>
      )}
    </div>
  );
};
