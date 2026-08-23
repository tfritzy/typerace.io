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

type ActionBarStyle = CSSProperties & {
  "--color-box-bg"?: string;
  "--color-box-border"?: string;
};

const actionButtonClasses =
  "box flex-1 cursor-pointer rounded-lg px-8 py-4 text-base font-semibold opacity-80";

function ShortcutKey({ children }: { children: string }) {
  return (
    <span className="ml-1 rounded-xs border border-border px-1 font-light text-secondary-foreground">
      {children}
    </span>
  );
}

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
  const actionTextClasses = isPersonalRecord
    ? "text-accent-primary"
    : "text-foreground";
  const actionBarStyle: ActionBarStyle = {
    animationDelay: "0.2s",
    ...(isPersonalRecord && {
      "--color-box-bg":
        "color-mix(in srgb, var(--accent-primary) 10%, transparent)",
      "--color-box-border":
        "color-mix(in srgb, var(--accent-primary) 40%, transparent)",
    }),
  };

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
        className={`${actionButtonClasses} ${actionTextClasses}`}
      >
        {t.mainMenu} <ShortcutKey>M</ShortcutKey>
      </button>
      {onWatchReplay && (
        <button
          onClick={onWatchReplay}
          className={`${actionButtonClasses} ${actionTextClasses}`}
        >
          {t.watchReplay} <ShortcutKey>W</ShortcutKey>
        </button>
      )}
      {showRematch && (
        <div className="group relative flex-1">
          <button
            onClick={handleRematch}
            disabled={!canRematch}
            className={`box w-full rounded-lg px-8 py-4 text-base font-semibold ${actionTextClasses} ${canRematch ? "cursor-pointer opacity-80" : "cursor-not-allowed opacity-40"}`}
          >
            {t.rematch} <ShortcutKey>R</ShortcutKey>
          </button>
          {!canRematch && (
            <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-black/90 px-3 py-2 text-sm text-foreground opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              {t.ownerRematchOnly}
              <div className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-black/90" />
            </div>
          )}
        </div>
      )}
      {showPlayAgain && (
        <button
          onClick={handlePlayAgain}
          className={`${actionButtonClasses} ${actionTextClasses}`}
        >
          {t.playAgain} <ShortcutKey>P</ShortcutKey>
        </button>
      )}
    </div>
  );
};
