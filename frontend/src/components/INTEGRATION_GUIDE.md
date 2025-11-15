# League Border Components - Integration Guide

## Quick Start

The league border components are ready to use. Here's how to integrate them into existing components.

## Example Integration

### 1. Update ProfileAvatar Component

**Before:**
```tsx
<div className="relative shrink-0 border-2 border-amber-400 rounded-full">
    <Avatar size={40} name={identityHash} variant="pixel" colors={...} />
</div>
```

**After:**
```tsx
import { LeagueBorder, getLeagueFromMmr } from './index';

// Assuming player has an mmr field
const league = getLeagueFromMmr(myPlayer?.mmr ?? 0);

<LeagueBorder league={league}>
    <Avatar size={40} name={identityHash} variant="pixel" colors={...} />
</LeagueBorder>
```

### 2. Update PlayerProgressBar Component

**Before:**
```tsx
<div className={`relative shrink-0 border-2 rounded-full ${isCurrentPlayer ? 'border-amber-400' : 'border-white/30'}`}>
    <Avatar size={40} name={identityHash} variant="pixel" colors={...} />
</div>
```

**After:**
```tsx
import { LeagueBorder, getLeagueFromMmr, League } from './index';

// If player data includes MMR
const league = player?.mmr ? getLeagueFromMmr(player.mmr) : League.Bronze;

<LeagueBorder league={league} className={isLoading ? 'border-dashed' : ''}>
    <Avatar size={40} name={identityHash} variant="pixel" colors={...} />
</LeagueBorder>
```

## Database Schema Update

To fully support leagues, you'll need to add an MMR field to the Player table:

```csharp
[Table(Name = "player", Public = true)]
public partial struct Player
{
    [PrimaryKey]
    public Identity Id;
    public string Name;
    public int TotalGames;
    public int Wins;
    public int Level;
    public int Xp;
    public int Mmr;  // Add this field
}
```

## MMR Calculation

You'll need to implement MMR calculation logic in your game logic. Common approaches:

1. **Simple Win/Loss**: +25 MMR for win, -25 for loss
2. **Elo-style**: Adjust based on opponent MMR
3. **Performance-based**: Factor in WPM, accuracy, etc.

Example reducer:

```csharp
[Reducer]
public static void UpdatePlayerMmr(ReducerContext ctx, Identity playerId, int mmrChange)
{
    var player = ctx.Db.player.Id.Find(playerId);
    if (player != null)
    {
        var newMmr = Math.Max(0, player.Mmr + mmrChange);
        ctx.Db.player.Id.Update(new Player 
        { 
            Id = player.Id,
            Name = player.Name,
            TotalGames = player.TotalGames,
            Wins = player.Wins,
            Level = player.Level,
            Xp = player.Xp,
            Mmr = newMmr
        });
    }
}
```

## Testing

1. Navigate to `/league-borders-test` to see all borders
2. Test with different MMR values to verify correct league assignment
3. Verify border styling matches design in different contexts

## Customization

### Adjusting MMR Thresholds

Edit `frontend/src/types/league.ts`:

```typescript
export const getLeagueFromMmr = (mmr: number): League => {
    if (mmr < 1000) return League.Bronze;    // Adjust these
    if (mmr < 1500) return League.Silver;    // values as
    if (mmr < 2000) return League.Gold;      // needed
    if (mmr < 2500) return League.Platinum;
    if (mmr < 3000) return League.Diamond;
    return League.Master;
};
```

### Customizing Colors

Edit `frontend/src/components/LeagueBorder.tsx` or individual components in `LeagueBorders.tsx` to adjust border colors and glow effects.

## Notes

- All components follow the existing design system
- No additional dependencies required
- Compatible with existing Avatar usage patterns
- Fully responsive with optional size parameter
- Follows repository's no-comments policy
