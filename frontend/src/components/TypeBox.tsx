import React, {
  useCallback,
  useMemo,
  useRef,
  useState,
  useImperativeHandle,
  forwardRef,
} from "react";
import { Cursor } from "./Cursor";
import { PhraseCharacters, type PhraseCharactersRef } from "./PhraseCharacters";
import { processTypeBoxChange } from "../utils/typeBoxCore";

const BLOCKED_CURSOR_KEYS = new Set([
  "ArrowLeft",
  "ArrowRight",
  "Home",
  "End",
  "PageUp",
  "PageDown",
]);
const SCROLL_OPTIONS: ScrollIntoViewOptions = {
  behavior: "smooth",
  block: "center",
  inline: "center",
};

type TypeBoxProps = {
  phrase: string;
  attribution?: string;
  onComplete?: () => void;
  onProgress?: (
    correctCharCount: number,
    eventType: "Correct" | "Incorrect" | "Backspace",
  ) => void;
  height?: string;
  resetOnComplete?: boolean;
  inputState?: TypeBoxInputState;
  initialProgress?: number;
  cursorState?: TypeBoxCursorState;
  cursorColor?: string;
  overrideInputValue?: string;
  autofixesRemaining?: number;
  onAutofixesConsumed?: (count: number) => void;
};

export type TypeBoxCursorState = "auto" | "visible" | "hidden";
export type TypeBoxInputState = "enabled" | "disabled" | "disabled-dimmed";

export type TypeBoxRef = {
  focus: () => void;
};

export const TypeBox = forwardRef<TypeBoxRef, TypeBoxProps>(
  (
    {
      phrase,
      attribution,
      onComplete,
      onProgress,
      height,
      resetOnComplete = false,
      inputState = "enabled",
      initialProgress = 0,
      cursorState = "auto",
      cursorColor,
      overrideInputValue,
      autofixesRemaining = 0,
      onAutofixesConsumed,
    },
    ref,
  ) => {
    const isInputDisabled = inputState !== "enabled";
    const initialInput = phrase.substring(0, initialProgress);
    const [focused, setFocused] = useState(true);
    const [isComplete, setIsComplete] = useState(false);
    const inputValueRef = useRef(initialInput);

    const targetRef = useRef<HTMLElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const phraseCharactersRef = useRef<PhraseCharactersRef>(null);
    const updateCursorPositionRef = useRef<(() => void) | null>(null);
    const updateRenderedInput = useCallback((nextInput: string) => {
      phraseCharactersRef.current?.setInput(nextInput);
      updateCursorPositionRef.current?.();
      if (document.activeElement === inputRef.current) {
        targetRef.current?.scrollIntoView(SCROLL_OPTIONS);
      }
    }, []);

    const resetCursorToEnd = useCallback(() => {
      const input = inputRef.current;
      if (!input) return;

      const end = input.value.length;
      if (input.selectionStart !== end || input.selectionEnd !== end) {
        input.setSelectionRange(end, end);
      }
    }, []);

    React.useLayoutEffect(() => {
      resetCursorToEnd();
    }, [initialInput, resetCursorToEnd]);

    React.useEffect(() => {
      if (overrideInputValue !== undefined) {
        if (inputRef.current) {
          inputRef.current.value = overrideInputValue;
        }
        inputValueRef.current = overrideInputValue;
        updateRenderedInput(overrideInputValue);
        resetCursorToEnd();
      }
    }, [overrideInputValue, resetCursorToEnd, updateRenderedInput]);

    React.useEffect(() => {
      const handlePageShow = () => resetCursorToEnd();
      handlePageShow();
      window.addEventListener("pageshow", handlePageShow);
      return () => window.removeEventListener("pageshow", handlePageShow);
    }, [resetCursorToEnd]);

    React.useEffect(() => {
      if (targetRef.current && focused && !isComplete) {
        targetRef.current.scrollIntoView(SCROLL_OPTIONS);
      }
    }, [focused, isComplete]);

    useImperativeHandle(ref, () => ({
      focus: () => {
        inputRef.current?.focus();
      },
    }));

    const handleFocus = useCallback(() => {
      setFocused(true);
      resetCursorToEnd();
    }, [resetCursorToEnd]);

    const handleBlur = useCallback(() => {
      setFocused(false);
    }, []);

    const handlePaste = useCallback((event: React.ClipboardEvent) => {
      event.preventDefault();
    }, []);

    const handleChange = useCallback(
      (targetValue: string) => {
        if (isInputDisabled) return;
        if (targetValue === inputValueRef.current) return;

        const inputCorrection = processTypeBoxChange(
          phrase,
          inputValueRef.current,
          targetValue,
          autofixesRemaining,
          onProgress,
          onAutofixesConsumed,
        );
        const nextValue = inputCorrection ?? targetValue;

        if (inputCorrection !== null && inputRef.current) {
          inputRef.current.value = inputCorrection;
          inputRef.current.setSelectionRange(
            inputCorrection.length,
            inputCorrection.length,
          );
        }

        inputValueRef.current = nextValue;
        updateRenderedInput(nextValue);

        if (nextValue === phrase && onComplete) {
          setIsComplete(true);
          onComplete();
          if (resetOnComplete) {
            setTimeout(() => {
              if (inputRef.current) {
                inputRef.current.value = "";
              }
              inputValueRef.current = "";
              updateRenderedInput("");
              setIsComplete(false);
            }, 0);
          }
        }
      },
      [
        phrase,
        onComplete,
        onProgress,
        autofixesRemaining,
        onAutofixesConsumed,
        resetOnComplete,
        isInputDisabled,
        updateRenderedInput,
      ],
    );

    const handleInputUpdate = useCallback(
      (event: React.FormEvent<HTMLTextAreaElement>) => {
        const nativeInputEvent = event.nativeEvent as InputEvent;
        if (nativeInputEvent.isComposing) {
          return;
        }

        handleChange(event.currentTarget.value);
      },
      [handleChange],
    );

    const handleCompositionCommit = useCallback(
      (event: React.CompositionEvent<HTMLTextAreaElement>) => {
        handleChange(event.currentTarget.value);
      },
      [handleChange],
    );

    const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
      if (BLOCKED_CURSOR_KEYS.has(event.key)) {
        event.preventDefault();
      }
    }, []);

    const containerStyle = useMemo<React.CSSProperties | undefined>(
      () => (height ? { minHeight: height } : undefined),
      [height],
    );
    const focusInput = useCallback(() => inputRef.current?.focus(), []);

    return (
      <div
        className={`relative box-with-focus w-full px-6 py-3 cursor-text flex items-start ${inputState === "disabled-dimmed" ? "opacity-60" : ""}`}
        style={containerStyle}
        onClick={focusInput}
      >
        <div className="relative select-none flex-1">
          <div className="type-box">
            <div className="text-start text-[24px] font-mono leading-12 height">
              <PhraseCharacters
                ref={phraseCharactersRef}
                phrase={phrase}
                input={inputValueRef.current}
                targetRef={targetRef}
              />
            </div>

            <Cursor
              targetRef={targetRef}
              fadeDelay={500}
              color={cursorColor}
              updatePositionRef={updateCursorPositionRef}
              visible={
                cursorState === "visible" ||
                (cursorState === "auto" && focused && !isComplete)
              }
            />

            <textarea
              ref={inputRef}
              defaultValue={initialInput}
              onInput={handleInputUpdate}
              onKeyDown={handleKeyDown}
              onPaste={handlePaste}
              onFocus={handleFocus}
              onBlur={handleBlur}
              onSelect={resetCursorToEnd}
              onCompositionEnd={handleCompositionCommit}
              readOnly={isInputDisabled}
              id="type-box"
              className="outline-none resize-none absolute top-0 left-0 opacity-0 pointer-events-none"
              autoCapitalize="none"
              autoComplete="off"
              spellCheck={false}
              autoFocus
            />
          </div>
          {attribution && (
            <div className="mt-6 text-lg text-muted-foreground italic font-light text-right select-none pr-2">
              - {attribution}
            </div>
          )}
        </div>
      </div>
    );
  },
);
