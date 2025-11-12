import { useParams } from "react-router-dom";
import { useEffect, useCallback } from "react";
import { useSpacetimeDB, useTable } from "spacetimedb/react";
import type { DbConnection, Game, PlayerProgress } from "../../module_bindings";
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
      .subscribe(`select * from game where Id = ${gameId}`);
    
    const playerProgressSubscription = conn.subscriptionBuilder()
      .onError((error: ErrorContextInterface) => {
        console.error("Error subscribing to player_progress:", error);
      })
      .subscribe(`select * from player_progress where GameId = ${gameId}`);
    
    return () => {
      gameSubscription.unsubscribe();
      playerProgressSubscription.unsubscribe();
    };
  }, [conn, gameId]);
  
  const { rows: games } = useTable<DbConnection, Game>("game");
  const { rows: playerProgress } = useTable<DbConnection, PlayerProgress>("player_progress");

  const game = games.find(g => g.Id.toString() === gameId);
  const gamePlayerProgress = playerProgress.filter(pp => pp.GameId.toString() === gameId);

  const handleProgress = useCallback((correctCharCount: number) => {
    if (!conn || !gameId) return;
    
    conn.reducers.UpdateProgress(gameId, BigInt(correctCharCount));
  }, [conn, gameId]);

  if (!game) {
    return <div>Game not found</div>;
  }

  return (
    <div style={{ padding: "20px", fontFamily: "monospace" }}>
      <h1>Game Details</h1>
      <div>
        <h2>Game Table:</h2>
        <div>Id: {game.Id.toString()}</div>
        <div>Phrase: {game.Phrase}</div>
        <div>CreatedAt: {game.CreatedAt.toString()}</div>
        <div>State: {game.State.tag}</div>
        <div>GameMode: {game.GameMode.tag}</div>
      </div>
      
      <div style={{ marginTop: "20px" }}>
        <h2>Type the phrase:</h2>
        <TypeBox phrase={game.Phrase} onProgress={handleProgress} />
      </div>
      
      <div style={{ marginTop: "20px" }}>
        <h2>Player Progress:</h2>
        {gamePlayerProgress.map((pp) => (
          <div key={pp.Id.toString()} style={{ marginTop: "10px", border: "1px solid #ccc", padding: "10px" }}>
            <div>Id: {pp.Id.toString()}</div>
            <div>PlayerId: {pp.PlayerId.toHexString()}</div>
            <div>GameId: {pp.GameId.toString()}</div>
            <div>ProgressIndex: {pp.ProgressIndex.toString()}</div>
            <div>IsBot: {pp.IsBot.toString()}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
