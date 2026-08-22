// @vitest-environment jsdom

import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { ActionBar } from "./ActionBar";

afterEach(cleanup);

describe("ActionBar", () => {
  it("overrides the box theme variables for a personal record", () => {
    const { container, getByRole } = render(
      <MemoryRouter>
        <ActionBar isParticipant={false} isPersonalRecord />
      </MemoryRouter>,
    );
    const actionBar = container.querySelector<HTMLElement>(
      "[data-action-bar]",
    );

    expect(actionBar?.style.getPropertyValue("--color-box-bg")).toContain(
      "var(--accent-primary)",
    );
    expect(actionBar?.style.getPropertyValue("--color-box-border")).toContain(
      "var(--accent-primary)",
    );
    expect(getByRole("button").className).toContain("text-accent-primary");
  });
});
