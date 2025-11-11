# ID Generation System

This document describes the Stripe-style ID generation system implemented in the SpacetimeDB backend.

## Overview

The ID generator creates unique, time-ordered string identifiers with prefixes that indicate the type of entity. This is similar to how Stripe generates IDs (e.g., `cus_xxx`, `ch_xxx`, `pi_xxx`).

## Format

IDs follow this format:

```
{prefix}{timestamp_base62}{random_base62}
```

- **Prefix**: Indicates the entity type (e.g., `game_`, `person_`, `pp_`)
- **Timestamp**: Unix timestamp in milliseconds, encoded in base62
- **Random**: Cryptographically secure random bytes, encoded in base62

## Base62 Encoding

Base62 uses characters: `0-9`, `A-Z`, `a-z` (62 total characters)

This provides:
- Compact representation
- URL-safe identifiers
- Human-readable (no special characters)
- Case-sensitive uniqueness

## Entity Prefixes

| Entity | Prefix | Example ID |
|--------|--------|------------|
| Game | `game_` | `game_1AbCdEfGhIjK2LmNoPqRsTuVwX` |
| Person | `person_` | `person_3YzAbCdEfGhI4JkLmNoPqRsT` |
| Player Progress | `pp_` | `pp_5UvWxYzAbCdEf6GhIjKlMnOpQ` |

## Properties

### Time-ordered
IDs generated later will sort after IDs generated earlier due to the timestamp component.

### Uniqueness
The combination of millisecond-precision timestamp and cryptographically secure random bytes ensures uniqueness across distributed systems.

### Security
Uses `System.Security.Cryptography.RandomNumberGenerator` for generating the random component, which is suitable for security-sensitive operations.

## Usage

In reducers and database operations:

```csharp
var newGame = ctx.Db.game.Insert(new Game
{
    Id = IdGenerator.Generate("game_"),
    Phrase = "...",
    CreatedAt = createdAtMs,
    State = GameState.Lobby,
    GameMode = gameMode
});
```

## Migration Notes

This system replaces the previous auto-incrementing `ulong` IDs with string-based IDs:

- **Before**: `ulong Id` with `[AutoInc]` attribute
- **After**: `string Id` with custom generation

Tables updated:
- `Game`: `ulong Id` → `string Id`
- `Person`: `ulong Id` → `string Id`
- `PlayerProgress`: `ulong Id` → `string Id`
- All `GameId` foreign key references also updated to `string`
