// @vitest-environment jsdom

import { act, cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { XpAward } from "../types/stdb";
import { XpAwardFeed } from "./XpAwardFeed";

const mocks = vi.hoisted(() => {
  const acknowledgeXpAward = vi.fn();
  const onInsert = vi.fn();
  const removeOnInsert = vi.fn();
  const subscribe = vi.fn();
  const unsubscribe = vi.fn();

  return {
    acknowledgeXpAward,
    onInsert,
    removeOnInsert,
    subscribe,
    unsubscribe,
    conn: {
      identity: {},
      db: {
        xpaward: { onInsert, removeOnInsert },
      },
      reducers: { acknowledgeXpAward },
      subscriptionBuilder: () => ({ subscribe }),
    },
  };
});

vi.mock("../contexts/SpacetimeContext", () => ({
  useDatabase: () => ({
    conn: mocks.conn,
  }),
}));

vi.mock("./XpGainPopup", () => ({
  XpGainPopup: ({ xpAward }: { xpAward: XpAward }) => (
    <div>{xpAward.id}</div>
  ),
}));

beforeEach(() => {
  mocks.subscribe.mockReturnValue({ unsubscribe: mocks.unsubscribe });
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("XpAwardFeed", () => {
  it("keeps a delivered award locally and acknowledges it immediately", () => {
    const view = render(<XpAwardFeed />);
    const handleInsert = mocks.onInsert.mock.calls[0][0];
    const award = {
      id: "award-1",
      playerId: { isEqual: () => true },
      gameId: "game-1",
      timestamp: 1n,
      effects: [],
      totalXp: 42,
    } as unknown as XpAward;

    act(() => handleInsert({}, award));

    expect(view.getByText("award-1")).not.toBeNull();
    expect(mocks.acknowledgeXpAward).toHaveBeenCalledWith({
      awardId: "award-1",
    });
  });
});
