import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import type { Game } from "../types/stdb";
import { useDatabase } from "../contexts/SpacetimeContext";
import bufoLetsGo from "../assets/bufo-lets-goo.gif";

const PULSE_PERIOD_MS = 1000;
const PULSE_BRIGHT_MS = 150;
const PULSE_FADE_MS = 800;

export const Countdown = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const { conn } = useDatabase();
  const [game, setGame] = useState<Game | null>(null);
  const [count, setCount] = useState(3);
  const [showCount, setShowCount] = useState(false);
  const [showImage, setShowImage] = useState(false);
  const [pulseOn, setPulseOn] = useState(false);
  const previousGameState = useRef<string>();

  useEffect(() => {
    if (!conn || !gameId) return;

    const handleGameInsert = (_ctx: unknown, g: Game) => {
      if (g.id.toString() === gameId) setGame(g);
    };
    const handleGameUpdate = (_ctx: unknown, _o: Game, g: Game) => {
      if (g.id.toString() === gameId) setGame(g);
    };

    conn.db.game.onInsert(handleGameInsert);
    conn.db.game.onUpdate(handleGameUpdate);

    const currentGame = conn.db.game.id.find(gameId);
    if (currentGame) setGame(currentGame);

    return () => {
      conn.db.game.removeOnInsert(handleGameInsert);
      conn.db.game.removeOnUpdate(handleGameUpdate);
    };
  }, [conn, gameId]);

  const tag = game?.state?.tag;
  const isCountdown = tag === "Countdown";
  const isRacing = tag === "Racing";

  useEffect(() => {
    if (!isCountdown || !game) {
      setShowCount(false);
      return;
    }
    const ms = Number(game.countdownDurationMs);
    const initial = Math.max(1, Math.ceil(ms / 1000));
    setCount(initial);
    setShowCount(true);
    setShowImage(false);
  }, [isCountdown, game?.id]);

  useEffect(() => {
    if (!isCountdown) return;
    if (count <= 0) {
      setShowCount(false);
      return;
    }
    const t = setTimeout(() => setCount((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [isCountdown, count]);

  useEffect(() => {
    const previousState = previousGameState.current;
    previousGameState.current = tag;

    if (isCountdown) {
      setShowImage(false);
      return;
    }

    if (!isRacing) {
      setShowImage(false);
      return;
    }

    if (previousState !== "Countdown") return;

    setShowImage(true);
    const timeout = setTimeout(() => setShowImage(false), 2000);
    return () => clearTimeout(timeout);
  }, [isCountdown, isRacing, tag]);

  useEffect(() => {
    if (!isCountdown) {
      setPulseOn(false);
      return;
    }
    let offTimer: ReturnType<typeof setTimeout> | null = null;
    const fire = () => {
      setPulseOn(true);
      offTimer = setTimeout(() => setPulseOn(false), PULSE_BRIGHT_MS);
    };
    fire();
    const interval = setInterval(fire, PULSE_PERIOD_MS);
    return () => {
      clearInterval(interval);
      if (offTimer) clearTimeout(offTimer);
      setPulseOn(false);
    };
  }, [isCountdown]);

  const showBorder = isCountdown || isRacing;
  const bright = isRacing || pulseOn;
  const accent = "var(--accent-primary)";

  return (
    <>
      {showBorder && (
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            borderRadius: "calc(var(--radius, 8px) * 2)",
            border: `1px solid ${accent}`,
            opacity: bright ? 1 : 0,
            boxShadow: bright
              ? `0 0 12px 0 color-mix(in srgb, ${accent} 35%, transparent)`
              : "0 0 0 0 transparent",
            transition: bright
              ? "none"
              : `opacity ${PULSE_FADE_MS}ms ease-in, box-shadow ${PULSE_FADE_MS}ms ease-out`,
          }}
        />
      )}
      {showCount && (
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
          <div
            key={count}
            className="countdown-number text-accent"
            style={{
              fontSize: "9rem",
              animation: "countdownPop 1s ease-out forwards",
            }}
          >
            {count}
          </div>
          <style>{`
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
      `}</style>
        </div>
      )}
      {showImage && (
        <div
          className="fixed top-[52%] -translate-y-1/2 pointer-events-none z-50"
          style={{
            left: "max(1rem, calc((100vw - var(--max-content-width)) / 2 - 4.5rem))",
          }}
        >
          <img
            src={bufoLetsGo}
            alt=""
            aria-hidden="true"
            className="w-10 h-10 sm:w-14 sm:h-14"
            style={{
              animation: "fadeInOut 2s ease-out forwards",
            }}
          />
          <style>{`
        @keyframes fadeInOut {
          0% {
            transform: scale(0.9) scaleX(-1);
          }
          20% {
            opacity: 1;
            transform: scale(1) scaleX(-1);
          }
          80% {
            opacity: 1;
            transform: scale(1) scaleX(-1);
          }
          100% {
            opacity: 0;
            transform: scale(0.8) scaleX(-1);
          }
        }
      `}</style>
        </div>
      )}
    </>
  );
};
