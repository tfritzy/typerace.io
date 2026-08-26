// @vitest-environment jsdom

import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { GamePageTypeBox } from "./GamePageTypeBox";
import { RaceStateProvider } from "../contexts/RaceStateContext";
import { RaceStateStore } from "../state/raceState";
import type { PlayerProgress } from "../types/stdb";

vi.mock("./Cursor", () => ({
  Cursor: () => null,
}));

beforeAll(() => {
  HTMLElement.prototype.scrollIntoView = vi.fn();
});

afterEach(cleanup);

function renderTypeBox(
  phrase: string,
  allowedErrors: number,
  initialInput = "",
) {
  const onFinish = vi.fn();
  const raceState = new RaceStateStore();
  raceState.setPlayers(
    [
      {
        playerId: { toHexString: () => "local" },
        progressIndex: 0,
      } as PlayerProgress,
    ],
    { input: initialInput },
  );
  return {
    onFinish,
    raceState,
    ...render(
      <MemoryRouter>
        <RaceStateProvider store={raceState}>
          <GamePageTypeBox
            phrase={phrase}
            gameId="game-1"
            conn={null}
            onFinish={onFinish}
            raceStartsAt={null}
            totalAllowedErrors={allowedErrors}
            initialInput={initialInput}
          />
        </RaceStateProvider>
      </MemoryRouter>,
    ),
  };
}

describe("GamePageTypeBox allowed errors", () => {
  it("publishes input to race state while typing", () => {
    const { getByRole, raceState } = renderTypeBox("hello", 0);
    const input = getByRole("textbox") as HTMLTextAreaElement;

    fireEvent.input(input, { target: { value: "he" } });

    expect(raceState.getSnapshot().input).toBe("he");
    expect(raceState.getPlayerSnapshot("local")?.progressIndex).toBe(0);
  });

  it("restores reconstructed errors and their completed state", () => {
    const { getByRole, container } = renderTypeBox(
      "hello world",
      1,
      "hxllo ",
    );

    expect((getByRole("textbox") as HTMLTextAreaElement).value).toBe(
      "hxllo ",
    );
    expect(
      getByRole("meter", { name: "Words completed" }).getAttribute(
        "aria-valuenow",
      ),
    ).toBe("1");
    expect(getByRole("status").getAttribute("aria-label")).toBe(
      "1 of 1 allowed errors used",
    );
    expect(
      container.querySelector('[data-char-index="1"]')?.className,
    ).toContain("opacity-60");
  });

  it("renders the full pending-to-completed error workflow", () => {
    const { getByRole, container } = renderTypeBox(
      "hello world again",
      2,
    );
    const input = getByRole("textbox") as HTMLTextAreaElement;
    const status = getByRole("status");
    const meter = getByRole("meter", { name: "Words completed" });

    expect(status.querySelectorAll("[data-error-allowance]")).toHaveLength(2);
    expect(
      status.querySelector("[data-error-allowance]:not([data-used])"),
    ).not.toBeNull();

    fireEvent.input(input, { target: { value: "hexlo" } });
    expect(status.getAttribute("aria-label")).toBe(
      "0 of 2 allowed errors used",
    );

    fireEvent.input(input, { target: { value: "hexlo " } });
    expect(meter.getAttribute("aria-valuenow")).toBe("1");
    expect(status.getAttribute("aria-label")).toBe(
      "1 of 2 allowed errors used",
    );
    expect(status.querySelector("[data-used] svg")?.classList).toContain(
      "lucide-circle-x",
    );
    const completedError = container.querySelector(
      '[data-char-index="2"]',
    );
    expect(completedError?.className).toContain("opacity-60");
    expect(completedError?.className).not.toContain("underline");

    fireEvent.input(input, { target: { value: "hexlo w" } });
    expect(meter.getAttribute("aria-valuenow")).toBe("1");

    fireEvent.input(input, { target: { value: "hexlo worxd " } });
    expect(meter.getAttribute("aria-valuenow")).toBe("2");
    expect(status.getAttribute("aria-label")).toBe(
      "2 of 2 allowed errors used",
    );
    expect(
      container.querySelector('[data-char-index="0"]')?.className,
    ).toContain("text-text-completed");
  });

  it("commits preceding words when a following space is correct", () => {
    const { getByRole, container } = renderTypeBox("one two three", 1);
    const input = getByRole("textbox") as HTMLTextAreaElement;

    fireEvent.input(input, { target: { value: "onextwo " } });

    expect(
      getByRole("meter", { name: "Words completed" }).getAttribute(
        "aria-valuenow",
      ),
    ).toBe("2");
    expect(
      container.querySelector('[data-char-index="3"]')?.className,
    ).toContain("opacity-60");
  });

  it("counts required fixes without blocking forward input", () => {
    const { getByRole, queryByText } = renderTypeBox("hello world", 1);
    const input = getByRole("textbox") as HTMLTextAreaElement;
    const meter = getByRole("meter", { name: "Words completed" });

    fireEvent.input(input, { target: { value: "hxxxo " } });
    expect(input.value).toBe("hxxxo ");
    expect(meter.getAttribute("aria-valuenow")).toBe("0");
    expect(queryByText("You must fix 2 errors to finish")).not.toBeNull();
    expect(document.querySelector("[data-error-border]")).not.toBeNull();

    fireEvent.input(input, { target: { value: "hxxxo w" } });
    expect(input.value).toBe("hxxxo w");

    fireEvent.input(input, { target: { value: "hexlo w" } });
    expect(input.value).toBe("hexlo w");
    expect(meter.getAttribute("aria-valuenow")).toBe("1");
    expect(document.querySelector("[data-error-border]")).toBeNull();
    expect(getByRole("status").getAttribute("aria-label")).toBe(
      "1 of 1 allowed errors used",
    );
  });
});
