import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import type {
  DbConnection,
  GameMode,
} from "../../module_bindings";
import { useSpacetimeDB, useTable } from "spacetimedb/react";
import type { GameTypeValue } from "../components/MatchTypeSelector";

export const FindGamePage = () => {
  const [searchParams] = useSearchParams();
  const mode = searchParams.get("mode") || "English500";
  const gameType = searchParams.get("gameType") || "Public";

  const [joinCode, setJoinCode] = useState<string | null>(null);
  const conn = useSpacetimeDB<DbConnection>();
  const navigate = useNavigate();
  const playerProgress = useTable(
    "playerprogress"
  ).rows;

  useEffect(() => {
    if (!conn) return;

    const newJoinCode = `join_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    setJoinCode(newJoinCode);

    const selectedMode: GameMode = { tag: mode as any };
    const gameTypeEnum = { tag: gameType as GameTypeValue };
    conn.reducers.joinGame(selectedMode, newJoinCode, gameTypeEnum);
  }, [conn, mode, gameType]);

  useEffect(() => {
    if (!joinCode || !conn.identity) return;

    const myProgress = playerProgress.find(
      (row) => row.playerId.isEqual(conn.identity!) && row.joinCode === joinCode
    );

    if (myProgress) {
      navigate(`/game/${myProgress.gameId.toString()}`, { replace: true });
    }
  }, [playerProgress, joinCode, conn.identity, navigate]);

  return null;
};
