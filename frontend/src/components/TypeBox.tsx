import React, {
  useCallback,
  useRef,
  useState,
  useImperativeHandle,
  forwardRef,
} from "react";
import { Cursor } from "./Cursor";

type TypeBoxProps = {
  phrase: string;
  attribution?: string;
  onComplete?: () => void;
  onProgress?: (
    correctCharCount: number,
    eventType: "Correct" | "Incorrect" | "Backspace"
  ) => void;
  onWordComplete?: (wordXp: number, position: { x: number; y: number }) => void;
  className?: string;
  height?: string;
  resetOnComplete?: boolean;
  disabled?: boolean;
  initialProgress?: number;
  isCode?: boolean;
};

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
      className,
      height,
      resetOnComplete = false,
      disabled = false,
      initialProgress = 0,
      isCode = false,
    },
    ref
  ) => {
    const [focused, setFocused] = useState(true);
    const [input, setInput] = useState(phrase.substring(0, initialProgress));
    const [isComplete, setIsComplete] = useState(false);
    const [hasReachedErrorLimit, setHasReachedErrorLimit] = useState(false);

    const targetRef = useRef<HTMLElement>(null);
    const phraseRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

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
      (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        if (disabled) {
          return;
        }

        let newValue = event.target.value;

        if (isCode && newValue.length > input.length) {
          const lastChar = newValue[newValue.length - 1];
          if (lastChar === "\n") {
            const nextIndex = newValue.length;
            let spacesToAdd = "";
            for (let i = nextIndex; i < phrase.length; i++) {
              if (phrase[i] === " ") {
                spacesToAdd += " ";
              } else {
                break;
              }
            }
            if (spacesToAdd.length > 0) {
              newValue += spacesToAdd;
            }
          }
        }

        if (newValue.length > phrase.length) {
          return;
        }

        const oldValue = input;

        if (newValue.length < oldValue.length) {
          let lastCompletedWordEnd = 0;
          for (let i = 0; i < oldValue.length; i++) {
            if (oldValue[i] !== phrase[i]) {
              break;
            }
            if (phrase[i] === " " || (isCode && phrase[i] === "\n")) {
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

        const isAddingChar = newValue.length > oldValue.length;
        if (isAddingChar && firstErrorPos !== null) {
          const charsAfterError = newValue.length - firstErrorPos - 1;
          if (charsAfterError >= 10) {
            setHasReachedErrorLimit(true);
            return;
          }
        }

        const reachedLimit =
          firstErrorPos !== null && newValue.length - firstErrorPos - 1 >= 10;
        setHasReachedErrorLimit(reachedLimit);
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
              const spans = phraseRef.current.querySelectorAll("span");
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

        if (onProgress && newValue.length !== oldValue.length) {
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
              setHasReachedErrorLimit(false);
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
        disabled,
        isCode,
      ]
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

    const renderText = () => {
      const chars = phrase.split("");

      let lastCompletedWordEnd = 0;
      for (let i = 0; i < input.length && i < phrase.length; i++) {
        if (input[i] !== phrase[i]) {
          break;
        }
        if (phrase[i] === " " || (isCode && phrase[i] === "\n")) {
          lastCompletedWordEnd = i + 1;
          if (isCode && phrase[i] === "\n") {
            let j = i + 1;
            while (j < phrase.length && phrase[j] === " " && j < input.length && input[j] === phrase[j]) {
              lastCompletedWordEnd = j + 1;
              j++;
            }
          }
        }
      }

      return chars.map((char, i) => {
        const isTyped = i < input.length;
        const isCorrect = input[i] === char;
        const isCursor = i === input.length;
        const isInCompletedWord = i < lastCompletedWordEnd;
        const isInCurrentWord =
          i >= lastCompletedWordEnd && i < input.length && isCorrect;

        const style: React.CSSProperties = {};
        if (isTyped && !isCorrect) {
          style.color = "var(--color-error)";
        } else if (isInCompletedWord) {
          style.color = "rgba(255, 255, 255, 0.15)";
        } else if (isInCurrentWord) {
          style.color = "var(--color-white)";
        } else {
          style.color = "rgba(255, 255, 255, 0.35)";
        }

        if (isCode && char === "\n") {
          return (
            <span key={i}>
              {isCursor && <span id="target" ref={targetRef} />}
              <span
                className={`transition-all duration-150 ${isTyped && !isCorrect ? "underline decoration-2 decoration-red-500" : ""}`}
                style={style}
              >↵</span>
              <br />
            </span>
          );
        }

        return (
          <span
            key={i}
            className={`transition-all duration-150 ${isTyped && !isCorrect ? "underline decoration-2 decoration-red-500" : ""}`}
            style={style}
          >
            {isCursor && <span id="target" ref={targetRef} />}
            {char}
          </span>
        );
      });
    };

    return (
      <div
        className={`relative box-with-focus w-full rounded-lg px-8 py-6 cursor-text flex items-start ${hasReachedErrorLimit ? "border-red-500!" : ""} ${disabled ? "opacity-60" : ""} ${className || ""}`}
        style={height ? { minHeight: height } : undefined}
        onClick={() => inputRef.current?.focus()}
      >
        {hasReachedErrorLimit && (
          <div className="absolute bottom-2 left-0 right-0 font-semibold text-center text-(--color-error)">
            You must fix all errors
          </div>
        )}
        <div className="relative select-none flex-1">
          <div className="type-box">
            <div
              className="whitespace-pre-wrap text-start font-mono"
              ref={phraseRef}
            >
              {renderText()}
            </div>

            <Cursor
              targetRef={targetRef}
              lerp={0.22}
              fadeDelay={500}
              visible={focused && !isComplete}
            />

            <textarea
              ref={inputRef}
              value={input}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              onPaste={handlePaste}
              onFocus={handleFocus}
              onBlur={handleBlur}
              id="type-box"
              className="outline-none resize-none absolute top-0 left-0 opacity-0 pointer-events-none"
              autoCapitalize="none"
              autoComplete="off"
              spellCheck={false}
              autoFocus
            />
          </div>
          {attribution && (
            <div className="mt-6 text-lg text-white/40 italic font-light text-right select-none pr-2">
              - {attribution}
            </div>
          )}
        </div>
      </div>
    );
  }
);
