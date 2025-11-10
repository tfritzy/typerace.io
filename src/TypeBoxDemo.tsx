import { useState } from 'react';
import { TypeBox } from './TypeBox';

const samplePhrases = [
  'The quick brown fox jumps over the lazy dog',
  'Practice makes perfect',
  'Type fast and accurate',
  'Welcome to TypeRace',
  'Speed typing is fun',
];

function TypeBoxDemo() {
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);

  const handleComplete = () => {
    console.log('Phrase completed!');
  };

  const handleReset = () => {
    console.log('Reset clicked!');
  };

  const nextPhrase = () => {
    setCurrentPhraseIndex((prev) => (prev + 1) % samplePhrases.length);
  };

  const prevPhrase = () => {
    setCurrentPhraseIndex(
      (prev) => (prev - 1 + samplePhrases.length) % samplePhrases.length
    );
  };

  return (
    <div className="min-h-screen bg-[var(--color-background)] flex flex-col items-center justify-center p-4">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-[var(--color-text-complete)] mb-2">
          TypeBox Component Demo
        </h1>
        <p className="text-[var(--color-text-incomplete)] text-lg">
          Type the phrase below as quickly and accurately as possible
        </p>
      </div>

      <TypeBox
        phrase={samplePhrases[currentPhraseIndex]}
        onComplete={handleComplete}
        onReset={handleReset}
      />

      <div className="mt-8 flex gap-4">
        <button
          onClick={prevPhrase}
          className="px-6 py-3 bg-[var(--color-text-incomplete)] text-[var(--color-text-complete)] rounded-md hover:opacity-80 transition-opacity font-medium"
        >
          ← Previous Phrase
        </button>
        <button
          onClick={nextPhrase}
          className="px-6 py-3 bg-[var(--color-text-incomplete)] text-[var(--color-text-complete)] rounded-md hover:opacity-80 transition-opacity font-medium"
        >
          Next Phrase →
        </button>
      </div>

      <div className="mt-8 text-center text-sm text-[var(--color-text-incomplete)]">
        <p>Phrase {currentPhraseIndex + 1} of {samplePhrases.length}</p>
      </div>
    </div>
  );
}

export default TypeBoxDemo;
