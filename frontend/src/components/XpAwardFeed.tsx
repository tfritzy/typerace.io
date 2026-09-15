import { useCallback, useEffect, useState } from "react";
import type { XpAward } from "../types/stdb";
import { useDatabase } from "../contexts/SpacetimeContext";
import { XpGainPopup } from "./XpGainPopup";

export function XpAwardFeed() {
  const { conn } = useDatabase();
  const [awards, setAwards] = useState<XpAward[]>([]);

  useEffect(() => {
    setAwards([]);
    if (!conn?.identity) return;

    const identity = conn.identity;
    const handleInsert = (_ctx: unknown, award: XpAward) => {
      if (!award.playerId.isEqual(identity)) return;

      setAwards((current) =>
        current.some((item) => item.id === award.id)
          ? current
          : [...current, award],
      );
      conn.reducers.acknowledgeXpAward({ awardId: award.id });
    };

    conn.db.xpaward.onInsert(handleInsert);
    const subscription = conn
      .subscriptionBuilder()
      .subscribe([`SELECT * FROM xpaward WHERE PlayerId = '${identity}'`]);

    return () => {
      conn.db.xpaward.removeOnInsert(handleInsert);
      subscription.unsubscribe();
    };
  }, [conn]);

  const dismissCurrent = useCallback(() => {
    setAwards((current) => current.slice(1));
  }, []);

  const current = awards[0];
  if (!current) return null;

  return (
    <aside
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 top-20 z-50 px-4"
    >
      <div className="content-container flex justify-end">
        <XpGainPopup
          key={current.id}
          xpAward={current}
          onComplete={dismissCurrent}
        />
      </div>
    </aside>
  );
}
