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

      // Mark current character (next to be typed)
      if (index === userInput.length && !isCompleted) {
        className += ' current';
      }

      return (
        <span key={index} className={className}>
          {char}
        </span>
      );
    });
  };

  return (
    <div className="typebox-container">
      <div className="typebox-display">
        {renderCharacters()}
      </div>
      <input
        ref={inputRef}
        type="text"
        className="typebox-input"
        value={userInput}
        onChange={handleInputChange}
        disabled={isCompleted}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck="false"
      />
      {isCompleted && (
        <div className="typebox-complete">
          <p>✓ Completed!</p>
          <button onClick={handleReset}>Try Again</button>
        </div>
      )}
    </div>
  );
}
