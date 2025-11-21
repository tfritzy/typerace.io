import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import type {
  DbConnection,
  GameMode,
} from "../../module_bindings";
import { useSpacetimeDB, useTable } from "spacetimedb/react";
import type { GameTypeValue } from "../components/MatchTypeSelector";

export const useFindGame = () => {
  const [joinCode, setJoinCode] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const conn = useSpacetimeDB<DbConnection>();
  const navigate = useNavigate();
  const playerProgress = useTable("playerprogress").rows;
  const hasCalled = useRef(false);

  useEffect(() => {
    if (!joinCode || !conn.identity) return;

    const myProgress = playerProgress.find(
      (row) => row.playerId.isEqual(conn.identity!) && row.joinCode === joinCode
    );

    if (myProgress) {
      navigate(`/game/${myProgress.gameId.toString()}`, { replace: true });
      setIsSearching(false);
      setJoinCode(null);
      hasCalled.current = false;
    }
  }, [playerProgress, joinCode, conn.identity, navigate]);

  const findGame = (mode: GameMode, gameType: GameTypeValue) => {
    if (!conn || hasCalled.current) return;

    hasCalled.current = true;
    setIsSearching(true);

    const newJoinCode = `join_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    setJoinCode(newJoinCode);

    const gameTypeEnum = { tag: gameType };
    conn.reducers.joinGame(mode, newJoinCode, gameTypeEnum);
  };

  return { findGame, isSearching };
};
