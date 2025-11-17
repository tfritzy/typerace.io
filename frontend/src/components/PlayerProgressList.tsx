import { PlayerProgressBar } from "./PlayerProgressBar";
import { PlayerProgress, GameType, PlayerColor } from "../../module_bindings";
import { type TypeBoxRef } from "./TypeBox";

interface PlayerProgressListProps {
  gameType?: GameType;
  gamePlayerProgress: PlayerProgress[];
  maxPlayers: number;
  phraseLength: number;
  currentPlayerId: any;
  players: any[];
  typeBoxRef: React.RefObject<TypeBoxRef>;
}

export const PlayerProgressList = ({
  gameType,
  gamePlayerProgress,
  maxPlayers,
  phraseLength,
  currentPlayerId,
  players,
  typeBoxRef,
}: PlayerProgressListProps) => {
  const isPrivateGame = gameType?.tag === "Private";

  const getPlayerName = (pp: PlayerProgress) => {
    return pp.playerName;
  };

  const getPlayerLevel = (pp: PlayerProgress) => {
    return pp.playerLevel;
  };

  const getIdentityHash = (playerId: any) => {
    if (!playerId) {
      return "bot";
    }
    return playerId.toHexString();
  };

  const getPlayerColor = (playerId: any): PlayerColor => {
    if (!playerId) {
      return PlayerColor.Amber;
    }
    const player = players.filter((p) => p.id.isEqual(playerId))[0];
    return player?.color ?? PlayerColor.Amber;
  };

  const renderPlayerItem = (pp: PlayerProgress | undefined, index?: number) => {
    const isCurrentPlayer =
      pp && currentPlayerId && pp.playerId.isEqual(currentPlayerId);

    if (!pp) {
      return (
        <div
          key={`loading-${index}`}
          className="box w-full rounded-lg px-8 py-6 cursor-pointer"
          onClick={() => typeBoxRef.current?.focus()}
        >
          <PlayerProgressBar
            key={`loading-${index}`}
            name="Waiting for player..."
            level={1}
            progressIndex={0}
            phraseLength={phraseLength}
            identityHash={`loading-${index}`}
            isCurrentPlayer={false}
            isLoading={true}
          />
        </div>
      );
    }

    return (
      <div
        key={pp.id.toString()}
        className="box w-full rounded-lg px-8 py-6 cursor-pointer"
        onClick={() => typeBoxRef.current?.focus()}
      >
        <PlayerProgressBar
          key={pp.id.toString()}
          name={getPlayerName(pp)}
          level={getPlayerLevel(pp)}
          progressIndex={pp.progressIndex}
          phraseLength={phraseLength}
          identityHash={getIdentityHash(pp.playerId)}
          isCurrentPlayer={isCurrentPlayer}
          playerColor={getPlayerColor(pp.playerId)}
          wpm={pp.wpm}
        />
      </div>
    );
  };

  return (
    <div className="mb-4 space-y-3">
      {isPrivateGame
        ? gamePlayerProgress.map((pp) => renderPlayerItem(pp))
        : Array.from({ length: maxPlayers }).map((_, index) =>
            renderPlayerItem(gamePlayerProgress[index], index)
          )}
    </div>
  );
};
