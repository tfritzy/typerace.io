// @vitest-environment jsdom

import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { TypeBox } from "./TypeBox";

const WORD_COUNT = 250;
const MAX_TYPING_DURATION_MS = 2_000;
const EXTREMELY_LONG_PHRASE = Array.from(
  { length: WORD_COUNT },
  (_, index) => `benchmark${index}`,
).join(" ");

beforeAll(() => {
  HTMLElement.prototype.scrollIntoView = vi.fn();
});

afterEach(cleanup);

describe("TypeBox performance", () => {
  it(
    `types a ${WORD_COUNT.toLocaleString()}-word phrase in under ${MAX_TYPING_DURATION_MS.toLocaleString()}ms`,
    { timeout: MAX_TYPING_DURATION_MS + 5_000 },
    () => {
      const onComplete = vi.fn();
      const { getByRole } = render(
        <TypeBox
          phrase={EXTREMELY_LONG_PHRASE}
          onComplete={onComplete}
          onProgress={() => undefined}
        />,
      );
      const input = getByRole("textbox") as HTMLTextAreaElement;

      const startedAt = performance.now();

      for (let length = 1; length <= EXTREMELY_LONG_PHRASE.length; length++) {
        fireEvent.input(input, {
          target: { value: EXTREMELY_LONG_PHRASE.slice(0, length) },
        });
      }

      const durationMs = performance.now() - startedAt;

      console.info(
        `[TypeBox benchmark] Typed ${EXTREMELY_LONG_PHRASE.length.toLocaleString()} characters in ${durationMs.toFixed(1)}ms`,
      );
      expect(input.value).toBe(EXTREMELY_LONG_PHRASE);
      expect(onComplete).toHaveBeenCalledOnce();
      expect(durationMs).toBeLessThan(MAX_TYPING_DURATION_MS);
    },
  );
});
