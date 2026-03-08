import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { type GameMode } from "../types/stdb";
import type { GameTypeValue } from "../components/MatchTypeSelector";
import { useToast } from "./useToast";
import { useDatabase } from "../contexts/SpacetimeContext";
import { getLangPrefix } from "../utils/modes";

export const useFindGame = () => {
  const [isSearching, setIsSearching] = useState(false);
  const conn = useDatabase();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const pendingJoinCodeRef = useRef<string | null>(null);

  useEffect(() => {
    if (!conn || !pendingJoinCodeRef.current) return;

    const joinCode = pendingJoinCodeRef.current;

    const handleInsert = (_ctx: any, progress: any) => {
      if (conn?.identity && progress.playerId.isEqual(conn.identity)) {
        if (progress.joinCode === joinCode) {
          navigate(`${getLangPrefix()}/game/${progress.gameId}`, { replace: true });
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

  const findGame = useCallback((mode: GameMode, gameType: GameTypeValue) => {
    if (!conn || isSearching) return;

    setIsSearching(true);

    const uniqueId = typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}_${Math.floor(Math.random() * 1_000_000_000)}`;
    const newJoinCode = `join_${uniqueId}`;
    pendingJoinCodeRef.current = newJoinCode;

    const gameTypeEnum = { tag: gameType };
    conn.reducers.joinGame({
      gameMode: mode,
      joinCode: newJoinCode,
      gameType: gameTypeEnum as any
    }).catch((error: unknown) => {
      showToast(String(error));
      setIsSearching(false);
      pendingJoinCodeRef.current = null;
    });
  }, [conn, isSearching, showToast]);

  return { findGame, isSearching };
};
