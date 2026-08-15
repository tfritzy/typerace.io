import { useMemo, useState } from "react";
import type { GameRecord } from "../../types/stdb";
import {
  ALL_PROFILE_MODES,
  buildProfileModeOptions,
  filterProfileGameRecords,
  type ProfileTimeFrame,
} from "../../utils/profileStats";
import { RecentGames } from "../RecentGames";
import { Select } from "../Select";
import { WpmChart } from "../WpmChart";
import { WpmDistributionChart } from "../WpmDistributionChart";

interface ProfileActivityProps {
  gameRecords: readonly GameRecord[];
}

const TIME_FRAME_OPTIONS: Array<{
  value: ProfileTimeFrame;
  label: string;
}> = [
  { value: "all", label: "All time" },
  { value: "3months", label: "Last 3 months" },
  { value: "month", label: "Last month" },
  { value: "week", label: "Last week" },
];

export function ProfileActivity({ gameRecords }: ProfileActivityProps) {
  const [selectedMode, setSelectedMode] = useState(ALL_PROFILE_MODES);
  const [selectedTimeFrame, setSelectedTimeFrame] =
    useState<ProfileTimeFrame>("all");

  const modeOptions = useMemo(() => [
    { value: ALL_PROFILE_MODES, label: "All modes" },
    ...buildProfileModeOptions(gameRecords),
  ], [gameRecords]);
  const visibleRecords = useMemo(
    () => filterProfileGameRecords(
      gameRecords,
      selectedMode,
      selectedTimeFrame,
    ),
    [gameRecords, selectedMode, selectedTimeFrame],
  );

  return (
    <div className="flex min-w-0 flex-col gap-8">
      <section>
        <div className="mb-2 grid grid-cols-[auto_minmax(0,1fr)] items-end gap-4 px-1">
          <h2 className="text-base font-semibold text-secondary-foreground">
            Pace
          </h2>

          <div className="flex min-w-0 justify-end gap-3">
            <Select
              ariaLabel="Mode"
              value={selectedMode}
              onChange={setSelectedMode}
              className="min-w-0 max-w-[150px] flex-1"
              fluid
              options={modeOptions}
            />

            <Select
              ariaLabel="Time frame"
              value={selectedTimeFrame}
              onChange={setSelectedTimeFrame}
              className="min-w-0 max-w-[150px] flex-1"
              fluid
              options={TIME_FRAME_OPTIONS}
            />
          </div>
        </div>

        <WpmChart data={visibleRecords} />
      </section>

      <section>
        <h2 className="mb-2 ml-1 text-base font-semibold text-secondary-foreground">
          Distribution
        </h2>
        <WpmDistributionChart data={visibleRecords} />
      </section>

      <section>
        <h2 className="mb-2 ml-1 text-base font-semibold text-secondary-foreground">
          Recent races
        </h2>
        <div className="rounded-lg border border-border bg-card p-5 sm:p-6">
          <RecentGames gameRecords={visibleRecords} />
        </div>
      </section>
    </div>
  );
}
