# GitHub Copilot Instructions

## Code Style Guidelines

### Comments Policy

**NEVER add comments to the code under ANY circumstances.**

This is a strict requirement for this codebase. Code should be self-documenting through:
- Clear and descriptive variable names
- Well-named functions and methods
- Proper code structure and organization
- Meaningful type definitions

Do not add:
- Inline comments
- Block comments
- Documentation comments
- TODO comments
- Explanatory comments
- Any other form of code comments

The only exception is for legally required copyright notices or license headers if absolutely necessary.

### Documentation Policy

**DO NOT create documentation files** such as README files, markdown documentation, or explanation files to describe code changes.

Do not create:
- README files explaining features
- Markdown documentation files (*.md)
- Explanation or guide files
- Design documents
- Usage documentation

The code itself should be clear enough without additional documentation files.

### Database Access Policy

**NEVER access data without using an index.**

This is a critical performance requirement for this codebase:
- Always use indexed fields when querying database tables
- Use `.Filter()` on indexed fields instead of `.Iter()`
- **You are BANNED from using `.Iter()` method** - it scans all rows without using indexes
- Ensure all table queries utilize the `[SpacetimeDB.Index.BTree]` or `[PrimaryKey]` attributes
- When filtering by multiple fields, filter by one indexed field first, then check other conditions in the loop

Example of correct usage:
```csharp
foreach (var progress in ctx.Db.player_progress.PlayerId.Filter(playerId))
{
    if (progress.GameId == gameId)
    {
        return progress;
    }
}
```

Example of BANNED usage:
```csharp
foreach (var progress in ctx.Db.player_progress.Iter())
{
}
```

