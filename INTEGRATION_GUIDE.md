# Player Color Integration Guide

This guide explains how to integrate the player color customization feature after regenerating the TypeScript bindings.

## Architecture

### Backend (Complete)
- `PlayerColor` enum with 10 color options
- `Color` field on `Player` table
- `SetPlayerColor(color: PlayerColor)` reducer
- Default color (Amber) for new players
- Random colors for bots

### Frontend Components

#### 1. Color Mapping Utility (`src/utils/colorMapping.ts`)
Provides:
- `PlayerColor` enum (matches backend)
- `ColorConfig` interface with primary colors, gradients, and avatar colors
- `COLOR_CONFIGS` mapping for all 10 colors
- `getColorConfig(color)` helper function
- `setAccentColor(color)` to update CSS variables

#### 2. Color Selector Component (`src/components/ColorSelector.tsx`)
Visual color picker with:
- Grid layout (5 columns x 2 rows)
- Gradient buttons for each color
- Selected state with glow effect
- Hover effects

#### 3. usePlayerColor Hook (`src/hooks/usePlayerColor.ts`)
React hook that:
- Takes a `PlayerColor` value
- Automatically updates CSS variables when color changes
- Returns the color configuration

## Integration Steps

### Step 1: Update ProfileAvatar Component

```typescript
import { usePlayerColor } from '../hooks/usePlayerColor';
import { getColorConfig } from '../utils/colorMapping';

export const ProfileAvatar = () => {
    // ... existing code ...
    const myPlayer = /* ... get player ... */;
    const colorConfig = myPlayer ? getColorConfig(myPlayer.color) : null;
    
    return (
        <div className="relative shrink-0 border-2 rounded-full" 
             style={{ borderColor: colorConfig?.primary || '#fbbf24' }}>
            <Avatar
                size={40}
                name={identityHash}
                variant="pixel"
                colors={colorConfig?.avatarColors || ["#fbbf24", "#f59e0b", "#d97706", "#b45309", "#92400e"]}
            />
        </div>
    );
};
```

### Step 2: Update ProfilePage

Add color selector section:

```typescript
import { ColorSelector } from '../components/ColorSelector';
import { usePlayerColor } from '../hooks/usePlayerColor';
import { PlayerColor } from '../utils/colorMapping';

export const ProfilePage = () => {
    // ... existing code ...
    const myPlayer = /* get current player */;
    
    usePlayerColor(myPlayer?.color);
    
    const handleColorChange = (color: PlayerColor) => {
        conn?.reducers.setPlayerColor(color);
    };
    
    return (
        <div>
            {/* ... existing profile content ... */}
            
            <div style={{ marginTop: '32px' }}>
                <h2 style={{ 
                    color: '#ffffff', 
                    fontSize: '1.5rem', 
                    fontWeight: 700,
                    marginBottom: '16px'
                }}>
                    Customize Your Color
                </h2>
                <ColorSelector 
                    selectedColor={myPlayer?.color || PlayerColor.Amber}
                    onColorSelect={handleColorChange}
                />
            </div>
        </div>
    );
};
```

### Step 3: Update PlayerProgressBar

Replace hardcoded colors with dynamic colors:

```typescript
import { getColorConfig, PlayerColor } from '../utils/colorMapping';

export const PlayerProgressBar = ({ /* ... props, add playerColor */ }) => {
    const colorConfig = getColorConfig(playerColor || PlayerColor.Amber);
    
    return (
        <div className={`relative shrink-0 border-2 rounded-full ${
            isCurrentPlayer ? '' : 'border-white/30'
        }`}
        style={isCurrentPlayer ? { borderColor: colorConfig.primary } : {}}>
            <Avatar
                size={40}
                name={identityHash}
                variant="pixel"
                colors={colorConfig.avatarColors}
            />
        </div>
        {/* ... */}
        <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden">
            <div
                className={`h-full rounded-full transition-all duration-200`}
                style={{ 
                    width: `${Math.min(100, progressPercentage)}%`,
                    background: isCurrentPlayer ? colorConfig.gradient : 'linear-gradient(to right, #78716c, #a8a29e)'
                }}
            />
        </div>
    );
};
```

### Step 4: Update App.tsx

Add global color initialization:

```typescript
import { usePlayerColor } from './hooks/usePlayerColor';

function App() {
    const conn = useSpacetimeDB();
    const myPlayer = /* get current player */;
    
    usePlayerColor(myPlayer?.color);
    
    // ... rest of app
}
```

### Step 5: Update All Component Props

Components that display player-specific colors need to pass the color prop:
- `PlayerProgressBar` - add `playerColor: PlayerColor` prop
- `InlinePlayerProgress` - add `playerColor: PlayerColor` prop
- Any other player-specific components

## CSS Variables

The system uses these CSS variables (automatically updated by `setAccentColor`):
- `--color-accent` - Primary accent color
- `--color-accent-light` - Lighter shade
- `--color-accent-dark` - Darker shade

These are already used in:
- `App.css` - Logo accent color and glow
- `index.css` - Base accent color definition
- Various components via `var(--color-accent)`

## Testing

After integration:
1. Open profile page
2. Select different colors
3. Verify:
   - Color selector shows current color
   - Clicking a color calls SetPlayerColor reducer
   - Avatar border color updates
   - Avatar colors update
   - Progress bars update
   - Logo color updates
   - All gradients update
4. Test in different pages (lobby, game, profile)
5. Test with multiple players (different colors should show)
