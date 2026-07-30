import React, {
  useCallback,
  useRef,
  useState,
  useImperativeHandle,
  forwardRef,
} from "react";
import { Cursor } from "./Cursor";
import { PhraseCharacters } from "./PhraseCharacters";
import { getTranslations } from "../utils/translations";

type TypeBoxProps = {
  phrase: string;
  attribution?: string;
  onComplete?: () => void;
  onProgress?: (
    correctCharCount: number,
    eventType: "Correct" | "Incorrect" | "Backspace",
  ) => void;
  onWordComplete?: (wordXp: number, position: { x: number; y: number }) => void;
  height?: string;
  resetOnComplete?: boolean;
  inputState?: TypeBoxInputState;
  initialProgress?: number;
  cursorState?: TypeBoxCursorState;
  cursorColor?: string;
  noSpacesInPhrase?: boolean;
  overrideInputValue?: string;
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
      onWordComplete,
      height,
      resetOnComplete = false,
      inputState = "enabled",
      initialProgress = 0,
      cursorState = "auto",
      cursorColor,
      noSpacesInPhrase: noSpacesLang,
      overrideInputValue,
    },
    ref,
  ) => {
    const isInputDisabled = inputState !== "enabled";
    const initialInput = phrase.substring(0, initialProgress);
    const [focused, setFocused] = useState(true);
    const [input, setInput] = useState(initialInput);
    const [isComplete, setIsComplete] = useState(false);
    const [showErrorWarning, setShowErrorWarning] = useState(false);

    const targetRef = useRef<HTMLElement>(null);
    const phraseRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    React.useEffect(() => {
      if (overrideInputValue !== undefined) {
        if (inputRef.current) {
          inputRef.current.value = overrideInputValue;
        }
        setInput(overrideInputValue);
        setShowErrorWarning(false);
      }
    }, [overrideInputValue]);

    React.useEffect(() => {
      if (targetRef.current && focused && !isComplete) {
        targetRef.current.scrollIntoView({
          behavior: "smooth",
          block: "center",
          inline: "center",
        });
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
        if (isInputDisabled) {
          return;
        }

        const newValue = targetValue;
        const oldValue = input;

        if (newValue === oldValue) {
          return;
        }

        if (newValue.length < oldValue.length) {
          let lastCompletedWordEnd = 0;
          for (let i = 0; i < oldValue.length; i++) {
            if (oldValue[i] !== phrase[i]) {
              break;
            }
            if (phrase[i] === " ") {
              lastCompletedWordEnd = i + 1;
            }
          }

          if (newValue.length < lastCompletedWordEnd) {
            const correctPrefix = phrase.substring(0, lastCompletedWordEnd);
            if (inputRef.current) {
              inputRef.current.value = correctPrefix;
            }
            setInput(correctPrefix);
            return;
          }
        }

        let correctCharCount = 0;
        let firstErrorPos: number | null = null;
        for (let i = 0; i < newValue.length; i++) {
          if (newValue[i] === phrase[i]) {
            if (firstErrorPos === null) {
              correctCharCount++;
            }
          } else {
            if (firstErrorPos === null) {
              firstErrorPos = i;
            }
          }
        }

        const showErrorWarning =
          firstErrorPos !== null && newValue.length - firstErrorPos - 1 >= 10;
        setShowErrorWarning(showErrorWarning);
        setInput(newValue);

        if (onWordComplete && newValue.length > oldValue.length) {
          const lastCharIndex = newValue.length - 1;
          const lastChar = newValue[lastCharIndex];
          const justTypedCorrectSpace =
            lastChar === " " && lastChar === phrase[lastCharIndex];
          const justCompletedPhrase = newValue === phrase;

          const wordIsFullyCorrect =
            justTypedCorrectSpace && firstErrorPos === null;

          if (wordIsFullyCorrect || justCompletedPhrase) {
            const wordEndIndex = justTypedCorrectSpace
              ? lastCharIndex - 1
              : phrase.length - 1;
            let wordStartIndex = wordEndIndex;
            while (wordStartIndex > 0 && phrase[wordStartIndex - 1] !== " ") {
              wordStartIndex--;
            }
            const wordLength = wordEndIndex - wordStartIndex + 1;

            if (phraseRef.current && wordLength > 0) {
              const spans =
                phraseRef.current.querySelectorAll<HTMLElement>(
                  "[data-char-index]",
                );
              const startSpan = spans[wordStartIndex];
              const endSpan = spans[wordEndIndex];
              if (startSpan && endSpan) {
                const startRect = startSpan.getBoundingClientRect();
                const endRect = endSpan.getBoundingClientRect();
                const centerX = (startRect.left + endRect.right) / 2;
                onWordComplete(wordLength, { x: centerX, y: startRect.top });
              }
            }
          }
        }

        if (onProgress) {
          if (newValue.length < oldValue.length) {
            const charsDeleted = oldValue.length - newValue.length;
            for (let i = 0; i < charsDeleted; i++) {
              onProgress(correctCharCount, "Backspace");
            }
          } else {
            const charsAdded = newValue.length - oldValue.length;
            for (let i = 0; i < charsAdded; i++) {
              const charIndex = oldValue.length + i;
              const newChar = newValue[charIndex];
              const expectedChar = phrase[charIndex];
              const eventType =
                newChar === expectedChar ? "Correct" : "Incorrect";
              const correctCharCountAfterEvent = Math.min(
                correctCharCount,
                charIndex + 1,
              );
              onProgress(correctCharCountAfterEvent, eventType);
            }
          }
        }

        if (newValue === phrase && onComplete) {
          setIsComplete(true);
          onComplete();
          if (resetOnComplete) {
            setTimeout(() => {
              if (inputRef.current) {
                inputRef.current.value = "";
              }
              setInput("");
              setIsComplete(false);
              setShowErrorWarning(false);
            }, 0);
          }
        }
      },
      [
        phrase,
        onComplete,
        onProgress,
        onWordComplete,
        input,
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
      const cursorKeys = [
        "ArrowLeft",
        "ArrowRight",
        "Home",
        "End",
        "PageUp",
        "PageDown",
      ];

      if (cursorKeys.includes(event.key)) {
        event.preventDefault();
      }
    }, []);

    const containerStyle: React.CSSProperties = {
      ...(height ? { minHeight: height } : null),
    };

    return (
      <div
        className={`relative box-with-focus w-full px-6 py-3 cursor-text flex items-start ${inputState === "disabled-dimmed" ? "opacity-60" : ""}`}
        style={containerStyle}
        onClick={() => inputRef.current?.focus()}
      >
        {showErrorWarning && (
          <div className="absolute bottom-2 left-0 right-0 font-semibold text-center text-destructive">
            {getTranslations().tooManyErrors}
          </div>
        )}
        <div className="relative select-none flex-1">
          <div className="type-box">
            <div
              className="text-start text-[26px] font-mono leading-12 height"
              ref={phraseRef}
            >
              <PhraseCharacters
                phrase={phrase}
                input={input}
                noSpaces={noSpacesLang}
                targetRef={targetRef}
              />
            </div>

            <Cursor
              targetRef={targetRef}
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
