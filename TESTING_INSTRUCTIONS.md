# Testing Instructions for Private Game Start Feature

## Prerequisites

1. SpacetimeDB CLI installed
2. SpacetimeDB server running locally or access to a remote instance

## Setup Steps

### 1. Generate Module Bindings

```bash
cd /path/to/typerace.io
spacetime generate --lang typescript --out-dir frontend/module_bindings --project-path spacetimedb
```

### 2. Build and Publish Module (if testing locally)

```bash
# Start SpacetimeDB server
spacetime start

# Publish the module
spacetime publish --project-path spacetimedb typerace
```

### 3. Install and Build Frontend

```bash
cd frontend
npm install
npm run dev
```

## Testing the Private Game Start Feature

### Test Case 1: Private Game Start

1. Open the application in a browser (http://localhost:5173 or your dev server URL)
2. Select "Private Lobby" in the Match Type selector at the bottom
3. Type "asdf" in the lobby to join a private game
4. You should be redirected to a game page showing:
   - Player progress bar at the top
   - TypeBox with the phrase "start game" (not the actual game phrase)
   - A box below the TypeBox showing the shareable game link
5. Type "start game" in the TypeBox
6. The game should transition to countdown state (3-2-1)
7. After countdown, the game should show the actual race phrase

### Test Case 2: Link Copying

1. Follow steps 1-4 from Test Case 1 to get to the private game lobby
2. Click anywhere on the link box (the one showing "Share this link with friends")
3. Verify that:
   - The clipboard icon (📋) changes to a checkmark (✓)
   - A green "Link copied to clipboard!" message appears
   - The message disappears after 2 seconds
4. Open a new browser tab and paste the URL (Ctrl+V or Cmd+V)
5. Verify that the new tab loads the same game

### Test Case 3: Practice Mode

1. Select "Practice Mode" in the Match Type selector
2. Type "asdf" to join a practice game
3. Verify that the same "start game" prompt appears
4. Complete typing "start game"
5. Verify the game starts correctly

### Test Case 4: Public Game (Should Not Show Start Prompt)

1. Select "Public Match" in the Match Type selector
2. Type "asdf" to join a public game
3. Verify that:
   - The TypeBox does NOT show "start game"
   - The actual game phrase is shown (or waiting for players message)
   - No shareable link box appears
   - The game starts automatically when enough players join or after the bot fill timeout

## Expected Behavior Summary

### Private/Practice Games in Lobby State
- TypeBox phrase: "start game"
- Shareable link box visible below TypeBox
- Link can be copied by clicking the box
- Game starts when "start game" is typed completely

### Public Games
- Normal behavior (no changes)
- No "start game" prompt
- No shareable link box
- Auto-starts when ready

### After Game Starts
- TypeBox shows the actual race phrase
- Shareable link box disappears
- Normal racing behavior

## Known Issues / Notes

- The link box uses the `chat-box` CSS class for consistent styling
- The copy functionality uses the browser's Clipboard API
- The reducer `startPrivateGame` is called with the gameId parameter
- The feature only activates when: `(gameType === "Private" || gameType === "Practice") && gameState === "Lobby"`
