# Bindings Generation Required

The TypeScript bindings need to be regenerated to include the new `PlayerColor` enum and the `Color` field on the `Player` table.

## Steps to regenerate bindings:

1. Ensure SpacetimeDB CLI is installed
2. Run the following command from the project root:
   ```bash
   spacetime generate --lang typescript --out-dir frontend/module_bindings --project-path spacetimedb
   ```

## What changed:

- Added `PlayerColor` enum with 10 color options (Amber, Blue, Green, Purple, Red, Pink, Cyan, Orange, Lime, Indigo)
- Added `Color` field of type `PlayerColor` to the `Player` table
- Added `SetPlayerColor` reducer to allow players to change their color

## Expected changes in bindings:

The generated `Player` type should now include a `color` field, and there should be a new `PlayerColor` enum type exported.
The `SetPlayerColor` reducer should be available as a callable function.
