import { useEffect, useCallback, type CSSProperties } from "react";
import { useNavigate } from "react-router-dom";
import type { DbConnection } from "../../module_bindings";
import { type GameMode } from "../types/stdb";
import type { GameTypeValue } from "../components/MatchTypeSelector";
import { getLangHome, getLangPrefix } from "../utils/modes";
import { getTranslations } from "../utils/translations";
import { storeGameSearchPreferences } from "../utils/gamePreferences";

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
  const personalRecordClasses = isPersonalRecord
    ? "text-accent-primary"
    : "text-foreground";
  const actionBarStyle = {
    animationDelay: "0.2s",
    ...(isPersonalRecord && {
      "--color-box-bg":
        "color-mix(in srgb, var(--accent-primary) 10%, transparent)",
      "--color-box-border":
        "color-mix(in srgb, var(--accent-primary) 40%, transparent)",
    }),
  } as CSSProperties;

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
      data-action-bar
      className="flex gap-3 mt-3 animate-slideUpFadeIn"
      style={actionBarStyle}
    >
      <button
        onClick={() => navigate(getLangHome())}
        className={`box rounded-lg px-8 py-4 text-base font-semibold cursor-pointer opacity-80 flex-1 ${personalRecordClasses}`}
      >
        {t.mainMenu} <span className="ml-1 border px-1 rounded-xs font-light border-border text-secondary-foreground">M</span>
      </button>
      {onWatchReplay && (
        <button
          onClick={onWatchReplay}
          className={`box rounded-lg px-8 py-4 text-base font-semibold cursor-pointer opacity-80 flex-1 ${personalRecordClasses}`}
        >
          {t.watchReplay} <span className="ml-1 border px-1 rounded-xs font-light border-border text-secondary-foreground">W</span>
        </button>
      )}
      {showRematch && (
        <div className="relative flex-1 group">
          <button
            onClick={handleRematch}
            disabled={!canRematch}
            className={`box rounded-lg px-8 py-4 text-base font-semibold w-full ${personalRecordClasses} ${canRematch ? 'cursor-pointer opacity-80' : 'cursor-not-allowed opacity-40'
              }`}
          >
            {t.rematch} <span className="ml-1 border px-1 rounded-xs font-light border-border text-secondary-foreground">R</span>
          </button>
          {!canRematch && (
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-black/90 text-foreground text-sm rounded-lg whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200">
              {t.ownerRematchOnly}
              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-black/90"></div>
            </div>
          )}
        </div>
      )}
      {showPlayAgain && (
        <button
          onClick={handlePlayAgain}
          className={`box rounded-lg px-8 py-4 text-base font-semibold cursor-pointer opacity-80 flex-1 ${personalRecordClasses}`}
        >
          {t.playAgain} <span className="ml-1 border px-1 rounded-xs font-light border-border text-secondary-foreground">P</span>
        </button>
      )}
    </div>
  );
};
