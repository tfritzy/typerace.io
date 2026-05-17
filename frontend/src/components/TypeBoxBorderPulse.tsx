import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useParams } from "react-router-dom";
import { useDatabase } from "../contexts/SpacetimeContext";
import type { Game } from "../types/stdb";

export const TYPE_BOX_FRAME_ID = "type-box-frame";

export const TypeBoxBorderPulse = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const conn = useDatabase();
  const [game, setGame] = useState<Game | null>(null);
  const [target, setTarget] = useState<HTMLElement | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!conn || !gameId) {
      setGame(null);
      return;
    }

    const onInsert = (_ctx: unknown, g: Game) => {
      if (g.id.toString() === gameId) setGame(g);
    };
    const onUpdate = (_ctx: unknown, _old: Game, g: Game) => {
      if (g.id.toString() === gameId) setGame(g);
    };

    conn.db.game.onInsert(onInsert);
    conn.db.game.onUpdate(onUpdate);

    const current = conn.db.game.id.find(gameId);
    if (current) setGame(current);

    return () => {
      conn.db.game.removeOnInsert(onInsert);
      conn.db.game.removeOnUpdate(onUpdate);
    };
  }, [conn, gameId]);

  const tag = game?.state?.tag;
  const isCountdown = tag === "Countdown";
  const isRacing = tag === "Racing";

  useEffect(() => {
    if (!isCountdown) return;
    setTick((t) => t + 1);
    const interval = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, [isCountdown]);

  useEffect(() => {
    if (!isCountdown && !isRacing) {
      setTarget(null);
      return;
    }
    const find = () => setTarget(document.getElementById(TYPE_BOX_FRAME_ID));
    find();
    const raf = requestAnimationFrame(find);
    return () => cancelAnimationFrame(raf);
  }, [isCountdown, isRacing]);

  if (!target) return null;

  return createPortal(
    isCountdown ? (
      <div
        key={tick}
        aria-hidden="true"
        className="type-box-border-pulse type-box-border-pulse--tick"
      />
    ) : isRacing ? (
      <div
        aria-hidden="true"
        className="type-box-border-pulse type-box-border-pulse--active"
      />
    ) : null,
    target
  );
};
