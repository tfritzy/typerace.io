import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { type GameMode, type PlayerProgress } from "../types/stdb";
import type { GameTypeValue } from "../components/MatchTypeSelector";
import { useToast } from "./useToast";
import { useDatabase } from "../contexts/SpacetimeContext";
import type { EventContext } from "../../module_bindings";

export const useFindGame = () => {
  const [isSearching, setIsSearching] = useState(false);
  const conn = useDatabase();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const pendingJoinCodeRef = useRef<string | null>(null);

  useEffect(() => {
    if (!conn || !pendingJoinCodeRef.current) return;

    const joinCode = pendingJoinCodeRef.current;

    const handleInsert = (_ctx: EventContext, progress: PlayerProgress) => {
      if (conn?.identity && progress.playerId.isEqual(conn.identity)) {
        if (progress.joinCode === joinCode) {
          navigate(`/game/${progress.gameId}`, { replace: true });
          setIsSearching(false);
          pendingJoinCodeRef.current = null;
        }
      }
    };

    conn.db.playerprogress.onInsert(handleInsert);

    const subscription = conn.subscriptionBuilder()
      .subscribe([`SELECT * FROM playerprogress WHERE JoinCode = '${joinCode}'`]);

    return () => {
      conn.db.playerprogress.removeOnInsert(handleInsert);
      subscription.unsubscribe();
    };
  }, [conn, navigate, pendingJoinCodeRef.current]);

  const findGame = useCallback(async (mode: GameMode, gameType: GameTypeValue) => {
    if (!conn || isSearching) return;

    setIsSearching(true);

    const newJoinCode = `join_${Date.now()}_${crypto.randomUUID().substring(0, 7)}`;
    pendingJoinCodeRef.current = newJoinCode;

    const gameTypeEnum = { tag: gameType };
    try {
      await conn.reducers.joinGame({
        gameMode: mode,
        joinCode: newJoinCode,
        gameType: gameTypeEnum as never
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to join game";
      showToast(message);
      setIsSearching(false);
      pendingJoinCodeRef.current = null;
    }
  }, [conn, isSearching, showToast]);

  return { findGame, isSearching };
};
