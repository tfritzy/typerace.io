import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { type GameMode } from "../types/stdb";
import type { GameTypeValue } from "../components/MatchTypeSelector";
import { useToast } from "./useToast";
import { useDatabase } from "../contexts/SpacetimeContext";

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
          navigate(`/game/${progress.gameId.toString()}`, { replace: true });
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

  useEffect(() => {
    if (!conn) return;

    const handleJoinGameResult: Parameters<typeof conn.reducers.onJoinGame>[0] = (
      ctx,
      args
    ) => {
      if (!ctx.event.callerIdentity.isEqual(conn.identity!)) return;
      if (pendingJoinCodeRef.current !== args.joinCode) return;

      if (ctx.event.status.tag === "Failed") {
        showToast(ctx.event.status.value);
        setIsSearching(false);
        pendingJoinCodeRef.current = null;
      } else if (ctx.event.status.tag === "OutOfEnergy") {
        showToast("Server out of energy. Please try again later.");
        setIsSearching(false);
        pendingJoinCodeRef.current = null;
      }
    };

    conn.reducers.onJoinGame(handleJoinGameResult);
    return () => {
      conn.reducers.removeOnJoinGame(handleJoinGameResult);
    };
  }, [conn, showToast]);

  const findGame = useCallback((mode: GameMode, gameType: GameTypeValue) => {
    if (!conn || isSearching) return;

    setIsSearching(true);

    const newJoinCode = `join_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    pendingJoinCodeRef.current = newJoinCode;

    const gameTypeEnum = { tag: gameType };
    conn.reducers.joinGame({
      gameMode: mode,
      joinCode: newJoinCode,
      gameType: gameTypeEnum as any
    });
  }, [conn, isSearching]);

  return { findGame, isSearching };
};
