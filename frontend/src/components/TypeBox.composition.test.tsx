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

describe("TypeBox allowed errors", () => {
  it("keeps an allowed final error and completes", () => {
    const onComplete = vi.fn();
    const onProgress = vi.fn();
    const { getByRole } = render(
      <TypeBox
        phrase="hello"
        totalAllowedErrors={1}
        onProgress={onProgress}
        onComplete={onComplete}
      />,
    );
    const input = getByRole("textbox") as HTMLTextAreaElement;

    fireEvent.input(input, { target: { value: "hellx" } });

    expect(input.value).toBe("hellx");
    expect(onProgress).toHaveBeenLastCalledWith(5, "Incorrect");
    expect(onComplete).toHaveBeenCalledOnce();
  });
});

describe("TypeBox selection", () => {
  it("places restored progress at the end of the input", () => {
    const { getByRole } = render(
      <TypeBox phrase="hello world" initialValue="hello" />,
    );
    const input = getByRole("textbox") as HTMLTextAreaElement;

    expect(input.value).toBe("hello");
    expect(input.selectionStart).toBe(5);
    expect(input.selectionEnd).toBe(5);
  });

  it("returns an externally moved caret to the end", () => {
    const { getByRole } = render(
      <TypeBox phrase="hello world" initialValue="hello" />,
    );
    const input = getByRole("textbox") as HTMLTextAreaElement;

    input.setSelectionRange(0, 0);
    fireEvent.select(input);

    expect(input.selectionStart).toBe(5);
    expect(input.selectionEnd).toBe(5);
  });

  it("does not override a browser-managed selection range", () => {
    const { getByRole } = render(
      <TypeBox phrase="hello world" initialValue="hello" />,
    );
    const input = getByRole("textbox") as HTMLTextAreaElement;

    input.setSelectionRange(1, 4);
    fireEvent.select(input);

    expect(input.selectionStart).toBe(1);
    expect(input.selectionEnd).toBe(4);
  });
});

describe("TypeBox mobile input", () => {
  it("completes the phrase when the keyboard autocorrects the final word", () => {
    const phrase = "see you tomorrow";
    const misspelledPhrase = "see you tomorroe";
    const onProgress = vi.fn();
    const onComplete = vi.fn();
    const { getByRole } = render(
      <TypeBox
        phrase={phrase}
        onProgress={onProgress}
        onComplete={onComplete}
      />,
    );
    const input = getByRole("textbox") as HTMLTextAreaElement;

    for (let length = 1; length <= misspelledPhrase.length; length++) {
      fireEvent.input(input, {
        data: misspelledPhrase[length - 1],
        inputType: "insertText",
        target: { value: misspelledPhrase.slice(0, length) },
      });
    }

    expect(input.value).toBe(misspelledPhrase);
    expect(onComplete).not.toHaveBeenCalled();

    const finalWordStart = misspelledPhrase.lastIndexOf(" ") + 1;
    input.setSelectionRange(finalWordStart, misspelledPhrase.length);
    fireEvent.select(input);
    input.setRangeText(
      "tomorrow",
      input.selectionStart,
      input.selectionEnd,
      "end",
    );
    fireEvent.input(input, {
      data: "tomorrow",
      inputType: "insertReplacementText",
    });

    expect(input.value).toBe(phrase);
    expect(input.selectionStart).toBe(phrase.length);
    expect(input.selectionEnd).toBe(phrase.length);
    expect(onComplete).toHaveBeenCalledOnce();
  });
  it("reports expected progress while typing and correcting errors", () => {
    const onProgress = vi.fn();
    const onComplete = vi.fn();
    const { getByRole } = render(
      <TypeBox
        phrase="hello world"
        onProgress={onProgress}
        onComplete={onComplete}
      />,
    );
    const input = getByRole("textbox") as HTMLTextAreaElement;
    const type = (value: string) =>
      fireEvent.input(input, {
        data: value.at(-1),
        inputType: "insertText",
        target: { value },
      });
    const backspace = (value: string) =>
      fireEvent.input(input, {
        data: null,
        inputType: "deleteContentBackward",
        target: { value },
      });

    type("h");
    type("he");
    type("hel");
    type("helo");
    backspace("hel");
    type("hell");
    type("hellp");
    backspace("hell");
    for (const value of [
      "hello",
      "hello ",
      "hello w",
      "hello wo",
      "hello wor",
      "hello worl",
      "hello world",
    ]) {
      type(value);
    }

    expect(onProgress.mock.calls).toEqual([
      [1, "Correct"],
      [2, "Correct"],
      [3, "Correct"],
      [3, "Incorrect"],
      [3, "Backspace"],
      [4, "Correct"],
      [4, "Incorrect"],
      [4, "Backspace"],
      [5, "Correct"],
      [6, "Correct"],
      [7, "Correct"],
      [8, "Correct"],
      [9, "Correct"],
      [10, "Correct"],
      [11, "Correct"],
    ]);
    expect(onComplete).toHaveBeenCalledOnce();
  });
});

describe("TypeBox character display", () => {
  it("respects completed allowed-error words in controlled input", () => {
    const { container, rerender } = render(
      <TypeBox
        phrase="hello world"
        overrideInputValue=""
        totalAllowedErrors={1}
      />,
    );

    rerender(
      <TypeBox
        phrase="hello world"
        overrideInputValue="hxllo "
        totalAllowedErrors={1}
      />,
    );

    expect(
      container.querySelector('[data-char-index="0"]')?.className,
    ).toContain("text-text-completed");
    expect(
      container.querySelector('[data-char-index="1"]')?.className,
    ).toContain("opacity-60");
  });

  it("updates current, completed, and incorrect characters incrementally", () => {
    const { container, getByRole } = render(
      <TypeBox phrase="hello world" />,
    );
    const input = getByRole("textbox") as HTMLTextAreaElement;
    const character = (index: number) =>
      container.querySelector(
        `[data-char-index="${index}"]`,
      ) as HTMLElement;

    fireEvent.input(input, { target: { value: "hello" } });
    expect(character(0).className).toContain("text-foreground");
    expect(character(5).className).toContain("text-text-untyped");

    fireEvent.input(input, { target: { value: "hello " } });
    expect(character(0).className).toContain("text-text-completed");
    expect(character(5).className).toContain("text-text-completed");

    fireEvent.input(input, { target: { value: "hello x" } });
    expect(character(6).className).toContain("text-destructive");
    expect(character(6).dataset.error).toBe("x");

    fireEvent.input(input, { target: { value: "hello " } });
    expect(character(6).className).toContain("text-text-untyped");
    expect(character(6).dataset.error).toBe("");

    fireEvent.input(input, { target: { value: "hello world" } });
    expect(character(10).className).toContain("text-text-completed");
  });
});
