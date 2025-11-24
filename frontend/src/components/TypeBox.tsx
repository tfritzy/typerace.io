import React, { useCallback, useRef, useState, useImperativeHandle, forwardRef } from "react";
import { Cursor } from "./Cursor";

type TypeBoxProps = {
  phrase: string;
  onComplete?: () => void;
  onProgress?: (correctCharCount: number, eventType: "Correct" | "Incorrect" | "Backspace") => void;
  className?: string;
  height?: string;
  resetOnComplete?: boolean;
  disabled?: boolean;
  initialProgress?: number;
};

export type TypeBoxRef = {
  focus: () => void;
};

export const TypeBox = forwardRef<TypeBoxRef, TypeBoxProps>(({ phrase, onComplete, onProgress, className, height, resetOnComplete = false, disabled = false, initialProgress = 0 }, ref) => {
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
        inline: "center"
      });
    }
  }, [input.length, focused, isComplete]);

  useImperativeHandle(ref, () => ({
    focus: () => {
      inputRef.current?.focus();
    }
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
      console.log("TypeBox onChange:", {
        eventType: event.type,
        targetValue: event.target.value
      });

      if (disabled) {
        return;
      }

      const newValue = event.target.value;

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
          if (phrase[i] === ' ') {
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

      const reachedLimit = firstErrorPos !== null && (newValue.length - firstErrorPos - 1) >= 10;
      setHasReachedErrorLimit(reachedLimit);
      setInput(newValue);

      if (onProgress && newValue.length !== oldValue.length) {
        let eventType: "Correct" | "Incorrect" | "Backspace";

        if (newValue.length < oldValue.length) {
          eventType = "Backspace";
        } else {
          const newChar = newValue[newValue.length - 1];
          const expectedChar = phrase[newValue.length - 1];
          eventType = newChar === expectedChar ? "Correct" : "Incorrect";
        }

        onProgress(correctCharCount, eventType);
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
    [phrase, onComplete, onProgress, input, resetOnComplete, disabled]
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
    return chars.map((char, i) => {
      const isTyped = i < input.length;
      const isCorrect = input[i] === char;
      const isCursor = i === input.length;

      const style: React.CSSProperties = {};
      if (isTyped && isCorrect) {
        style.color = "var(--color-white)";
      } else if (isTyped && !isCorrect) {
        style.color = "var(--color-error)";
      } else {
        style.color = "rgba(255, 255, 255, 0.35)";
      }

      return (
        <span
          key={i}
          className={`transition-all duration-150 ${isTyped && !isCorrect ? 'underline decoration-2 decoration-red-500' : ''}`}
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
      className={`relative box-with-focus w-full rounded-lg px-8 py-6 cursor-text flex items-start ${hasReachedErrorLimit ? 'border-red-500!' : ''} ${disabled ? 'opacity-60' : ''} ${className || ''}`}
      style={height ? { height } : undefined}
      onClick={() => inputRef.current?.focus()}
    >
      {hasReachedErrorLimit && (
        <div className="absolute bottom-2 left-0 right-0 font-semibold text-center text-(--color-error)">
          You must fix all errors
        </div>
      )}
      <div className="relative select-none">
        <div className="type-box">
          <div
            className="whitespace-pre-wrap text-start"
            ref={phraseRef}
          >
            {renderText()}
          </div>

          <Cursor targetRef={targetRef} lerp={0.15} fadeDelay={500} visible={focused && !isComplete} />

          <textarea
            ref={inputRef}
            value={input}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            onFocus={handleFocus}
            onBlur={handleBlur}
            id="type-box"
            className="outline-none resize-none absolute top-0 left-0 w-0 h-0 opacity-0 pointer-events-none"
            autoCapitalize="none"
            autoComplete="off"
            spellCheck={false}
            autoFocus
            readOnly={disabled}
          />
        </div>
      </div>
    </div>
  );
});
