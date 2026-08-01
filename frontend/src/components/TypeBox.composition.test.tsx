// @vitest-environment jsdom

import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { TypeBox } from "./TypeBox";

vi.mock("./Cursor", () => ({
  Cursor: () => null,
}));

beforeAll(() => {
  HTMLElement.prototype.scrollIntoView = vi.fn();
});

afterEach(cleanup);

describe("TypeBox dead-key composition", () => {
  it("handles a directly entered ñ without composition", () => {
    const onProgress = vi.fn();
    const onComplete = vi.fn();
    const { getByRole } = render(
      <TypeBox
        phrase="niñ"
        onProgress={onProgress}
        onComplete={onComplete}
      />,
    );
    const input = getByRole("textbox");

    fireEvent.input(input, { target: { value: "n" } });
    fireEvent.input(input, { target: { value: "ni" } });
    fireEvent.input(input, { target: { value: "niñ" } });

    expect(onProgress).toHaveBeenLastCalledWith(3, "Correct");
    expect(onComplete).toHaveBeenCalledOnce();
  });

  it(
    "commits an accented character once after a dead-key composition",
    () => {
      const onProgress = vi.fn();
      const onComplete = vi.fn();
      const { getByRole } = render(
        <TypeBox
          phrase="así"
          onProgress={onProgress}
          onComplete={onComplete}
        />,
      );
      const input = getByRole("textbox");

      fireEvent.input(input, { target: { value: "a" } });
      fireEvent.input(input, { target: { value: "as" } });

      // Some browser/OS combinations expose the dead key as an intermediate
      // composition value before replacing it with the composed character.
      fireEvent.compositionStart(input);
      fireEvent.input(input, {
        data: "´",
        isComposing: true,
        inputType: "insertCompositionText",
        target: { value: "as´" },
      });

      expect(onProgress).toHaveBeenCalledTimes(2);

      fireEvent.input(input, {
        data: "í",
        isComposing: true,
        inputType: "insertCompositionText",
        target: { value: "así" },
      });
      fireEvent.compositionEnd(input, {
        data: "í",
        target: { value: "así" },
      });

      expect(onProgress).toHaveBeenLastCalledWith(3, "Correct");
      expect(onProgress).toHaveBeenCalledTimes(3);
      expect(onComplete).toHaveBeenCalledOnce();

      // Tolerate browsers that also emit a final non-composing input.
      fireEvent.input(input, {
        data: "í",
        isComposing: false,
        inputType: "insertText",
        target: { value: "así" },
      });

      expect(onProgress).toHaveBeenCalledTimes(3);
      expect(onComplete).toHaveBeenCalledOnce();
    },
  );
});

describe("TypeBox autofix", () => {
  it("syncs a final-word correction and reports its consumed balance", () => {
    const onComplete = vi.fn();
    const onProgress = vi.fn();
    const onAutofixesConsumed = vi.fn();
    const { getByRole } = render(
      <TypeBox
        phrase="hello"
        autofixesRemaining={1}
        onProgress={onProgress}
        onAutofixesConsumed={onAutofixesConsumed}
        onComplete={onComplete}
      />,
    );
    const input = getByRole("textbox") as HTMLTextAreaElement;

    fireEvent.input(input, { target: { value: "hellx" } });

    expect(input.value).toBe("hello");
    expect(onProgress.mock.calls.slice(-2)).toEqual([
      [4, "Backspace"],
      [5, "Correct"],
    ]);
    expect(onAutofixesConsumed).toHaveBeenCalledWith(1);
    expect(onComplete).toHaveBeenCalledOnce();
  });
});
