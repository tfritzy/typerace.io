import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { TypeBox } from "../components/TypeBox";
import { EmptyPlayerProgressBars } from "../components/EmptyPlayerProgressBars";
import { Header } from "../components/Header";
import { useDatabase } from "../contexts/SpacetimeContext";
import type { GameType, PlayerProgress } from "../types/stdb";
import {
  getPreferredGameType,
  getPreferredMode,
} from "../utils/gamePreferences";

export function FindGamePage() {
  const { lang } = useParams<{ lang?: string }>();
  const conn = useDatabase();
  const navigate = useNavigate();
  const [{ mode, gameType, joinCode, langPrefix }] = useState(() => ({
    mode: getPreferredMode(lang),
    gameType: getPreferredGameType(),
    joinCode: `join_${crypto.randomUUID()}`,
    langPrefix: lang ? `/${lang}` : "",
  }));
  const slotCount = gameType === "Practice" ? 1 : 3;
  const hasSubmittedSearch = useRef(false);

  useEffect(() => {
    if (!conn) return;

    const handleProgressInsert = (_ctx: unknown, progress: PlayerProgress) => {
      if (
        conn.identity &&
        progress.playerId.isEqual(conn.identity) &&
        progress.joinCode === joinCode
      ) {
        navigate(`${langPrefix}/game/${progress.gameId}`, {
          replace: true,
        });
      }
    };

    conn.db.playerprogress.onInsert(handleProgressInsert);
    const subscription = conn
      .subscriptionBuilder()
      .subscribe([`SELECT * FROM playerprogress WHERE JoinCode = '${joinCode}'`]);

    if (!hasSubmittedSearch.current) {
      hasSubmittedSearch.current = true;
      conn.reducers.joinGame({
        gameMode: mode,
        joinCode,
        gameType: { tag: gameType } as GameType,
      });
    }

    return () => {
      conn.db.playerprogress.removeOnInsert(handleProgressInsert);
      subscription.unsubscribe();
    };
  }, [conn, gameType, joinCode, langPrefix, mode, navigate]);

  return (
    <div className="relative h-full flex flex-col">
      <Header />
      <div className="flex-1 min-h-0 overflow-y-auto flex flex-col items-center px-4">
        <div className="content-container w-full my-auto">
          <div className="mb-3 grid gap-3">
            <EmptyPlayerProgressBars count={slotCount} />
          </div>
          <div className="text-2xl leading-[1.6]">
            <TypeBox phrase="" disabled hideCursor height="430px" />
          </div>
        </div>
      </div>
    </div>
  );
}
