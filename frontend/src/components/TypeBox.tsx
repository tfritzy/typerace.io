import React, {
  useCallback,
  useRef,
  useState,
  useImperativeHandle,
  forwardRef,
} from "react";
import { Cursor } from "./Cursor";
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
  noSpacesInPhrase?: boolean;
  inputValue?: string;
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
      noSpacesInPhrase: noSpacesLang,
      inputValue,
    },
    ref,
  ) => {
    const nonBreakingSpace = "\u00A0";
    const spaceIndicatorChar = "␣";
    const isInputDisabled = inputState !== "enabled";
    const [focused, setFocused] = useState(true);
    const [input, setInput] = useState(phrase.substring(0, initialProgress));
    const [isComplete, setIsComplete] = useState(false);
    const [showErrorWarning, setShowErrorWarning] = useState(false);

    const targetRef = useRef<HTMLElement>(null);
    const phraseRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    React.useEffect(() => {
      if (inputValue !== undefined) {
        setInput(inputValue);
        setShowErrorWarning(false);
      }
    }, [inputValue]);

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
              onProgress(correctCharCount, eventType);
            }
          }
        }

        if (newValue === phrase && onComplete) {
          setIsComplete(true);
          onComplete();
          if (resetOnComplete) {
            setTimeout(() => {
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
      (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        handleChange(event.target.value);
      },
      [handleChange],
    );

    const handleCompositionUpdate = useCallback(
      (event: React.CompositionEvent<HTMLTextAreaElement>) => {
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

    const getMistypeIndicatorChar = (
      isError: boolean,
      typedChar: string | undefined,
    ) => {
      if (!isError || typedChar === undefined) return nonBreakingSpace;
      return typedChar === " " ? spaceIndicatorChar : typedChar;
    };

    const renderText = () => {
      const chars = phrase.split("");

      let lastCompletedWordEnd = 0;
      for (let i = 0; i < input.length && i < phrase.length; i++) {
        if (input[i] !== phrase[i]) {
          break;
        }
        if (phrase[i] === " ") {
          lastCompletedWordEnd = i + 1;
        }
      }

      const renderedCharacters = chars.map((char, i) => {
        const isTyped = i < input.length;
        const isCorrect = input[i] === char;
        const isCursor = i === input.length;
        const isInCompletedWord = input === phrase || i < lastCompletedWordEnd;
        const isInCurrentWord =
          i >= lastCompletedWordEnd && i < input.length && isCorrect;

        let colorClass = "text-text-untyped";
        if (isTyped && !isCorrect) {
          colorClass = "text-destructive";
        } else if (isInCompletedWord) {
          colorClass = "text-text-completed";
        } else if (isInCurrentWord) {
          colorClass = "text-foreground";
        }

        const isError = isTyped && !isCorrect;

        return (
          <span
            key={i}
            data-char-index={i}
            className="relative"
            style={noSpacesLang ? { display: "inline-block" } : {}}
          >
            <span
              className={`pointer-events-none absolute left-1/2 -translate-x-1/2 -top-[1em] leading-none text-destructive text-xs`}
            >
              {getMistypeIndicatorChar(isError, input[i])}
            </span>
            <span
              className={`transition-all duration-150 leading-none ${colorClass} ${isError ? "underline decoration-2 decoration-destructive" : ""}`}
            >
              {isCursor && <span id="target" ref={targetRef} />}
              {char}
            </span>
          </span>
        );
      });

      if (input.length >= phrase.length) {
        renderedCharacters.push(
          <span
            key="cursor-at-end"
            id="target"
            data-char-index={phrase.length}
            ref={targetRef}
          />,
        );
      }

      return renderedCharacters;
    };

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
              {renderText()}
            </div>

            <Cursor
              targetRef={targetRef}
              lerp={0.3}
              fadeDelay={500}
              visible={
                cursorState === "visible" ||
                (cursorState === "auto" && focused && !isComplete)
              }
            />

            <textarea
              ref={inputRef}
              value={input}
              onChange={handleInputUpdate}
              onKeyDown={handleKeyDown}
              onPaste={handlePaste}
              onFocus={handleFocus}
              onBlur={handleBlur}
              onCompositionUpdate={handleCompositionUpdate}
              onCompositionEnd={handleCompositionCommit}
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
