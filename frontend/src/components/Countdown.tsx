import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import type { Game } from "../types/stdb";
import { useDatabase } from "../contexts/SpacetimeContext";

const PULSE_PERIOD_MS = 1000;
const PULSE_BRIGHT_MS = 60;
const PULSE_FADE_MS = 800;

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
              ? `0 0 12px 0 color-mix(in srgb, ${accent} 35%, transparent)`
              : "0 0 0 0 transparent",
            transition: bright
              ? "none"
              : `opacity ${PULSE_FADE_MS}ms ease-out, box-shadow ${PULSE_FADE_MS}ms ease-out`,
          }}
        />
      )}
      {showCount && (
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
          <div
            key={count}
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              animation: "countdownWrapper 1s cubic-bezier(0.22, 1, 0.36, 1) forwards",
            }}
          >
            <svg
              viewBox="0 0 100 100"
              style={{
                position: "absolute",
                width: "18rem",
                height: "18rem",
                transform: "rotate(-90deg)",
                animation: "countdownRingFade 1s ease-out forwards",
              }}
            >
              <circle
                cx="50"
                cy="50"
                r="44"
                fill="none"
                stroke="var(--accent-primary)"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeDasharray="276.5"
                strokeDashoffset="0"
                style={{
                  animation: "countdownRingDrain 1s linear forwards",
                  opacity: 0.45,
                }}
              />
            </svg>
            <div
              style={{
                position: "absolute",
                width: "16rem",
                height: "16rem",
                borderRadius: "50%",
                background:
                  "radial-gradient(circle, color-mix(in srgb, var(--accent-primary) 18%, transparent) 0%, transparent 70%)",
                animation: "countdownGlow 1s ease-out forwards",
              }}
            />
            <div
              style={{
                fontSize: "13rem",
                fontWeight: "900",
                lineHeight: 1,
                color: "var(--accent-primary)",
                textShadow:
                  "0 0 30px color-mix(in srgb, var(--accent-primary) 90%, transparent), 0 0 70px color-mix(in srgb, var(--accent-primary) 45%, transparent)",
                position: "relative",
                letterSpacing: "-0.05em",
              }}
            >
              {count}
            </div>
          </div>
          <style>{`
        @keyframes countdownWrapper {
          0%   { opacity: 0; transform: scale(1.7); filter: blur(14px); }
          18%  { opacity: 1; transform: scale(0.94); filter: blur(0px); }
          30%  { transform: scale(1.03); }
          42%  { transform: scale(1); }
          72%  { opacity: 1; transform: scale(1); filter: blur(0px); }
          100% { opacity: 0; transform: scale(0.65); filter: blur(8px); }
        }
        @keyframes countdownGlow {
          0%   { opacity: 0; transform: scale(2.2); }
          25%  { opacity: 1; transform: scale(1); }
          75%  { opacity: 0.7; }
          100% { opacity: 0; transform: scale(1.3); }
        }
        @keyframes countdownRingDrain {
          0%   { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: 276.5; }
        }
        @keyframes countdownRingFade {
          0%   { opacity: 0; }
          15%  { opacity: 1; }
          80%  { opacity: 0.8; }
          100% { opacity: 0; }
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
