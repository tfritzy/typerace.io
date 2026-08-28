import { useEffect, useRef, useState } from "react";
import type { EventContext } from "../../module_bindings";
import { useDatabase } from "../contexts/SpacetimeContext";
import type { PlayerAvatar } from "../types/stdb";

export function usePlayerAvatar(
  identity: string | undefined,
): string | null | undefined {
  const { conn } = useDatabase();
  const [photoUrl, setPhotoUrl] = useState<string | null | undefined>();
  const subscriptionRef = useRef({ conn, identity });

  useEffect(() => {
    if (!conn || !identity) return;

    subscriptionRef.current = { conn, identity };
    setPhotoUrl(undefined);

    const belongsToPlayer = (avatar: PlayerAvatar) => (
      avatar.identity.toHexString() === identity
    );
    const readAvatar = () => {
      const avatar = Array.from(conn.db.playeravatar.iter()).find(
        belongsToPlayer,
      );
      setPhotoUrl(avatar?.photoUrl ?? null);
    };
    const handleInsert = (_ctx: EventContext, avatar: PlayerAvatar) => {
      if (belongsToPlayer(avatar)) {
        setPhotoUrl(avatar.photoUrl);
      }
    };
    const handleUpdate = (
      _ctx: EventContext,
      _previous: PlayerAvatar,
      avatar: PlayerAvatar,
    ) => {
      if (belongsToPlayer(avatar)) {
        setPhotoUrl(avatar.photoUrl);
      }
    };
    const handleDelete = (_ctx: EventContext, avatar: PlayerAvatar) => {
      if (belongsToPlayer(avatar)) {
        setPhotoUrl(null);
      }
    };

    conn.db.playeravatar.onInsert(handleInsert);
    conn.db.playeravatar.onUpdate(handleUpdate);
    conn.db.playeravatar.onDelete(handleDelete);

    const subscription = conn.subscriptionBuilder()
      .onApplied(readAvatar)
      .subscribe([
        `SELECT * FROM playeravatar WHERE Identity = '${identity}'`,
      ]);

    return () => {
      conn.db.playeravatar.removeOnInsert(handleInsert);
      conn.db.playeravatar.removeOnUpdate(handleUpdate);
      conn.db.playeravatar.removeOnDelete(handleDelete);
      subscription.unsubscribe();
    };
  }, [conn, identity]);

  if (!conn || !identity) return null;
  if (
    subscriptionRef.current.conn !== conn
    || subscriptionRef.current.identity !== identity
  ) {
    return undefined;
  }
  return photoUrl;
}
