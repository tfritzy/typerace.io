import React, { useCallback, useRef, useState, useImperativeHandle, forwardRef } from "react";
import { Cursor } from "./Cursor";
import "./ChatBox.css";

type TypeBoxProps = {
  phrase: string;
  onComplete?: () => void;
  onProgress?: (correctCharCount: number, eventType: "Correct" | "Incorrect" | "Backspace") => void;
  className?: string;
  style?: React.CSSProperties;
};

export type TypeBoxRef = {
  focus: () => void;
};

export const TypeBox = forwardRef<TypeBoxRef, TypeBoxProps>(({ phrase, onComplete, onProgress, className, style }, ref) => {
  const [focused, setFocused] = useState(true);
  const [input, setInput] = useState("");
  const [hasError, setHasError] = useState(false);

  const targetRef = useRef<HTMLElement>(null);

  const phraseRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

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
      const newValue = event.target.value;

      if (newValue.length > phrase.length) {
        return;
      }

      const oldValue = input;
      setInput(newValue);

      let correctCharCount = 0;
      let hasIncorrectChar = false;
      for (let i = 0; i < newValue.length; i++) {
        if (newValue[i] === phrase[i]) {
          correctCharCount++;
        } else {
          hasIncorrectChar = true;
          break;
        }
      }

      setHasError(hasIncorrectChar);

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
        onComplete();
      }
    },
    [phrase, onComplete, onProgress, input]
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
      className={`chat-box w-full rounded-lg px-8 py-6 cursor-pointer ${hasError ? 'border-red-500' : ''} ${className || ''}`}
      style={style}
      onClick={() => inputRef.current?.focus()}
    >
      <div className="relative select-none">
        <div className="type-box">
          <div
            className="whitespace-pre-wrap text-start"
            ref={phraseRef}
          >
            {renderText()}
          </div>

          <Cursor targetRef={targetRef} lerp={0.15} fadeDelay={500} />

          <textarea
            ref={inputRef}
            value={input}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onSelect={resetCursorToEnd}
            onMouseDown={resetCursorToEnd}
            onMouseUp={resetCursorToEnd}
            onClick={resetCursorToEnd}
            id="type-box"
            className="w-full min-h-full outline-none typebox absolute top-0 left-0 bg-transparent text-transparent resize-none"
            autoCorrect="false"
            autoCapitalize="none"
            autoComplete="off"
            spellCheck={false}
            autoFocus
            style={{
              cursor: focused ? "auto" : "pointer",
            }}
          />
        </div>
      </div>
    </div>
  );
});
