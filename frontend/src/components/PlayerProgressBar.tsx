import { PlayerAvatar } from "./PlayerAvatar";
import { Bot, X } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import {
  memo,
  useMemo,
  useState,
  useEffect,
  useCallback,
  type KeyboardEvent,
  type MouseEvent,
} from "react";
import { getPlayerProgressGradient } from "../utils/colorMapping";
import { getInitialTheme } from "../utils/themes";
import { getLanguageFromSlug } from "@/utils/modes";

type PlayerProgressBarProps = {
  name: string;
  level: number;
  progressIndex: number;
  phraseLength: number;
  identityHash: string;
  playerPublicId: string;
  isEmphasized: boolean;
  isLoading?: boolean;
  wpm?: number;
  placement?: number;
  isBot?: boolean;
  isAnonymous?: boolean;
  onKick?: () => void;
  onClick?: (playerId: string) => void;
  playerColorTag?: string;
};

export const PlayerProgressBar = memo(
  ({
    name,
    level,
    progressIndex,
    phraseLength,
    identityHash,
    playerPublicId,
    isEmphasized,
    isLoading = false,
    wpm,
    placement,
    isBot = false,
    isAnonymous = false,
    onKick,
    onClick,
    playerColorTag,
  }: PlayerProgressBarProps) => {
    const progressPercentage = (progressIndex / phraseLength) * 100;
    const languageSlug = useParams().lang || "en";
    const language = getLanguageFromSlug(languageSlug);

    const [currentTheme, setCurrentTheme] = useState(getInitialTheme);
    const onThemeChange = useCallback(
      () => setCurrentTheme(getInitialTheme()),
      [],
    );
    useEffect(() => {
      window.addEventListener("themechange", onThemeChange);
      return () => window.removeEventListener("themechange", onThemeChange);
    }, [onThemeChange]);

    const handleClick = useCallback(
      () => onClick?.(identityHash),
      [identityHash, onClick],
    );
    const handleKeyDown = useCallback(
      (event: KeyboardEvent<HTMLDivElement>) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          handleClick();
        }
      },
      [handleClick],
    );
    const stopClickPropagation = useCallback(
      (event: MouseEvent) => event.stopPropagation(),
      [],
    );
    const handleKick = useCallback(
      (event: MouseEvent) => {
        event.stopPropagation();
        onKick?.();
      },
      [onKick],
    );

    const progressGradient = useMemo(
      () =>
        playerColorTag
          ? getPlayerProgressGradient(playerColorTag)
          : "linear-gradient(to right, var(--accent-dark), var(--accent-primary))",
      [playerColorTag, currentTheme],
    );

    let speedLabel = "";
    if (!isLoading && wpm !== undefined && wpm > 0) {
      speedLabel =
        language.measurementMode === "wpm"
          ? `${Math.round(wpm)} WPM`
          : `${Math.round(wpm * 5)} CPM`;
    }

    return (
      <div
        role={onClick ? "button" : undefined}
        tabIndex={onClick ? 0 : undefined}
        aria-pressed={onClick ? isEmphasized : undefined}
        aria-label={onClick ? `View ${name}` : undefined}
        onClick={onClick ? handleClick : undefined}
        onKeyDown={onClick ? handleKeyDown : undefined}
        className={`box relative h-[78px] w-full rounded-lg p-4 py-4 transition-all ${
          onClick ? "cursor-pointer hover:border-muted-foreground" : ""
        }`}
      >
        <div
          className={`flex h-11 w-full items-center gap-4 transition-all duration-500 ${
            isLoading
              ? "opacity-20"
              : "opacity-100 animate-[slideInFromLeft_0.5s_ease-out]"
          }`}
        >
          {isLoading || isAnonymous || isBot ? (
            <PlayerAvatar
              key="avatar"
              size={40}
              identity={identityHash}
              isHighlighted={isEmphasized}
              isLoading={isLoading}
              placement={placement}
              playerColorTag={playerColorTag}
              isBot={isBot}
            />
          ) : (
            <Link
              key="avatar-link"
              to={`/profile/${playerPublicId}`}
              onClick={stopClickPropagation}
              className="shrink-0"
            >
              <PlayerAvatar
                key="avatar"
                size={40}
                identity={identityHash}
                isHighlighted={isEmphasized}
                isLoading={isLoading}
                placement={placement}
                playerColorTag={playerColorTag}
                isBot={isBot}
              />
            </Link>
          )}

          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <div className="flex min-h-5 items-center justify-between gap-2">
              <div className="flex min-w-0 flex-1 items-center gap-2">
                {isLoading ? (
                  <span className="text-sm font-semibold text-muted-foreground">
                    Waiting...
                  </span>
                ) : (
                  <>
                    <div className="flex min-w-0 items-center gap-1">
                      <span
                        className={`truncate text-sm font-semibold ${isEmphasized ? "text-foreground" : "text-muted-foreground"}`}
                      >
                        {name}
                      </span>
                      {isBot && (
                        <div className="group relative">
                          <Bot className="w-4 h-4 text-muted-foreground" />
                          <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-2 bg-card text-foreground text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none z-10 shadow-lg w-64">
                            This player is a bot. Share this game with your
                            friends to reduce the amount they need to be added
                            to games.
                            <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-card"></div>
                          </div>
                        </div>
                      )}
                    </div>
                    <span className="shrink-0 text-xs font-medium text-muted-foreground">
                      Lvl {isBot ? 1 : level}
                    </span>
                  </>
                )}
              </div>
              <span
                className={`min-w-[5.25rem] shrink-0 text-right text-sm font-semibold ${speedLabel ? "visible" : "invisible"} ${isEmphasized ? "text-foreground" : "text-muted-foreground"}`}
              >
                {speedLabel || ""}
              </span>
            </div>
            <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-200"
                style={{
                  width: `${Math.min(100, progressPercentage)}%`,
                  background: progressGradient,
                  opacity: isEmphasized ? 1 : 0.35,
                }}
              />
            </div>
          </div>
          {onKick && (
            <button
              onClick={handleKick}
              className="absolute right-2 top-2 p-0.5 rounded-full bg-card text-muted-foreground opacity-50 hover:opacity-100 hover:text-foreground transition-all duration-200 cursor-pointer"
              aria-label="Kick player"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>
    );
  },
);
