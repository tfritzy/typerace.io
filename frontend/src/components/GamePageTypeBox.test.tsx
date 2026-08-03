// @vitest-environment jsdom

import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { useState } from "react";
import { GamePageTypeBox } from "./GamePageTypeBox";

vi.mock("./Cursor", () => ({
  Cursor: () => null,
}));

beforeAll(() => {
  HTMLElement.prototype.scrollIntoView = vi.fn();
});

afterEach(cleanup);

function GamePageTypeBoxHarness({
  phrase,
  gameId,
  initialAutofixes,
}: {
  phrase: string;
  gameId: string;
  initialAutofixes: number;
}) {
  const [autofixesRemaining, setAutofixesRemaining] =
    useState(initialAutofixes);

  return (
    <GamePageTypeBox
      phrase={phrase}
      gameId={gameId}
      conn={null}
      onFinish={() => undefined}
      raceStartsAt={null}
      autofixesRemaining={autofixesRemaining}
      onAutofixesConsumed={(consumed) =>
        setAutofixesRemaining((remaining) =>
          Math.max(0, remaining - consumed),
        )
      }
    />
  );
}

describe("GamePageTypeBox autofix balance", () => {
  it("spends the balance on errors from left to right", () => {
    const { getByRole } = render(
      <MemoryRouter>
        <GamePageTypeBoxHarness
          phrase="hello world again"
          gameId="game-1"
          initialAutofixes={2}
        />
      </MemoryRouter>,
    );
    const input = getByRole("textbox") as HTMLTextAreaElement;

    const status = getByRole("status");
    expect(status.getAttribute("aria-label")).toBe("2 auto-fixes remaining");
    expect(status.querySelectorAll("[data-autofix-charge]")).toHaveLength(2);

    fireEvent.input(input, { target: { value: "hexlo" } });
    fireEvent.input(input, { target: { value: "hexlo " } });

    expect(input.value).toBe("hexlo ");
    expect(getByRole("status").getAttribute("aria-label")).toBe(
      "2 auto-fixes remaining",
    );

    fireEvent.input(input, { target: { value: "hexlo w" } });

    expect(input.value).toBe("hello w");
    expect(getByRole("status").getAttribute("aria-label")).toBe(
      "1 auto-fix remaining",
    );
    expect(
      getByRole("status").querySelectorAll("[data-autofix-charge]"),
    ).toHaveLength(2);

    fireEvent.input(input, { target: { value: "hello wxxld " } });
    expect(input.value).toBe("hello wxxld ");

    fireEvent.input(input, { target: { value: "hello wxxld a" } });

    expect(input.value).toBe("hello woxld a");
    expect(getByRole("status").getAttribute("aria-label")).toBe(
      "0 auto-fixes remaining. You must fix all errors",
    );
  });

  it("counts words only after they are committed", () => {
    const { getByRole } = render(
      <MemoryRouter>
        <GamePageTypeBoxHarness
          phrase="hello world"
          gameId="game-words"
          initialAutofixes={1}
        />
      </MemoryRouter>,
    );
    const input = getByRole("textbox") as HTMLTextAreaElement;
    const meter = getByRole("meter", { name: "Words completed" });

    expect(meter.getAttribute("aria-valuenow")).toBe("0");
    expect(meter.getAttribute("aria-valuemax")).toBe("2");

    fireEvent.input(input, { target: { value: "hello" } });
    expect(meter.getAttribute("aria-valuenow")).toBe("0");

    fireEvent.input(input, { target: { value: "hello " } });
    expect(meter.getAttribute("aria-valuenow")).toBe("1");

    fireEvent.input(input, { target: { value: "hello world" } });
    expect(meter.getAttribute("aria-valuenow")).toBe("2");
  });

});
