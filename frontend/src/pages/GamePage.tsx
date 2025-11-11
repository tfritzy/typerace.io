import { useParams } from "react-router-dom";
import { useTable } from "spacetimedb/react";
import type { DbConnection, Game, PlayerProgress } from "../../module_bindings";

export const GamePage = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const { rows: games } = useTable<DbConnection, Game>("game");
  const { rows: playerProgress } = useTable<DbConnection, PlayerProgress>("player_progress");

  const game = games.find(g => g.Id.toString() === gameId);
  const gamePlayerProgress = playerProgress.filter(pp => pp.GameId.toString() === gameId);

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
        <div>State: {game.State}</div>
        <div>GameMode: {game.GameMode.tag}</div>
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
