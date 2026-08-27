import { useEffect, useCallback, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Check,
  Clapperboard,
  Copy,
  House,
  Keyboard,
  RotateCcw,
} from "lucide-react";
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
  getCopyResultsText?: () => string;
};

export const ActionBar = ({
  mode,
  gameType,
  gameId,
  rematchDisabled,
  conn,
  onWatchReplay,
  isParticipant = true,
  getCopyResultsText,
}: ActionBarProps) => {
  const navigate = useNavigate();
  const t = getTranslations();
  const [resultsCopied, setResultsCopied] = useState(false);
  const copiedResetTimer = useRef<ReturnType<typeof setTimeout>>();

  const isPrivateGame = gameType === "Private";
  const showPlayAgain = isParticipant && !isPrivateGame;
  const showRematch = isParticipant && isPrivateGame && !!gameId;
  const canRematch = showRematch && !rematchDisabled;

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

  const handleCopyResults = useCallback(async () => {
    if (!getCopyResultsText) return;

    try {
      await navigator.clipboard.writeText(getCopyResultsText());
      setResultsCopied(true);
      clearTimeout(copiedResetTimer.current);
      copiedResetTimer.current = setTimeout(
        () => setResultsCopied(false),
        2_000,
      );
    } catch {
      setResultsCopied(false);
    }
  }, [getCopyResultsText]);

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
        case "c":
          if (getCopyResultsText) void handleCopyResults();
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
    handleCopyResults,
    getCopyResultsText,
    onWatchReplay,
  ]);

  useEffect(
    () => () => clearTimeout(copiedResetTimer.current),
    [],
  );

  return (
    <div className="grid grid-cols-2 gap-3 mt-3 animate-slideUpFadeIn lg:flex lg:flex-wrap" style={{ animationDelay: '0.2s' }}>
      <button
        onClick={() => navigate(getLangHome())}
        className="box min-w-0 rounded-lg px-3 py-4 bg-transparent text-foreground text-sm font-semibold cursor-pointer opacity-80 inline-flex items-center justify-center gap-2 lg:min-w-[150px] lg:flex-1 lg:px-8 lg:text-base"
      >
        <House aria-hidden size={18} />
        {t.mainMenu} <span className="ml-1 border px-1 rounded-xs font-light border-border text-secondary-foreground">M</span>
      </button>
      {onWatchReplay && (
        <button
          onClick={onWatchReplay}
          className="box min-w-0 rounded-lg px-3 py-4 bg-transparent text-foreground text-sm font-semibold cursor-pointer opacity-80 inline-flex items-center justify-center gap-2 lg:min-w-[150px] lg:flex-1 lg:px-8 lg:text-base"
        >
          <Clapperboard aria-hidden size={18} />
          {t.watchReplay} <span className="ml-1 border px-1 rounded-xs font-light border-border text-secondary-foreground">W</span>
        </button>
      )}
      {getCopyResultsText && (
        <button
          type="button"
          onClick={() => void handleCopyResults()}
          className="box min-w-0 rounded-lg px-3 py-4 bg-transparent text-foreground text-sm font-semibold cursor-pointer opacity-80 flex items-center justify-center gap-2 lg:min-w-[150px] lg:flex-1 lg:px-8 lg:text-base"
        >
          {resultsCopied ? (
            <Check aria-hidden size={18} />
          ) : (
            <Copy aria-hidden size={18} />
          )}
          {resultsCopied ? t.copied : t.copyResults}
          <span className="ml-1 border px-1 rounded-xs font-light border-border text-secondary-foreground">C</span>
        </button>
      )}
      {showRematch && (
        <div className="relative min-w-0 group lg:min-w-[150px] lg:flex-1">
          <button
            onClick={handleRematch}
            disabled={!canRematch}
            className={`box rounded-lg px-3 py-4 bg-transparent text-foreground text-sm font-semibold w-full lg:px-8 lg:text-base ${canRematch ? 'cursor-pointer opacity-80' : 'cursor-not-allowed opacity-40'
              } inline-flex items-center justify-center gap-2`}
          >
            <RotateCcw aria-hidden size={18} />
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
          className="box min-w-0 rounded-lg px-3 py-4 bg-transparent text-foreground text-sm font-semibold cursor-pointer opacity-80 inline-flex items-center justify-center gap-2 lg:min-w-[150px] lg:flex-1 lg:px-8 lg:text-base"
        >
          <Keyboard aria-hidden size={18} />
          {t.playAgain} <span className="ml-1 border px-1 rounded-xs font-light border-border text-secondary-foreground">P</span>
        </button>
      )}
    </div>
  );
};
