import { useState, useEffect, useRef } from 'react';

interface TypeBoxProps {
  phrase: string;
  onComplete?: () => void;
  onReset?: () => void;
}

export const TypeBox = ({ phrase, onComplete, onReset }: TypeBoxProps) => {
  const [userInput, setUserInput] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Focus input on mount
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    // Reset state when phrase changes
    setUserInput('');
    setIsCompleted(false);
    inputRef.current?.focus();
  }, [phrase]);

  useEffect(() => {
    // Check if completed
    if (userInput === phrase && userInput.length > 0) {
      setIsCompleted(true);
      onComplete?.();
    }
  }, [userInput, phrase, onComplete]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isCompleted) return;
    const value = e.target.value;
    
    // Only allow input up to the phrase length
    if (value.length <= phrase.length) {
      setUserInput(value);
    }
  };

  const handleReset = () => {
    setUserInput('');
    setIsCompleted(false);
    onReset?.();
    inputRef.current?.focus();
  };

  const renderCharacter = (char: string, index: number) => {
    const userChar = userInput[index];
    const isTyped = index < userInput.length;
    const isCorrect = userChar === char;
    const isCurrent = index === userInput.length;

    let className = 'inline-block transition-colors duration-75 ';
    
    if (isTyped) {
      if (isCorrect) {
        className += 'text-[var(--color-text-complete)] opacity-100';
      } else {
        className += 'text-[var(--color-text-incorrect)] opacity-100';
      }
    } else {
      className += 'text-[var(--color-text-incomplete)] opacity-30';
    }

    if (isCurrent && !isCompleted) {
      className += ' border-l-2 border-[var(--color-caret)] animate-pulse';
    }

    return (
      <span key={index} className={className}>
        {char === ' ' ? '\u00A0' : char}
      </span>
    );
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-4xl mx-auto p-8">
      <div className="w-full bg-[var(--color-background-input)] rounded-lg p-8 shadow-2xl">
        {/* Display area */}
        <div className="text-3xl font-mono leading-relaxed mb-6 min-h-[120px] flex items-center">
          <div className="w-full">
            {phrase.split('').map((char, index) => renderCharacter(char, index))}
          </div>
        </div>

        {/* Hidden input field */}
        <input
          ref={inputRef}
          type="text"
          value={userInput}
          onChange={handleInputChange}
          className="w-full px-4 py-3 bg-transparent border-2 border-[var(--color-text-incomplete)] rounded-md text-[var(--color-text-complete)] font-mono text-lg focus:outline-none focus:border-[var(--color-caret)] transition-colors"
          placeholder="Start typing..."
          disabled={isCompleted}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
        />

        {/* Status and controls */}
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm">
            <span className="text-[var(--color-text-incomplete)]">
              Progress: {userInput.length} / {phrase.length}
            </span>
          </div>
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-[var(--color-caret)] text-white rounded-md hover:opacity-80 transition-opacity font-medium"
          >
            Reset
          </button>
        </div>

        {isCompleted && (
          <div className="mt-4 text-center text-xl font-semibold text-[var(--color-caret)] animate-pulse">
            ✓ Completed!
          </div>
        )}
      </div>
    </div>
  );
};
