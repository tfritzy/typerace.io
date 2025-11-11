import React, { useCallback, useEffect, useRef, useState } from "react";
import { Cursor } from "./Cursor";

type TypeBoxProps = {
  phrase: string;
};

export const TypeBox = ({ phrase }: TypeBoxProps) => {
  const [focused, setFocused] = useState(true);
  const [input, setInput] = useState("");
  const [inputWidth, setInputWidth] = useState(0);

  const targetRef = useRef<HTMLElement>(null);

  const phraseRef = useRef<HTMLElement>(null);
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

      setInput(newValue);
    },
    [input.length, phrase]
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

      let className = "";
      if (isTyped && isCorrect) {
        className = "text-white";
      } else if (isTyped && !isCorrect) {
        className = "text-red-500 underline decoration-3";
      } else {
        className = "text-white/25";
      }

      return (
        <span
          key={i}
          className={`${className} transition-colors`}
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
        <h1
          className="rounded-lg transition-colors whitespace-pre-wrap text-start"
          ref={phraseRef}
        >
          {renderText()}
        </h1>

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
