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

describe("TypeBox Japanese IME composition", () => {
  it("commits a multi-character kanji conversion as ordered progress", () => {
    const onProgress = vi.fn();
    const onComplete = vi.fn();
    const { getByRole } = render(
      <TypeBox
        phrase="日本語"
        onProgress={onProgress}
        onComplete={onComplete}
        noSpacesInPhrase
      />,
    );
    const input = getByRole("textbox");

    fireEvent.compositionStart(input);
    fireEvent.input(input, {
      data: "にほんご",
      isComposing: true,
      inputType: "insertCompositionText",
      target: { value: "にほんご" },
    });
    fireEvent.input(input, {
      data: "日本語",
      isComposing: true,
      inputType: "insertCompositionText",
      target: { value: "日本語" },
    });

    expect(onProgress).not.toHaveBeenCalled();

    fireEvent.compositionEnd(input, {
      data: "日本語",
      target: { value: "日本語" },
    });

    expect(onProgress.mock.calls).toEqual([
      [1, "Correct"],
      [2, "Correct"],
      [3, "Correct"],
    ]);
    expect(onComplete).toHaveBeenCalledOnce();
  });

  it("preserves progress across consecutive composition sessions", () => {
    const onProgress = vi.fn();
    const onComplete = vi.fn();
    const { getByRole } = render(
      <TypeBox
        phrase="日本語入力"
        onProgress={onProgress}
        onComplete={onComplete}
        noSpacesInPhrase
      />,
    );
    const input = getByRole("textbox");

    fireEvent.compositionStart(input);
    fireEvent.input(input, {
      data: "にほんご",
      isComposing: true,
      inputType: "insertCompositionText",
      target: { value: "にほんご" },
    });
    fireEvent.input(input, {
      data: "日本語",
      isComposing: true,
      inputType: "insertCompositionText",
      target: { value: "日本語" },
    });
    fireEvent.compositionEnd(input, {
      data: "日本語",
      target: { value: "日本語" },
    });

    expect(onProgress).toHaveBeenCalledTimes(3);
    expect(onComplete).not.toHaveBeenCalled();

    fireEvent.compositionStart(input);
    fireEvent.input(input, {
      data: "にゅうりょく",
      isComposing: true,
      inputType: "insertCompositionText",
      target: { value: "日本語にゅうりょく" },
    });
    fireEvent.input(input, {
      data: "入力",
      isComposing: true,
      inputType: "insertCompositionText",
      target: { value: "日本語入力" },
    });
    fireEvent.compositionEnd(input, {
      data: "入力",
      target: { value: "日本語入力" },
    });

    expect(onProgress.mock.calls).toEqual([
      [1, "Correct"],
      [2, "Correct"],
      [3, "Correct"],
      [4, "Correct"],
      [5, "Correct"],
    ]);
    expect(onComplete).toHaveBeenCalledOnce();
  });

  it("does not report progress for a cancelled composition", () => {
    const onProgress = vi.fn();
    const onComplete = vi.fn();
    const { getByRole } = render(
      <TypeBox
        phrase="日本語"
        onProgress={onProgress}
        onComplete={onComplete}
        noSpacesInPhrase
      />,
    );
    const input = getByRole("textbox");

    fireEvent.compositionStart(input);
    fireEvent.input(input, {
      data: "にほんご",
      isComposing: true,
      inputType: "insertCompositionText",
      target: { value: "にほんご" },
    });
    fireEvent.compositionEnd(input, {
      data: "",
      target: { value: "" },
    });

    expect(onProgress).not.toHaveBeenCalled();
    expect(onComplete).not.toHaveBeenCalled();
  });
});
