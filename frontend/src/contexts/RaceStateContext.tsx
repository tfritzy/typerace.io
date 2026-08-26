import {
  createContext,
  useContext,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  RaceStateStore,
  type RaceStateSnapshot,
} from "../state/raceState";

const RaceStateContext = createContext<RaceStateStore | null>(null);

export function RaceStateProvider({
  store,
  children,
}: {
  store: RaceStateStore;
  children: ReactNode;
}) {
  return (
    <RaceStateContext.Provider value={store}>
      {children}
    </RaceStateContext.Provider>
  );
}

export function useRaceStateStore() {
  const store = useContext(RaceStateContext);
  if (!store) {
    throw new Error("useRaceStateStore must be used within RaceStateProvider");
  }
  return store;
}

export function useRaceState(): RaceStateSnapshot {
  const store = useRaceStateStore();
  return useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getSnapshot,
  );
}

export function useRacePlayers(): RaceStateSnapshot["players"] {
  const store = useRaceStateStore();
  return useSyncExternalStore(
    store.subscribe,
    store.getPlayersSnapshot,
    store.getPlayersSnapshot,
  );
}

export function useRaceInput(): string {
  const store = useRaceStateStore();
  return useSyncExternalStore(
    store.subscribe,
    store.getInputSnapshot,
    store.getInputSnapshot,
  );
}
