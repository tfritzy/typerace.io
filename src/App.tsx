import { useState } from 'react';
import { TypeBox } from './TypeBox';

const samplePhrases = [
  'The quick brown fox jumps over the lazy dog',
  'TypeScript is a strongly typed programming language',
  'Practice makes perfect',
  'A journey of a thousand miles begins with a single step',
];

function App() {
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);

  const handleComplete = () => {
    console.log('Phrase completed!');
  };

  const nextPhrase = () => {
    setCurrentPhraseIndex((prev) => (prev + 1) % samplePhrases.length);
  };

  const prevPhrase = () => {
    setCurrentPhraseIndex((prev) => 
      prev === 0 ? samplePhrases.length - 1 : prev - 1
    );
  };

  return (
    <div className="p-8 min-h-screen bg-background text-text">
      <h1 className="text-center mb-8 text-primary">TypeBox Demo</h1>

      <div className="mb-4 text-center">
        <button 
          onClick={prevPhrase}
          className="py-2 px-4 mr-4 bg-background-secondary text-text border border-border rounded cursor-pointer hover:opacity-80"
        >
          Previous Phrase
        </button>
        <button 
          onClick={nextPhrase}
          className="py-2 px-4 bg-background-secondary text-text border border-border rounded cursor-pointer hover:opacity-80"
        >
          Next Phrase
        </button>
      </div>

      <TypeBox 
        key={currentPhraseIndex}
        phrase={samplePhrases[currentPhraseIndex]}
        onComplete={handleComplete}
      />

      <div className="mt-8 text-center text-text-dim text-sm">
        <p>Phrase {currentPhraseIndex + 1} of {samplePhrases.length}</p>
        <p className="mt-4">
          Start typing to see your progress. 
          Correct characters are fully colored, 
          incomplete characters are transparent, 
          and incorrect characters are red.
        </p>
      </div>
    </div>
  );
}

export default App;
