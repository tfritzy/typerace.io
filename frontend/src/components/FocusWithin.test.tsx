// @vitest-environment jsdom

import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { FocusWithin } from "./FocusWithin";

afterEach(() => {
  cleanup();
  localStorage.removeItem("typerace_lang_slug");
});

function renderFocusWithin(readOnly = false) {
  return render(
    <>
      <FocusWithin>
        <textarea aria-label="Typing input" readOnly={readOnly} />
      </FocusWithin>
      <button type="button">Elsewhere</button>
    </>,
  );
}

function blurTypingInput(getByRole: ReturnType<typeof render>["getByRole"]) {
  const input = getByRole("textbox", {
    name: "Typing input",
  }) as HTMLTextAreaElement;
  input.focus();
  getByRole("button", { name: "Elsewhere" }).focus();
  fireEvent.blur(input);
  return input;
}

describe("FocusWithin", () => {
  it("hides its prompt on initial render", () => {
    const { getByRole, queryByRole } = renderFocusWithin();

    expect(queryByRole("status")).toBeNull();
    expect(getByRole("status", { hidden: true }).className).toContain(
      "opacity-0",
    );
  });

  it("shows its prompt on blur and focuses again when clicked", () => {
    const { getByRole, queryByRole } = renderFocusWithin();
    const input = blurTypingInput(getByRole);

    const prompt = getByRole("status", {
      name: "Click or press t to focus",
    });
    expect(prompt.querySelector("kbd")?.textContent).toBe("t");
    expect(prompt.className).toContain("backdrop-blur-[2px]");

    fireEvent.click(prompt);

    expect(document.activeElement).toBe(input);
    expect(queryByRole("status")).toBeNull();
  });

  it("focuses on t", () => {
    const { getByRole } = renderFocusWithin();
    const input = blurTypingInput(getByRole);
    const elsewhere = getByRole("button", { name: "Elsewhere" });

    fireEvent.keyDown(elsewhere, { key: "t" });

    expect(document.activeElement).toBe(input);
  });

  it("does not take focus from another text field", () => {
    const { getByRole } = render(
      <>
        <FocusWithin>
          <textarea aria-label="Typing input" />
        </FocusWithin>
        <input aria-label="Name" />
      </>,
    );
    const typingInput = getByRole("textbox", {
      name: "Typing input",
    }) as HTMLTextAreaElement;
    const nameInput = getByRole("textbox", {
      name: "Name",
    }) as HTMLInputElement;

    typingInput.focus();
    nameInput.focus();
    fireEvent.blur(typingInput);
    fireEvent.keyDown(nameInput, { key: "t" });

    expect(document.activeElement).toBe(nameInput);
  });

  it("uses the selected language", () => {
    localStorage.setItem("typerace_lang_slug", "es");
    const { getByRole } = renderFocusWithin();

    blurTypingInput(getByRole);

    expect(
      getByRole("status", { name: "Haz clic o pulsa t para enfocar" }),
    ).not.toBeNull();
  });

  it("shows the prompt for a read-only input", () => {
    const { getByRole } = renderFocusWithin(true);
    const input = blurTypingInput(getByRole);

    expect(
      getByRole("status", { name: "Click or press t to focus" }),
    ).not.toBeNull();
    expect(input.readOnly).toBe(true);
  });
});
