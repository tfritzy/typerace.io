# Before & After Comparison

## Database Schema Change

### BEFORE: PlayerProgress Table
```csharp
[Table(Name = "playerprogress", Public = true)]
public partial struct PlayerProgress
{
    [PrimaryKey]
    public string Id;
    [SpacetimeDB.Index.BTree]
    public Identity PlayerId;          // Reference to Player table
    [SpacetimeDB.Index.BTree]
    public string GameId;
    public int ProgressIndex;
    public bool IsBot;
    public long CreatedAt;
    public List<CharacterEvent> CharacterHistory;
    public long Time;
    public int Placement;
    public string JoinCode;
}
```

### AFTER: PlayerProgress Table
```csharp
[Table(Name = "playerprogress", Public = true)]
public partial struct PlayerProgress
{
    [PrimaryKey]
    public string Id;
    [SpacetimeDB.Index.BTree]
    public Identity PlayerId;          // Still kept for data integrity
    [SpacetimeDB.Index.BTree]
    public string GameId;
    public string PlayerName;          // ✨ NEW: Denormalized from Player
    public int PlayerLevel;            // ✨ NEW: Denormalized from Player
    public int ProgressIndex;
    public bool IsBot;
    public long CreatedAt;
    public List<CharacterEvent> CharacterHistory;
    public long Time;
    public int Placement;
    public string JoinCode;
}
```

## Frontend Data Flow Change

### BEFORE: Two Subscriptions Required
```
GamePage Component
    │
    ├─► Subscribe to Game table ────────┐
    │                                    │
    ├─► Subscribe to PlayerProgress ────┤──► SpacetimeDB
    │                                    │
    └─► Subscribe to Player table ──────┘
           (entire table for just 3 players!)

For each player progress:
1. Get PlayerProgress record
2. Extract PlayerId
3. Look up Player in players array
4. Extract Name and Level
```

### AFTER: One Subscription Removed
```
GamePage Component
    │
    ├─► Subscribe to Game table ────────┐
    │                                    │──► SpacetimeDB
    └─► Subscribe to PlayerProgress ────┘

For each player progress:
1. Get PlayerProgress record
2. Use PlayerName and PlayerLevel directly ✨
```

## Code Changes

### GamePage.tsx - Before
```typescript
// Imports
import { type DbConnection, type Game, PlayerProgress, type Player } from "../../module_bindings";

// Subscriptions (3)
const gameSubscription = conn.subscriptionBuilder().subscribe(`select * from game where Id = '${gameId}'`);
const playerProgressSubscription = conn.subscriptionBuilder().subscribe(`select * from playerprogress where GameId = '${gameId}'`);
const playerSubscription = conn.subscriptionBuilder().subscribe(`select * from player`); // ⚠️ Entire table!

// Table hooks
const { rows: games } = useTable<DbConnection, Game>("game");
const { rows: playerProgress } = useTable<DbConnection, PlayerProgress>("playerprogress");
const { rows: players } = useTable<DbConnection, Player>("player");

// Helper functions
const getPlayerName = (playerId: any) => {
  if (!playerId || playerId.toHexString() === "0000...") {
    return "Bot";
  }
  const player = players.find(p => p.id.isEqual(playerId)); // ⚠️ Array search
  return player?.name || "Unknown";
};

const getPlayerLevel = (playerId: any) => {
  if (!playerId || playerId.toHexString() === "0000...") {
    return 1;
  }
  const player = players.find(p => p.id.isEqual(playerId)); // ⚠️ Array search
  return player?.level || 1;
};

// Usage
<PlayerProgressBar
  name={getPlayerName(pp.playerId)}      // ⚠️ Indirect lookup
  level={getPlayerLevel(pp.playerId)}    // ⚠️ Indirect lookup
  progress={pp.progressIndex}
  ...
/>
```

### GamePage.tsx - After
```typescript
// Imports
import { type DbConnection, type Game, PlayerProgress } from "../../module_bindings";
// ✨ No Player import needed!

// Subscriptions (2)
const gameSubscription = conn.subscriptionBuilder().subscribe(`select * from game where Id = '${gameId}'`);
const playerProgressSubscription = conn.subscriptionBuilder().subscribe(`select * from playerprogress where GameId = '${gameId}'`);
// ✨ No player subscription needed!

// Table hooks
const { rows: games } = useTable<DbConnection, Game>("game");
const { rows: playerProgress } = useTable<DbConnection, PlayerProgress>("playerprogress");
// ✨ No players hook needed!

// Helper functions (simplified)
const getPlayerName = (pp: PlayerProgress) => {
  return pp.playerName; // ✨ Direct access!
};

const getPlayerLevel = (pp: PlayerProgress) => {
  return pp.playerLevel; // ✨ Direct access!
};

// Usage
<PlayerProgressBar
  name={getPlayerName(pp)}      // ✨ Direct, no lookup
  level={getPlayerLevel(pp)}    // ✨ Direct, no lookup
  progress={pp.progressIndex}
  ...
/>
```

## Performance Impact

### Network Traffic Reduction
**Before:**
- Game table: ~200 bytes per game
- PlayerProgress table: ~500 bytes × 3 players = 1,500 bytes
- Player table: ~200 bytes × N total players = **could be MBs**
- **Total: 1,700+ bytes minimum, potentially much more**

**After:**
- Game table: ~200 bytes per game
- PlayerProgress table: ~560 bytes × 3 players = 1,680 bytes (slightly larger due to denormalized data)
- **Total: ~1,880 bytes** (fixed, regardless of player table size)

### Database Queries Reduction
**Before:**
- 1 query to get player progress
- 3 lookups in players array (O(n) each)

**After:**
- 1 query to get player progress
- 0 lookups (direct field access - O(1))

## Example Data

### PlayerProgress Record - Before
```json
{
  "id": "pp_abc123",
  "playerId": "0xc200...",
  "gameId": "game_xyz789",
  "progressIndex": 42,
  "isBot": false,
  ...
}
```
Need to look up: Player table → find by 0xc200... → get name & level

### PlayerProgress Record - After
```json
{
  "id": "pp_abc123",
  "playerId": "0xc200...",
  "gameId": "game_xyz789",
  "playerName": "CodingNinja",  // ✨ Already here!
  "playerLevel": 15,            // ✨ Already here!
  "progressIndex": 42,
  "isBot": false,
  ...
}
```
No lookup needed - data is right there!

## Real-World Scenario

**Imagine:**
- 10,000 registered players in the Player table
- 3 players in the current game

**Before:**
- Game page subscribes to ALL 10,000 player records
- Searches through 10,000 records to find the 3 needed
- Every player join/leave triggers full table sync

**After:**
- Game page subscribes to ONLY the 3 PlayerProgress records for this game
- Names and levels already included
- Player table changes don't affect game page at all

**Bandwidth saved:** ~2 MB per game page load!
**Lookup time saved:** O(10,000) → O(1) per player!
