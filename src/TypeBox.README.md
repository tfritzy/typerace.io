# TypeBox Component

A React component that provides a MonkeyType-style typing experience with real-time visual feedback.

## Features

- Character-by-character typing tracking
- Visual feedback for typing progress:
  - **Completed characters**: Full color (light gray)
  - **Incomplete characters**: 30% opacity (transparent)
  - **Incorrect characters**: Red color
- Animated caret indicator at current position
- Completion detection and callback
- Reset functionality
- Progress tracking

## Usage

```tsx
import { TypeBox } from './TypeBox';

function MyComponent() {
  const handleComplete = () => {
    console.log('Phrase completed!');
  };

  const handleReset = () => {
    console.log('Reset clicked!');
  };

  return (
    <TypeBox
      phrase="Type this phrase"
      onComplete={handleComplete}
      onReset={handleReset}
    />
  );
}
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `phrase` | `string` | Yes | The phrase that the user needs to type |
| `onComplete` | `() => void` | No | Callback function called when the phrase is completed correctly |
| `onReset` | `() => void` | No | Callback function called when the reset button is clicked |

## Styling

The component uses TailwindCSS for styling and CSS variables for colors. All colors are defined in `src/index.css`:

- `--color-text-complete`: Completed text color
- `--color-text-incomplete`: Incomplete text color (with opacity)
- `--color-text-incorrect`: Incorrect text color (red)
- `--color-caret`: Caret/cursor color
- `--color-background`: Main background color
- `--color-background-input`: Input area background color

You can customize these colors by modifying the CSS variables in your global styles.

## Demo

See `src/TypeBoxDemo.tsx` for a complete example with multiple phrases and navigation controls.
