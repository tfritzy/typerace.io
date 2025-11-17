import { PlayerProgressItem } from "./PlayerProgressItem";
import { PlayerProgress, GameType } from "../../module_bindings";
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

  return (
    <div className="mb-4 space-y-3">
      {isPrivateGame ? (
        gamePlayerProgress.map((pp) => (
          <PlayerProgressItem
            key={pp.id.toString()}
            playerProgress={pp}
            phraseLength={phraseLength}
            currentPlayerId={currentPlayerId}
            players={players}
            typeBoxRef={typeBoxRef}
          />
        ))
      ) : (
        Array.from({ length: maxPlayers }).map((_, index) => (
          <PlayerProgressItem
            key={gamePlayerProgress[index]?.id.toString() ?? `loading-${index}`}
            playerProgress={gamePlayerProgress[index]}
            index={index}
            phraseLength={phraseLength}
            currentPlayerId={currentPlayerId}
            players={players}
            typeBoxRef={typeBoxRef}
          />
        ))
      )}
    </div>
  );
};
