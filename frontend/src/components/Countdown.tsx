import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import type { Game } from "../types/stdb";
import { useDatabase } from "../contexts/SpacetimeContext";
import { getCountdownStep } from "../utils/countdown";
import bufoLetsGo from "../assets/bufo-lets-goo.gif";

type VisualState =
  | { phase: "idle" }
  | {
      phase: "countdown";
      gameId: string;
      deadlineMs: number;
      count: number | null;
    }
  | { phase: "racing"; gameId: string; celebrate: boolean };

export const Countdown = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const { conn, latencyDeltaMs } = useDatabase();
  const [visual, setVisual] = useState<VisualState>({ phase: "idle" });
  const latencyDeltaRef = useRef(latencyDeltaMs);
  latencyDeltaRef.current = latencyDeltaMs;

  useEffect(() => {
    if (!conn || !gameId) return;

    const startCountdown = (game: Game) => {
      const deadlineMs =
        performance.now() +
        Math.max(
          0,
          Number(game.countdownDurationMs) - (latencyDeltaRef.current ?? 0) / 2,
        );
      const step = getCountdownStep(deadlineMs - performance.now(), true);

      setVisual((current) =>
        current.phase === "countdown" && current.gameId === game.id
          ? current
          : {
              phase: "countdown",
              gameId: game.id,
              deadlineMs,
              count: step.count,
            },
      );
    };

    const syncGame = (game: Game, previous?: Game) => {
      if (game.id !== gameId) return;

      if (
        game.state?.tag === "Countdown" &&
        previous?.state?.tag !== "Countdown"
      ) {
        startCountdown(game);
      } else if (game.state?.tag === "Racing") {
        setVisual((current) =>
          current.phase === "racing" && current.gameId === game.id
            ? current
            : {
                phase: "racing",
                gameId: game.id,
                celebrate: previous?.state?.tag === "Countdown",
              },
        );
      } else if (game.state?.tag !== "Countdown") {
        setVisual({ phase: "idle" });
      }
    };

    const handleGameInsert = (_ctx: unknown, game: Game) => syncGame(game);
    const handleGameUpdate = (_ctx: unknown, previous: Game, game: Game) =>
      syncGame(game, previous);

    conn.db.game.onInsert(handleGameInsert);
    conn.db.game.onUpdate(handleGameUpdate);

    const currentGame = conn.db.game.id.find(gameId);
    if (currentGame) syncGame(currentGame);

    return () => {
      conn.db.game.removeOnInsert(handleGameInsert);
      conn.db.game.removeOnUpdate(handleGameUpdate);
    };
  }, [conn, gameId]);

  useEffect(() => {
    if (visual.phase !== "countdown") return;

    const step = getCountdownStep(visual.deadlineMs - performance.now());
    const timeout = setTimeout(() => {
      const nextStep = getCountdownStep(visual.deadlineMs - performance.now());
      setVisual((current) => {
        if (
          current.phase !== "countdown" ||
          current.deadlineMs !== visual.deadlineMs
        ) {
          return current;
        }
        return !nextStep.complete
          ? { ...current, count: nextStep.count }
          : { phase: "racing", gameId: current.gameId, celebrate: true };
      });
    }, step.delayMs);

    return () => clearTimeout(timeout);
  }, [visual]);

  const isCountdown = visual.phase === "countdown" && visual.gameId === gameId;
  const isRacing = visual.phase === "racing" && visual.gameId === gameId;
  const accent = "var(--accent-primary)";

  return (
    <>
      {(isCountdown || isRacing) && (
        <div
          key={isCountdown ? visual.count : "racing"}
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            borderRadius: "calc(var(--radius, 8px) * 2)",
            border: `1px solid ${accent}`,
            opacity: isRacing ? 1 : 0,
            boxShadow: isRacing
              ? `0 0 9px 0 color-mix(in srgb, ${accent} 24%, transparent)`
              : "none",
            animation:
              isCountdown && visual.count !== null
                ? "countdownPulse 1s linear forwards"
                : undefined,
          }}
        />
      )}

      {isCountdown && visual.count !== null && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
          <div
            key={visual.count}
            className="countdown-number text-accent relative -top-6"
            style={{
              fontSize: "9rem",
              animation: "countdownPop 1s ease-out forwards",
            }}
          >
            {visual.count}
          </div>
        </div>
      )}

      {isRacing && visual.celebrate && (
        <div className="absolute top-0 left-0 pointer-events-none z-50 -translate-x-full -ml-1">
          <img
            src={bufoLetsGo}
            alt=""
            aria-hidden="true"
            className="w-10 h-10 sm:w-14 sm:h-14"
            style={{ animation: "countdownCelebrate 2s ease-out forwards" }}
          />
        </div>
      )}

      <style>{`
        @keyframes countdownPulse {
          0%, 15% {
            opacity: 1;
            box-shadow: 0 0 9px 0 color-mix(in srgb, ${accent} 24%, transparent);
          }
          95%, 100% {
            opacity: 0;
            box-shadow: 0 0 0 0 transparent;
          }
        }

        @keyframes countdownPop {
          0% {
            opacity: 1;
            transform: scale(1);
          }
          100% {
            opacity: 0;
            transform: scale(0.8);
          }
        }

        @keyframes countdownCelebrate {
          0% {
            transform: scale(0.9) scaleX(-1);
          }
          20%, 80% {
            opacity: 1;
            transform: scale(1) scaleX(-1);
          }
          100% {
            opacity: 0;
            transform: scale(0.8) scaleX(-1);
          }
        }
      `}</style>
    </>
  );
};
