import React, { useCallback, useEffect, useRef, useState } from "react";
import { Cursor } from "./Cursor";

type TypeBoxProps = {
  phrase: string;
  onComplete?: () => void;
  onProgress?: (correctCharCount: number) => void;
  onFocusChange?: (focused: boolean) => void;
};

export const TypeBox = ({ phrase, onComplete, onProgress, onFocusChange }: TypeBoxProps) => {
  const [focused, setFocused] = useState(true);
  const [input, setInput] = useState("");
  const [inputWidth, setInputWidth] = useState(0);

  const targetRef = useRef<HTMLElement>(null);

  const phraseRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (phraseRef.current) {
      setInputWidth(phraseRef.current.clientWidth);
    }
  }, [phrase]);

  const resetCursorToEnd = useCallback(() => {
    if (inputRef.current) {
      const length = inputRef.current.value.length;
      inputRef.current.setSelectionRange(length, length);
    }
  }, []);

  const handleFocus = useCallback(() => {
    setFocused(true);
    resetCursorToEnd();
    if (onFocusChange) {
      onFocusChange(true);
    }
  }, [resetCursorToEnd, onFocusChange]);

  const handleBlur = useCallback(() => {
    setFocused(false);
    if (onFocusChange) {
      onFocusChange(false);
    }
  }, [onFocusChange]);

  const handlePaste = useCallback((event: React.ClipboardEvent) => {
    event.preventDefault();
  }, []);

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = event.target.value;

      if (newValue.length > phrase.length) {
        return;
      }

      setInput(newValue);

      let correctCharCount = 0;
      for (let i = 0; i < newValue.length; i++) {
        if (newValue[i] === phrase[i]) {
          correctCharCount++;
        } else {
          break;
        }
      }

      if (onProgress) {
        onProgress(correctCharCount);
      }

      if (newValue === phrase && onComplete) {
        onComplete();
      }
    },
    [phrase, onComplete, onProgress]
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
        style.color = "var(--color-text-primary)";
      } else if (isTyped && !isCorrect) {
        style.color = "var(--color-alert-error)";
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
            width: `${inputWidth}px`,
            cursor: focused ? "auto" : "pointer",
          }}
        />
      </div>
    </div>
  );
};
