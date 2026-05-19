import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import type { Game } from "../types/stdb";
import { useDatabase } from "../contexts/SpacetimeContext";

const PULSE_PERIOD_MS = 1000;
const PULSE_BRIGHT_MS = 150;
const PULSE_FADE_MS = 800;
const BUFO_GIF_PATH = "/bufo-lets-goo.gif";
const BUFO_POST_START_MS = 1200;

export const Countdown = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const conn = useDatabase();
  const [game, setGame] = useState<Game | null>(null);
  const [count, setCount] = useState(3);
  const [showCount, setShowCount] = useState(false);
  const [pulseOn, setPulseOn] = useState(false);
  const [showBufo, setShowBufo] = useState(false);

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
    if (isCountdown) {
      setShowBufo(true);
      return;
    }
    if (!isRacing) {
      setShowBufo(false);
      return;
    }
    if (!showBufo) return;
    const hideBufoTimer = setTimeout(() => setShowBufo(false), BUFO_POST_START_MS);

    return () => {
      clearTimeout(hideBufoTimer);
    };
  }, [isCountdown, isRacing, showBufo]);

  useEffect(() => {
    if (!isCountdown || !game) {
      setShowCount(false);
      return;
    }
    const ms = Number(game.countdownDurationMs);
    const initial = Math.max(1, Math.ceil(ms / 1000));
    setCount(initial);
    setShowCount(true);
  }, [isCountdown, game?.id]);

  useEffect(() => {
    if (!isCountdown) return;
    if (count <= 1) {
      const t = setTimeout(() => setShowCount(false), 1000);
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
              : `opacity ${PULSE_FADE_MS}ms ease-in, box-shadow ${PULSE_FADE_MS}ms ease-out`,
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
        </div>
      )}
      {showBufo && (
        <div
          className="fixed top-[52%] -translate-y-1/2 pointer-events-none z-50 hidden xl:block"
          style={{
            left: "max(1rem, calc((100vw - var(--max-content-width)) / 2 - 4.5rem))",
          }}
        >
          <img
            src={BUFO_GIF_PATH}
            alt=""
            aria-hidden="true"
            className="w-10 h-10 sm:w-14 sm:h-14"
            style={{
              animation: "bufoFadeScaleIn 220ms ease-out both",
            }}
          />
        </div>
      )}
    </>
  );
};
