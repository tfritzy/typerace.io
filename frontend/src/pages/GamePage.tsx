import { useParams } from "react-router-dom";
import { useEffect, useCallback } from "react";
import { useSpacetimeDB, useTable } from "spacetimedb/react";
import type { DbConnection, Game, PlayerProgress, Player } from "../../module_bindings";
import type { ErrorContextInterface } from "spacetimedb/sdk";
import { TypeBox } from "../components/TypeBox";

export const GamePage = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const conn = useSpacetimeDB<DbConnection>();

  useEffect(() => {
    if (!conn || !gameId) return;

    const gameSubscription = conn.subscriptionBuilder()
      .onError((error: ErrorContextInterface) => {
        console.error("Error subscribing to game:", error);
      })
      .subscribe(`select * from game where Id = '${gameId}'`);

    const playerProgressSubscription = conn.subscriptionBuilder()
      .onError((error: ErrorContextInterface) => {
        console.error("Error subscribing to playerprogress:", error);
      })
      .subscribe(`select * from playerprogress where GameId = '${gameId}'`);

    const playerSubscription = conn.subscriptionBuilder()
      .onError((error: ErrorContextInterface) => {
        console.error("Error subscribing to player:", error);
      })
      .subscribe(`select * from player`);

    return () => {
      gameSubscription.unsubscribe();
      playerProgressSubscription.unsubscribe();
      playerSubscription.unsubscribe();
    };
  }, [conn, gameId]);

  const { rows: games } = useTable<DbConnection, Game>("game");
  const { rows: playerProgress } = useTable<DbConnection, PlayerProgress>("playerprogress");
  const { rows: players } = useTable<DbConnection, Player>("player");

  const game = games.find(g => g.id.toString() === gameId);
  const gamePlayerProgress = playerProgress.filter(pp => pp.gameId.toString() === gameId);

  const getPlayerName = (playerId: any) => {
    if (!playerId || playerId.toHexString() === "0000000000000000000000000000000000000000000000000000000000000000") {
      return "Bot";
    }
    const player = players.find(p => p.id.isEqual(playerId));
    return player?.name || "Unknown";
  };

  const handleProgress = useCallback((correctCharCount: number) => {
    if (!conn || !gameId) return;

    conn.reducers.updateProgress(gameId, BigInt(correctCharCount));
  }, [conn, gameId]);

  if (!game) {
    return <div>Game not found</div>;
  }

  return (
    <div className="text-white" style={{ padding: "20px", fontFamily: "monospace" }}>
      <h1>Game Details</h1>
      <div>
        <h2>Game Table:</h2>
        <div>Id: {game.id.toString()}</div>
        <div>Phrase: {game.phrase}</div>
        <div>CreatedAt: {game.createdAt.toString()}</div>
        <div>State: {game.state.toString()}</div>
        <div>GameMode: {game.gameMode.tag}</div>
      </div>

      <div style={{ marginTop: "20px" }}>
        <h2>Type the phrase:</h2>
        <TypeBox phrase={game.phrase} onProgress={handleProgress} />
      </div>

      <div style={{ marginTop: "20px" }}>
        <h2>Player Progress:</h2>
        {gamePlayerProgress.map((pp) => (
          <div key={pp.id.toString()} style={{ marginTop: "10px", border: "1px solid #ccc", padding: "10px" }}>
            <div>Name: {getPlayerName(pp.playerId)}</div>
            <div>PlayerId: {pp.playerId.toHexString()}</div>
            <div>ProgressIndex: {pp.progressIndex.toString()}</div>
            <div>IsBot: {pp.isBot.toString()}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
