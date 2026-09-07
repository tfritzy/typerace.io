// @vitest-environment jsdom

import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Countdown } from "./Countdown";

afterEach(cleanup);

describe("Countdown", () => {
  it("preloads the bufo and reveals it as soon as the shared countdown completes", () => {
    const raceStartsAt = performance.now() + 4_000;
    const view = render(
      <Countdown
        raceStartsAt={raceStartsAt}
        countdownComplete={false}
      />,
    );
    const image = view.container.querySelector("img");
    const imageContainer = image?.parentElement;

    expect(image).not.toBeNull();
    expect(imageContainer?.style.visibility).toBe("hidden");

    view.rerender(
      <Countdown raceStartsAt={raceStartsAt} countdownComplete />,
    );

    expect(imageContainer?.style.visibility).toBe("visible");
    expect(image?.style.animation).toContain("countdownCelebrate");
  });
});
