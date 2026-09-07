// @vitest-environment jsdom

import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { PlayerProgressBar } from "./PlayerProgressBar";

vi.mock("../hooks/usePlayerAvatar", () => ({
  usePlayerAvatar: () => null,
}));

afterEach(cleanup);

describe("PlayerProgressBar", () => {
  it("reserves its result metrics without changing the bar dimensions", () => {
    const props = {
      name: "A player with a long name",
      level: 7,
      progressIndex: 5,
      phraseLength: 10,
      identityHash: "player-1",
      playerPublicId: "public-1",
      isEmphasized: true,
      isAnonymous: true,
    };
    const view = render(
      <MemoryRouter>
        <PlayerProgressBar {...props} />
      </MemoryRouter>,
    );
    const bar = view.container.querySelector(".box");
    const pendingSpeed = view.getByText("000 WPM");

    expect(bar?.className).toContain("h-[78px]");
    expect(pendingSpeed.className).toContain("invisible");

    view.rerender(
      <MemoryRouter>
        <PlayerProgressBar {...props} placement={1} wpm={92} />
      </MemoryRouter>,
    );

    expect(view.getByText("92 WPM").className).toContain("visible");
    expect(bar?.className).toContain("h-[78px]");
  });
});
