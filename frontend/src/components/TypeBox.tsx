import React, {
  useCallback,
  useMemo,
  useRef,
  useState,
  useImperativeHandle,
  forwardRef,
} from "react";
import { Cursor } from "./Cursor";
import { PhraseCharacters } from "./PhraseCharacters";
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
    const [input, setInput] = useState(initialInput);
    const [isComplete, setIsComplete] = useState(false);
    const inputValueRef = useRef(initialInput);

    const targetRef = useRef<HTMLElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    React.useEffect(() => {
      if (overrideInputValue !== undefined) {
        if (inputRef.current) {
          inputRef.current.value = overrideInputValue;
        }
        inputValueRef.current = overrideInputValue;
        setInput(overrideInputValue);
      }
    }, [overrideInputValue]);

    React.useEffect(() => {
      if (targetRef.current && focused && !isComplete) {
        targetRef.current.scrollIntoView(SCROLL_OPTIONS);
      }
    }, [input.length, focused, isComplete]);

    useImperativeHandle(ref, () => ({
      focus: () => {
        inputRef.current?.focus();
      },
    }));

    const resetCursorToEnd = useCallback(() => {
      if (inputRef.current) {
        const length = inputRef.current.value.length;
        inputRef.current.setSelectionRange(length, length);
      }
    }, []);

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
        setInput(nextValue);

        if (nextValue === phrase && onComplete) {
          setIsComplete(true);
          onComplete();
          if (resetOnComplete) {
            setTimeout(() => {
              if (inputRef.current) {
                inputRef.current.value = "";
              }
              inputValueRef.current = "";
              setInput("");
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
            <div
              className="text-start text-[26px] font-mono leading-12 height"
            >
              <PhraseCharacters
                phrase={phrase}
                input={input}
                targetRef={targetRef}
              />
            </div>

            <Cursor
              targetRef={targetRef}
              targetIndex={Math.min(input.length, phrase.length)}
              fadeDelay={500}
              color={cursorColor}
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
