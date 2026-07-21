import { EmptyPlayerProgressBars } from "./EmptyPlayerProgressBars";
import { Header } from "./Header";
import { TypeBox } from "./TypeBox";

export function GameSkeleton({ playerCount = 3 }: { playerCount?: number }) {
  return (
    <div className="relative h-full flex flex-col">
      <Header />
      <div className="flex-1 min-h-0 overflow-y-auto flex flex-col items-center px-4">
        <div className="content-container w-full my-auto">
          <div className="mb-3 grid gap-3">
            <EmptyPlayerProgressBars count={playerCount} />
          </div>
          <div className="text-2xl leading-[1.6]">
            <TypeBox phrase="" disabled hideCursor height="430px" />
          </div>
        </div>
      </div>
    </div>
  );
}
