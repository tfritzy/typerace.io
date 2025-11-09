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
    <div style={{ 
      padding: '2rem',
      minHeight: '100vh',
      backgroundColor: 'var(--color-background)',
      color: 'var(--color-text)'
    }}>
      <h1 style={{ 
        textAlign: 'center',
        marginBottom: '2rem',
        color: 'var(--color-primary)'
      }}>
        TypeBox Demo
      </h1>

      <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
        <button 
          onClick={prevPhrase}
          style={{
            padding: '0.5rem 1rem',
            marginRight: '1rem',
            backgroundColor: 'var(--color-background-secondary)',
            color: 'var(--color-text)',
            border: '1px solid var(--color-border)',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Previous Phrase
        </button>
        <button 
          onClick={nextPhrase}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: 'var(--color-background-secondary)',
            color: 'var(--color-text)',
            border: '1px solid var(--color-border)',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Next Phrase
        </button>
      </div>

      <TypeBox 
        key={currentPhraseIndex}
        phrase={samplePhrases[currentPhraseIndex]}
        onComplete={handleComplete}
      />

      <div style={{
        marginTop: '2rem',
        textAlign: 'center',
        color: 'var(--color-text-dim)',
        fontSize: '0.9rem'
      }}>
        <p>Phrase {currentPhraseIndex + 1} of {samplePhrases.length}</p>
        <p style={{ marginTop: '1rem' }}>
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
