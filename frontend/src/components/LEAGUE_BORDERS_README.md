# League Border Components

League border components for displaying player ranks based on MMR (Matchmaking Rating).

## Available Leagues

- **Bronze** (MMR < 1000): Amber/brown border with warm glow
- **Silver** (MMR 1000-1499): Slate gray border with cool glow
- **Gold** (MMR 1500-1999): Yellow/gold border with bright glow
- **Platinum** (MMR 2000-2499): Cyan border with cool bright glow
- **Diamond** (MMR 2500-2999): Blue border with cool glow
- **Master** (MMR 3000+): Purple border with vibrant glow

## Usage

### Option 1: Individual League Border Components

Use specific border components for each league:

```tsx
import { BronzeBorder, SilverBorder, GoldBorder, PlatinumBorder, DiamondBorder, MasterBorder } from './components';
import Avatar from 'boring-avatars';

function PlayerAvatar({ playerName }) {
  return (
    <GoldBorder>
      <Avatar size={40} name={playerName} variant="pixel" />
    </GoldBorder>
  );
}
```

### Option 2: Dynamic LeagueBorder Component

Use the `LeagueBorder` component with the league prop:

```tsx
import { LeagueBorder, League, getLeagueFromMmr } from './components';
import Avatar from 'boring-avatars';

function PlayerAvatar({ playerName, mmr }) {
  const league = getLeagueFromMmr(mmr);
  
  return (
    <LeagueBorder league={league}>
      <Avatar size={40} name={playerName} variant="pixel" />
    </LeagueBorder>
  );
}
```

### Option 3: Direct League Enum

```tsx
import { LeagueBorder, League } from './components';
import Avatar from 'boring-avatars';

function PlayerAvatar({ playerName }) {
  return (
    <LeagueBorder league={League.Diamond}>
      <Avatar size={40} name={playerName} variant="pixel" />
    </LeagueBorder>
  );
}
```

## Props

### LeagueBorder Props

- `league` (League): The league tier to display
- `children` (ReactNode): The content to wrap (usually an avatar)
- `size` (number, optional): Override size in pixels
- `className` (string, optional): Additional CSS classes

### Individual Border Components Props

- `children` (ReactNode): The content to wrap (usually an avatar)
- `size` (number, optional): Override size in pixels
- `className` (string, optional): Additional CSS classes

## Integration Example

Replace existing avatar borders in components like `ProfileAvatar.tsx`:

```tsx
// Before
<div className="relative shrink-0 border-2 border-amber-400 rounded-full">
  <Avatar size={40} name={identityHash} variant="pixel" />
</div>

// After
<LeagueBorder league={getLeagueFromMmr(player.mmr)}>
  <Avatar size={40} name={identityHash} variant="pixel" />
</LeagueBorder>
```

## Styling

Each league has:
- A distinct border color
- A glowing shadow effect matching the league color
- Consistent 2px border width
- Rounded corners (full circle)

The styling uses Tailwind CSS classes and is consistent with the existing design system.
