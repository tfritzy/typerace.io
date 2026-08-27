import React, {
  useCallback,
  memo,
  useMemo,
  useRef,
  useState,
  useImperativeHandle,
  forwardRef,
} from "react";
import { Cursor } from "./Cursor";
import { PhraseCharacters, type PhraseCharactersRef } from "./PhraseCharacters";
import {
  analyzeTypeBoxInput,
  processTypeBoxChange,
} from "../utils/typeBoxCore";

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
    progressIndex: number,
    eventType: "Correct" | "Incorrect" | "Backspace",
  ) => void;
  height?: string;
  resetOnComplete?: boolean;
  inputState?: TypeBoxInputState;
  initialValue?: string;
  cursorState?: TypeBoxCursorState;
  cursorColor?: string;
  overrideInputValue?: string;
  onValueChange?: (value: string) => void;
  totalAllowedErrors?: number;
};

export type TypeBoxCursorState = "auto" | "visible" | "hidden";
export type TypeBoxInputState = "enabled" | "disabled" | "disabled-dimmed";

export type TypeBoxRef = {
  focus: () => void;
};

export const TypeBox = memo(forwardRef<TypeBoxRef, TypeBoxProps>(
  (
    {
      phrase,
      attribution,
      onComplete,
      onProgress,
      height,
      resetOnComplete = false,
      inputState = "enabled",
      initialValue = "",
      cursorState = "auto",
      cursorColor,
      overrideInputValue,
      onValueChange,
      totalAllowedErrors = 0,
    },
    ref,
  ) => {
    const isInputDisabled = inputState !== "enabled";
    const initialInput = initialValue;
    const [focused, setFocused] = useState(true);
    const [isComplete, setIsComplete] = useState(false);
    const inputValueRef = useRef(initialInput);

    const targetRef = useRef<HTMLElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const phraseCharactersRef = useRef<PhraseCharactersRef>(null);
    const updateCursorPositionRef = useRef<(() => void) | null>(null);
    const updateRenderedInput = useCallback((
      nextInput: string,
      completedThrough?: number,
    ) => {
      phraseCharactersRef.current?.setInput(nextInput, completedThrough);
      updateCursorPositionRef.current?.();
      if (document.activeElement === inputRef.current) {
        targetRef.current?.scrollIntoView(SCROLL_OPTIONS);
      }
    }, []);

    const setInputValue = useCallback(
      (nextValue: string) => {
        inputValueRef.current = nextValue;
        onValueChange?.(nextValue);
      },
      [onValueChange],
    );

    const resetCursorToEnd = useCallback(() => {
      const input = inputRef.current;
      if (!input) return;

      const end = input.value.length;
      if (input.selectionStart !== end || input.selectionEnd !== end) {
        input.setSelectionRange(end, end);
      }
    }, []);

    const handleSelect = useCallback(() => {
      const input = inputRef.current;
      if (input && input.selectionStart === input.selectionEnd) {
        resetCursorToEnd();
      }
    }, [resetCursorToEnd]);

    React.useLayoutEffect(() => {
      resetCursorToEnd();
    }, [initialInput, resetCursorToEnd]);

    React.useEffect(() => {
      if (overrideInputValue !== undefined) {
        if (inputRef.current) {
          inputRef.current.value = overrideInputValue;
        }
        setInputValue(overrideInputValue);
        updateRenderedInput(
          overrideInputValue,
          analyzeTypeBoxInput(
            phrase,
            overrideInputValue,
            totalAllowedErrors,
          ).completedThrough,
        );
        resetCursorToEnd();
      }
    }, [
      overrideInputValue,
      phrase,
      resetCursorToEnd,
      setInputValue,
      totalAllowedErrors,
      updateRenderedInput,
    ]);

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

        const result = processTypeBoxChange(
          phrase,
          inputValueRef.current,
          targetValue,
          totalAllowedErrors,
          onProgress,
        );
        const nextValue = result.value;

        if (result.inputCorrection !== null && inputRef.current) {
          inputRef.current.value = result.inputCorrection;
          inputRef.current.setSelectionRange(
            result.inputCorrection.length,
            result.inputCorrection.length,
          );
        }

        setInputValue(nextValue);
        updateRenderedInput(nextValue, result.completedThrough);

        if (result.canComplete && onComplete) {
          setIsComplete(true);
          onComplete();
          if (resetOnComplete) {
            setTimeout(() => {
              if (inputRef.current) {
                inputRef.current.value = "";
              }
              setInputValue("");
              updateRenderedInput("", 0);
              setIsComplete(false);
            }, 0);
          }
        }
      },
      [
        phrase,
        onComplete,
        onProgress,
        totalAllowedErrors,
        resetOnComplete,
        isInputDisabled,
        setInputValue,
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
        resetCursorToEnd();
      },
      [handleChange, resetCursorToEnd],
    );

    const handleCompositionCommit = useCallback(
      (event: React.CompositionEvent<HTMLTextAreaElement>) => {
        handleChange(event.currentTarget.value);
        resetCursorToEnd();
      },
      [handleChange, resetCursorToEnd],
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
    const analysis = analyzeTypeBoxInput(
      phrase,
      inputValueRef.current,
      totalAllowedErrors,
    );

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
                completedThrough={analysis.completedThrough}
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
              onSelect={handleSelect}
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
));
