import { useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import type { DbConnection } from "../../module_bindings";
import { type GameMode } from "../types/stdb";
import type { GameTypeValue } from "../components/MatchTypeSelector";
import { getLangHome, getLangPrefix } from "../utils/modes";
import { getTranslations } from "../utils/translations";
import { storeGameSearchPreferences } from "../utils/gamePreferences";
import { Box } from "./Box";

type ActionBarProps = {
  mode?: GameMode;
  gameType?: GameTypeValue;
  gameId?: string;
  rematchDisabled?: boolean;
  conn?: DbConnection;
  onWatchReplay?: () => void;
  isParticipant?: boolean;
  isPersonalRecord?: boolean;
};

export const ActionBar = ({
  mode,
  gameType,
  gameId,
  rematchDisabled,
  conn,
  onWatchReplay,
  isParticipant = true,
  isPersonalRecord = false,
}: ActionBarProps) => {
  const navigate = useNavigate();
  const t = getTranslations();

  const isPrivateGame = gameType === "Private";
  const showPlayAgain = isParticipant && !isPrivateGame;
  const showRematch = isParticipant && isPrivateGame && !!gameId;
  const canRematch = showRematch && !rematchDisabled;
  const boxTone = isPersonalRecord ? "accent" : "default";

  const handleRematch = useCallback(() => {
    if (conn && gameId && canRematch) {
      conn.reducers.rematch({ gameId });
    }
  }, [conn, gameId, canRematch]);

  const handlePlayAgain = useCallback(() => {
    const selectedMode: GameMode = mode || { tag: "English500" };
    const selectedGameType = gameType || "Public";
    storeGameSearchPreferences(selectedMode, selectedGameType);
    navigate(`${getLangPrefix()}/game`, { replace: true });
  }, [navigate, mode, gameType]);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      switch (event.key.toLowerCase()) {
        case "m":
          navigate(getLangHome());
          break;
        case "w":
          onWatchReplay?.();
          break;
        case "p":
          if (showPlayAgain) handlePlayAgain();
          break;
        case "r":
          if (canRematch) handleRematch();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [
    navigate,
    showPlayAgain,
    canRematch,
    handlePlayAgain,
    handleRematch,
    onWatchReplay,
  ]);

  return (
    <div
      className="flex gap-3 mt-3 animate-slideUpFadeIn"
      style={{ animationDelay: "0.2s" }}
    >
      <Box
        asChild
        tone={boxTone}
        className="rounded-lg px-8 py-4 text-base font-semibold cursor-pointer opacity-80 flex-1"
      >
        <button onClick={() => navigate(getLangHome())}>
          {t.mainMenu}{" "}
          <span className="ml-1 border px-1 rounded-xs font-light border-border text-secondary-foreground">
            M
          </span>
        </button>
      </Box>
      {onWatchReplay && (
        <Box
          asChild
          tone={boxTone}
          className="rounded-lg px-8 py-4 text-base font-semibold cursor-pointer opacity-80 flex-1"
        >
          <button onClick={onWatchReplay}>
            {t.watchReplay}{" "}
            <span className="ml-1 border px-1 rounded-xs font-light border-border text-secondary-foreground">
              W
            </span>
          </button>
        </Box>
      )}
      {showRematch && (
        <div className="relative flex-1 group">
          <Box
            asChild
            tone={boxTone}
            className={`rounded-lg px-8 py-4 text-base font-semibold w-full ${canRematch ? "cursor-pointer opacity-80" : "cursor-not-allowed opacity-40"}`}
          >
            <button onClick={handleRematch} disabled={!canRematch}>
              {t.rematch}{" "}
              <span className="ml-1 border px-1 rounded-xs font-light border-border text-secondary-foreground">
                R
              </span>
            </button>
          </Box>
          {!canRematch && (
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-black/90 text-foreground text-sm rounded-lg whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200">
              {t.ownerRematchOnly}
              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-black/90"></div>
            </div>
          )}
        </div>
      )}
      {showPlayAgain && (
        <Box
          asChild
          tone={boxTone}
          className="rounded-lg px-8 py-4 text-base font-semibold cursor-pointer opacity-80 flex-1"
        >
          <button onClick={handlePlayAgain}>
            {t.playAgain}{" "}
            <span className="ml-1 border px-1 rounded-xs font-light border-border text-secondary-foreground">
              P
            </span>
          </button>
        </Box>
      )}
    </div>
  );
};
