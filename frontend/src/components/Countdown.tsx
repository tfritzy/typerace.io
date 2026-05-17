import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import type { Game } from "../types/stdb";
import { useDatabase } from "../contexts/SpacetimeContext";

const PULSE_PERIOD_MS = 1000;
const PULSE_BRIGHT_MS = 250;
const PULSE_FADE_MS = 400;

export const Countdown = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const conn = useDatabase();
  const [game, setGame] = useState<Game | null>(null);
  const [count, setCount] = useState(3);
  const [showCount, setShowCount] = useState(false);
  const [showImage, setShowImage] = useState(false);
  const [pulseOn, setPulseOn] = useState(false);

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
      setShowImage(false);
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
      setShowImage(true);
      const t = setTimeout(() => {
        setShowCount(false);
        setShowImage(false);
      }, 2000);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setCount((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [isCountdown, count]);

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
              ? `0 0 24px 2px color-mix(in srgb, ${accent} 55%, transparent)`
              : "0 0 0 0 transparent",
            transition: `opacity ${PULSE_FADE_MS}ms ease-out, box-shadow ${PULSE_FADE_MS}ms ease-out`,
          }}
        />
      )}
      {showCount && (
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
          <div
            key={count}
            className="countdown-number text-foreground"
            style={{
              fontSize: "20rem",
              fontWeight: "bold",
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
      {showCount && showImage && (
        <div
          className="fixed top-[52%] -translate-y-1/2 pointer-events-none z-50"
          style={{
            left: "max(1rem, calc((100vw - var(--max-content-width)) / 2 - 4.5rem))",
          }}
        >
          <img
            src="/bufo-lets-goo.gif"
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
