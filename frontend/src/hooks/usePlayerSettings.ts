import { useCallback, useMemo, useSyncExternalStore } from "react";
import { useDatabase } from "../contexts/SpacetimeContext";
import { useAuth } from "../firebase/AuthContext";
import { parsePlayerSettings } from "../utils/playerSettings";

export function usePlayerSettings() {
  const { conn } = useDatabase();
  const { user } = useAuth();

  const subscribe = useCallback((onStoreChange: () => void) => {
    if (!conn) return () => {};

    conn.db.myPlayerSettings.onInsert(onStoreChange);
    conn.db.myPlayerSettings.onUpdate(onStoreChange);
    conn.db.myPlayerSettings.onDelete(onStoreChange);

    const subscription = conn.subscriptionBuilder()
      .onApplied(onStoreChange)
      .subscribe(["SELECT * FROM myPlayerSettings"]);

    return () => {
      conn.db.myPlayerSettings.removeOnInsert(onStoreChange);
      conn.db.myPlayerSettings.removeOnUpdate(onStoreChange);
      conn.db.myPlayerSettings.removeOnDelete(onStoreChange);
      subscription.unsubscribe();
    };
  }, [conn]);

  const getSnapshot = useCallback(() => {
    if (!conn) return null;
    return Array.from(conn.db.myPlayerSettings.iter())[0]?.value ?? null;
  }, [conn]);

  const value = useSyncExternalStore(subscribe, getSnapshot, () => null);
  const settings = useMemo(() => parsePlayerSettings(value), [value]);

  const setUseAuthenticationAvatar = useCallback((enabled: boolean) => {
    if (!conn) return;

    conn.reducers.setUseAuthenticationAvatar({
      value: enabled,
      photoUrl: enabled ? user?.photoURL ?? undefined : undefined,
    });
  }, [conn, user?.photoURL]);

  return {
    useAuthenticationAvatar: settings.useAuthenticationAvatar,
    setUseAuthenticationAvatar,
  };
}
