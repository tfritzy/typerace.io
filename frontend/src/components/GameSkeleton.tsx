import { EmptyPlayerProgressBars } from "./EmptyPlayerProgressBars";
import { TypeBox } from "./TypeBox";
import { AutofixRow } from "./AutofixRow";

export function GameSkeleton({ playerCount = 3 }: { playerCount?: number }) {
  return (
    <div className="relative flex-1 min-h-0 flex flex-col">
      <div className="flex-1 min-h-0 overflow-y-auto flex flex-col items-center px-4">
        <div className="content-container w-full my-auto">
          <div className="mb-3 grid gap-3">
            <EmptyPlayerProgressBars count={playerCount} />
          </div>
          <div className="mt-8 text-2xl leading-[1.6] sm:mt-10">
            <AutofixRow loading />
            <TypeBox
              phrase=""
              inputState="disabled-dimmed"
              cursorState="hidden"
              height="430px"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
