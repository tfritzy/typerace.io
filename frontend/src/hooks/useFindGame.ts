import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import type {
  DbConnection,
  GameMode,
} from "../../module_bindings";
import { useSpacetimeDB, useTable } from "spacetimedb/react";
import type { GameTypeValue } from "../components/MatchTypeSelector";
import { useToast } from "./useToast";

export const useFindGame = () => {
  const [joinCode, setJoinCode] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const conn = useSpacetimeDB<DbConnection>();
  const navigate = useNavigate();
  const playerProgress = useTable("playerprogress").rows;
  const { showToast } = useToast();
  const pendingJoinCodeRef = useRef<string | null>(null);

  useEffect(() => {
    if (!joinCode || !conn.identity) return;

    const myProgress = playerProgress.find(
      (row) => row.playerId.isEqual(conn.identity!) && row.joinCode === joinCode
    );

    if (myProgress) {
      navigate(`/game/${myProgress.gameId.toString()}`, { replace: true });
      setIsSearching(false);
      setJoinCode(null);
      pendingJoinCodeRef.current = null;
    }
  }, [playerProgress, joinCode, conn.identity, navigate]);

  useEffect(() => {
    if (!conn) return;

    const handleJoinGameResult: Parameters<typeof conn.reducers.onJoinGame>[0] = (
      ctx,
      _gameMode,
      responseJoinCode
    ) => {
      if (!ctx.event.callerIdentity.isEqual(conn.identity!)) return;
      if (pendingJoinCodeRef.current !== responseJoinCode) return;

      if (ctx.event.status.tag === "Failed") {
        showToast(ctx.event.status.value);
        setIsSearching(false);
        setJoinCode(null);
        pendingJoinCodeRef.current = null;
      } else if (ctx.event.status.tag === "OutOfEnergy") {
        showToast("Server out of energy. Please try again later.");
        setIsSearching(false);
        setJoinCode(null);
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
    setJoinCode(newJoinCode);
    pendingJoinCodeRef.current = newJoinCode;

    const gameTypeEnum = { tag: gameType };
    conn.reducers.joinGame(mode, newJoinCode, gameTypeEnum);
  }, [conn, isSearching]);

  return { findGame, isSearching };
};
