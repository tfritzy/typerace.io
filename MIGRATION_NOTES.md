# Migration Notes: PlayerProgress Schema Change

## Summary
Added `PlayerName` and `PlayerLevel` fields to the `PlayerProgress` table to eliminate the need to subscribe to the `player` table in the game page.

## Backend Changes (Completed ✅)
- Added `PlayerName` (string) and `PlayerLevel` (int) fields to `PlayerProgress` struct in `Module.cs`
- Updated `InsertPlayerProgress()` to populate these fields from the Player table
- Updated `FillGameWithBots()` to generate random bot names and set level to 1
- Module compiles successfully

## Required Next Steps

### 1. Regenerate TypeScript Bindings
Before deploying or testing, you must regenerate the TypeScript bindings:

```bash
spacetime generate --lang typescript --out-dir frontend/module_bindings --project-path spacetimedb
```

This will update the `PlayerProgress` type in the TypeScript bindings to include the new `playerName` and `playerLevel` fields.

### 2. Update Frontend Code (After bindings are generated)

#### GamePage.tsx Changes Required:

1. **Remove Player type import** (line 4):
```typescript
// BEFORE:
import { type DbConnection, type Game, PlayerProgress, type Player } from "../../module_bindings";

// AFTER:
import { type DbConnection, type Game, PlayerProgress } from "../../module_bindings";
```

2. **Remove player subscription** (lines 34-38, 43):
```typescript
// DELETE THESE LINES:
const playerSubscription = conn.subscriptionBuilder()
  .onError((error: ErrorContextInterface) => {
    console.error("Error subscribing to player:", error);
  })
  .subscribe(`select * from player`);

// And in the cleanup:
playerSubscription.unsubscribe();
```

3. **Remove player table usage** (line 49):
```typescript
// DELETE THIS LINE:
const { rows: players } = useTable<DbConnection, Player>("player");
```

4. **Simplify getPlayerName function** (lines 54-60):
```typescript
// BEFORE:
const getPlayerName = (playerId: any) => {
  if (!playerId || playerId.toHexString() === "0000000000000000000000000000000000000000000000000000000000000000") {
    return "Bot";
  }
  const player = players.find(p => p.id.isEqual(playerId));
  return player?.name || "Unknown";
};

// AFTER:
const getPlayerName = (pp: PlayerProgress) => {
  return pp.playerName;
};
```

5. **Simplify getPlayerLevel function** (lines 62-68):
```typescript
// BEFORE:
const getPlayerLevel = (playerId: any) => {
  if (!playerId || playerId.toHexString() === "0000000000000000000000000000000000000000000000000000000000000000") {
    return 1;
  }
  const player = players.find(p => p.id.isEqual(playerId));
  return player?.level || 1;
};

// AFTER:
const getPlayerLevel = (pp: PlayerProgress) => {
  return pp.playerLevel;
};
```

6. **Update PlayerProgressBar usage** (lines 128-129):
```typescript
// BEFORE:
name={getPlayerName(pp.playerId)}
level={getPlayerLevel(pp.playerId)}

// AFTER:
name={getPlayerName(pp)}
level={getPlayerLevel(pp)}
```

### 3. Database Migration

**⚠️ IMPORTANT**: This schema change requires clearing existing data or migrating it.

When publishing the updated module, use the `-c` flag to clear data:
```bash
spacetime publish -c --project-path spacetimedb typerace -y
```

This will:
- Clear all existing game data
- Apply the new schema with `PlayerName` and `PlayerLevel` fields
- Start fresh with the new structure

**Note**: If you need to preserve data, you would need to:
1. Export existing data
2. Publish new schema with `-c`
3. Manually migrate/re-import data with the new fields

## Benefits
- ✅ **Reduced subscriptions**: No need to subscribe to entire player table in game view
- ✅ **Better performance**: Fewer data transfers and database lookups
- ✅ **Simpler code**: Direct access to player info from progress data
- ✅ **Improved scalability**: Player table can grow large, but we only load progress for current game
- ✅ **Data locality**: All game-related player info is in one place

## Testing Checklist
After making frontend changes:
- [ ] Player names display correctly for real players
- [ ] Player levels display correctly for real players
- [ ] Bot names display correctly (should be random animal names)
- [ ] Bot levels display correctly (should be 1)
- [ ] Game loads without subscribing to player table
- [ ] No console errors related to missing player data
- [ ] Progressive bar shows correct player info during race
- [ ] Results screen works correctly

## Rollback Plan
If issues occur, you can rollback by:
1. Reverting the Module.cs changes
2. Reverting the frontend changes
3. Republishing with `spacetime publish -c`
