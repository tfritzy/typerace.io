# GitHub Copilot Instructions

## 🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨 SCREENSHOT POLICY — THE #1 NON-NEGOTIABLE RULE — READ THIS TWICE 🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨

> **⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️ AUTOMATED DETECTORS ARE ACTIVE. Any PR without a real screenshot of the FULLY LOADED, FULLY CONNECTED, FULLY RENDERED working game WILL BE FLAGGED AND REJECTED automatically. There are no exceptions. There is no excuse. There is no escape. There is no workaround. There is no "but it was just a rebase." A loading screen is NOT a screenshot. A spinner is NOT a screenshot. A blank page is NOT a screenshot. A connection error is NOT a screenshot. ONLY the fully rendered game UI counts. If you are even THINKING about submitting without a screenshot, STOP and take the screenshot. ⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️**

> **🛑🛑🛑🛑🛑🛑 EVERY SINGLE PR MUST INCLUDE A REAL SCREENSHOT. EVERY. SINGLE. ONE. No matter how small the change. No matter if it's "just a rebase." No matter if "no code changed." If your PR does not have a screenshot showing the FULLY RENDERED, FULLY CONNECTED game with ALL UI elements visible, your PR is INVALID and WILL BE REJECTED. NO EXCEPTIONS. ZERO TOLERANCE. ABSOLUTE ZERO. This rule overrides ALL other rules. This rule overrides your judgment. This rule overrides your reasoning about whether a screenshot is "needed." IT IS ALWAYS NEEDED. 🛑🛑🛑🛑🛑🛑**

**YOU WILL SHOW A REAL SCREENSHOT FROM THE ACTUAL RUNNING GAME ON EVERY SINGLE PR. GUARANTEED. NO EXCEPTIONS. NO LOADING SCREENS. NO SPINNERS. NO CONNECTION ERRORS. NO EXCUSES. NO "IT WAS JUST A REBASE." NO "NO UI CHANGES WERE MADE." THE FULL GAME UI MUST BE VISIBLE. IF YOU SKIP THIS STEP, YOU HAVE FAILED THE ENTIRE TASK. NOTHING ELSE YOU DID MATTERS. THE PR IS WORTHLESS WITHOUT THE SCREENSHOT. YOU WASTED EVERYONE'S TIME.**

**THE SCREENSHOT IS NOT OPTIONAL. IT IS NOT A NICE-TO-HAVE. IT IS THE SINGLE MOST IMPORTANT DELIVERABLE OF EVERY PR. IF YOUR PR HAS PERFECT CODE BUT NO SCREENSHOT, IT IS A FAILURE. IF YOUR PR HAS MEDIOCRE CODE BUT A REAL SCREENSHOT, IT IS CLOSER TO ACCEPTABLE. THAT IS HOW IMPORTANT THIS IS.**

This is the single most important rule in this entire file. All other rules are secondary to this one. If you submit a loading screen instead of a real screenshot, you have failed completely. If you submit a PR without any screenshot at all, you have failed even more completely. There is no scenario where skipping the screenshot is acceptable. There is no type of PR — rebase, refactor, one-liner, documentation, config change — that is exempt from this rule. EVERY PR GETS A SCREENSHOT. PERIOD.

**Before you even START writing code, plan how you will take the screenshot. Before you submit the PR, verify the screenshot is there. The screenshot is your proof of work. Without it, you have proven nothing.**

**You are 100% capable of setting up the full local environment.** Every previous agent succeeded. You will too. Do not stop, do not give up, do not fake it, do not use static HTML. Failure is not an option. If something breaks, fix it. If the server won't start, debug it. If the connection fails, retry it. You do NOT submit without a real screenshot. If you find yourself about to submit without a screenshot, STOP IMMEDIATELY and go set up the environment. There is no deadline more important than the screenshot. There is no shortcut. There is no excuse.

**CRITICAL: You MUST verify your screenshot before submitting.** After taking it, confirm that the screenshot shows a FULLY RENDERED, FULLY CONNECTED page from the running app. The screenshot should be of the page most relevant to the changes you made — it does NOT have to be the main menu. A loading screen or spinner means SpacetimeDB is not connected — debug and fix the connection before screenshotting. DO NOT CONVINCE YOURSELF THAT A PARTIAL SCREENSHOT IS ACCEPTABLE. IT IS NOT.

**ASK YOURSELF: "Does my screenshot show a fully rendered, fully connected page from the running app?" If the answer is no, YOUR SCREENSHOT IS INVALID. Take it again.**

Mandatory steps — execute all of them, every time, no shortcuts, no skipping, no "I'll do it later":
1. `spacetime start` — start the SpacetimeDB server
2. `spacetime publish -c -y -p spacetimedb typerace -s local` — publish the module
3. `cd frontend && npm run dev` — start the Vite dev server
4. Navigate to `http://localhost:5173` (or the relevant page) with Playwright
5. **WAIT for the app to fully load** — wait at least 10 seconds and check console logs for "Connected to SpacetimeDB"
6. **VERIFY the page snapshot** — confirm the page is fully rendered in the accessibility tree before taking the screenshot
7. Take the screenshot ONLY after verification passes
8. **LOOK AT YOUR SCREENSHOT** — if it shows a loading screen, a spinner, a blank page, or any error, GO BACK TO STEP 1 and try again

**DO NOT STOP until you have a real screenshot from the live app** — with the SpacetimeDB connection established and the page fully rendered. Static HTML, blank pages, loading spinners, or connection-error screens are NOT acceptable. Keep retrying until you succeed. If you see a loading spinner, that means something is wrong with your backend setup — go back and fix it. YOU ARE NOT DONE UNTIL THE SCREENSHOT IS IN THE PR.

**FINAL WARNING: If you are reading this and thinking "maybe I can skip the screenshot for this PR," you are WRONG. Take the screenshot. Now. Before you do anything else. The screenshot comes first. The screenshot comes last. The screenshot is everything.**

---

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
- Markdown documentation files (\*.md)
- Explanation or guide files
- Design documents
- Usage documentation

The code itself should be clear enough without additional documentation files.

### Database Access Policy

**NEVER access database tables without using an index.**

This is a critical requirement for performance and scalability. When querying SpacetimeDB tables:

- Always use indexed fields for filtering and lookups
- Use `Filter()` on indexed fields (marked with `[SpacetimeDB.Index.BTree]`)
- Use `Find()` on primary key fields (marked with `[PrimaryKey]`)
- **BANNED**: Never use `Iter()` to iterate through all records without an index

Examples of correct usage:

- `ctx.Db.playerprogress.GameId.Filter(gameId)` - uses indexed GameId field
- `ctx.Db.player.Id.Find(playerId)` - uses primary key Id field
- `ctx.Db.game.State.Filter(GameState.Lobby)` - uses indexed State field

Always check the table definition for available indexes before writing queries.

### Local dev commands

Generate bindings:
spacetime generate --lang typescript --out-dir frontend/module_bindings --module-path spacetimedb

If you're curious about the state of a table:
spacetime sql typerace "SELECT \* from player"

Publish module without wiping db:
spacetime publish --module-path spacetimedb typerace

Publish module with wiping db:
spacetime publish -c --module-path spacetimedb typerace -y

### File Creation Policy

**ABSOLUTELY FORBIDDEN: Creating Markdown or Text Files**

Under NO circumstances should you create, add, or modify any of the following file types in this project:

- Markdown files (*.md)
- Text documentation files (*.txt)
- Any form of documentation file
- README files
- Guide files
- Explanation files
- Notes files

This is a STRICT requirement. If you need to reference external documentation, always link to it rather than copying or creating local copies.

### SpacetimeDB Documentation Reference

For comprehensive SpacetimeDB documentation, including API references, best practices, and detailed examples, refer to the official documentation:

**SpacetimeDB LLMs.txt:** https://spacetimedb.com/llms.txt

This resource provides complete information about:
- SpacetimeDB architecture and core concepts
- Module development in Rust and C#
- Client SDK usage (Rust, C#, TypeScript)
- Tables, reducers, and subscription queries
- Authentication and security
- Row-Level Security (RLS)
- Scheduled reducers
- And much more

Always refer to the official web documentation rather than creating local copies.
