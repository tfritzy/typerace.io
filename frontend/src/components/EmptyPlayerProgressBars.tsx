import { PlayerProgressBar } from "./PlayerProgressBar";
import { getTranslations } from "../utils/translations";

export function EmptyPlayerProgressBars({ count }: { count: number }) {
  const t = getTranslations();
  return Array.from({ length: count }, (_, index) => (
    <div key={`loading-${index}`}>
      <PlayerProgressBar
        name={t.waitingForPlayer}
        level={1}
        progressIndex={0}
        phraseLength={1}
        identityHash={`loading-${index}`}
        playerPublicId=""
        isCurrentPlayer={false}
        isLoading
      />
    </div>
  ));
}
