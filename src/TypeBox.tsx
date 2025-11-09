import { useState, useEffect, useRef } from 'react';
import './TypeBox.css';

interface TypeBoxProps {
  phrase: string;
  onComplete?: () => void;
}

export function TypeBox({ phrase, onComplete }: TypeBoxProps) {
  const [userInput, setUserInput] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Focus input on mount
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    // Check if user completed the phrase correctly
    if (userInput === phrase) {
      setIsCompleted(true);
      onComplete?.();
    }
  }, [userInput, phrase, onComplete]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow input up to phrase length
    if (value.length <= phrase.length) {
      setUserInput(value);
    }
  };

  const handleReset = () => {
    setUserInput('');
    setIsCompleted(false);
    inputRef.current?.focus();
  };

  const renderCharacters = () => {
    return phrase.split('').map((char, index) => {
      let className = 'char';
      
      if (index < userInput.length) {
        // Character has been typed
        if (userInput[index] === char) {
          className += ' correct';
        } else {
          className += ' incorrect';
        }
      } else {
        // Character hasn't been typed yet
        className += ' incomplete';
      }

      return (
        <span key={index} className={className}>
          {char}
        </span>
      );
    });
  };

  return (
    <div className="w-full max-w-[800px] mx-auto font-mono">
      <div className="bg-background-secondary border-2 border-border rounded-lg p-8 text-2xl leading-8 min-h-[150px] cursor-text select-none break-words">
        {renderCharacters()}
      </div>
      <input
        ref={inputRef}
        type="text"
        className="absolute opacity-0 pointer-events-none"
        value={userInput}
        onChange={handleInputChange}
        disabled={isCompleted}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck="false"
      />
      {isCompleted && (
        <div className="mt-6 text-center">
          <p className="text-correct text-2xl mb-4">✓ Completed!</p>
          <button 
            onClick={handleReset}
            className="bg-primary text-background border-none rounded-md px-6 py-3 text-base font-semibold cursor-pointer transition-opacity hover:opacity-80 active:opacity-60"
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}
