import { useCallback, useEffect, useMemo, useState } from "react";
import { useDatabase } from "../../contexts/SpacetimeContext";
import { createScoreProof } from "../../utils/scoreProof";
import { throttle } from "../../utils/throttle";
import type { CosmicDefenseGame } from "./game";

const SCORE_PUBLISH_INTERVAL_MS = 10_000;

type ScoreProps = {
  game: CosmicDefenseGame | null;
  gameId: string;
  language: string;
};

export const Score = ({ game, gameId, language }: ScoreProps) => {
  const conn = useDatabase();
  const [score, setScore] = useState(0);
  const publishScore = useCallback((nextScore: number) => {
    if (!conn) return;
    conn.reducers.publishScore({
      gameId,
      language,
      score: nextScore,
      scoreProof: createScoreProof(gameId, language, nextScore),
    });
  }, [conn, gameId, language]);
  const throttledPublishScore = useMemo(
    () => throttle(publishScore, SCORE_PUBLISH_INTERVAL_MS),
    [publishScore]
  );

  useEffect(() => {
    if (!game) {
      setScore(0);
      return;
    }

    setScore(game.state.score);
    const unsubScoreChanged = game.state.onScoreChanged.subscribe((data) => {
      setScore(data.score);
      throttledPublishScore(data.score);
    });

    return () => {
      unsubScoreChanged();
      throttledPublishScore.cancel();
    };
  }, [game, throttledPublishScore]);

  return (
    <>
      <span className="text-[11px] text-[#585b70]">Score</span>
      <span className="text-[11px] text-[#cdd6f4] font-semibold">{score.toLocaleString()}</span>
    </>
  );
};
