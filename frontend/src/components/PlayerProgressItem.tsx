import { PlayerProgressBar } from "./PlayerProgressBar";
import { PlayerProgress, PlayerColor } from "../../module_bindings";
import { type TypeBoxRef } from "./TypeBox";

interface PlayerProgressItemProps {
  playerProgress?: PlayerProgress;
  index?: number;
  phraseLength: number;
  currentPlayerId: any;
  players: any[];
  typeBoxRef: React.RefObject<TypeBoxRef>;
}

export const PlayerProgressItem = ({
  playerProgress,
  index,
  phraseLength,
  currentPlayerId,
  players,
  typeBoxRef,
}: PlayerProgressItemProps) => {
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

  const pp = playerProgress;
  const isCurrentPlayer =
    pp && currentPlayerId && pp.playerId.isEqual(currentPlayerId);

  if (!pp) {
    return (
      <div
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
