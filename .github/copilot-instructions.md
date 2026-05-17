# GitHub Copilot Instructions

## Screenshot Guidance

Screenshots are never required for work in this repository, so do not spend time launching the app or taking them unless a user explicitly asks for one. If you are preparing a PR or status update, write a brief text summary instead of including screenshots.

---

## 🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨 TYPESCRIPT BUILD POLICY — THE #2 NON-NEGOTIABLE RULE — READ THIS TWICE 🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨

> **⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️ AUTOMATED DETECTORS ARE ACTIVE. Any PR with a failing TypeScript build WILL BE FLAGGED AND REJECTED automatically. There are no exceptions. There is no excuse. There is no escape. There is no workaround. There is no "but that error was already there." There is no "but I didn't touch that file." There is no "but it's just a type warning." A failing `tsc -b` is a failing PR. If you are even THINKING about submitting without a passing TypeScript build, STOP and fix it. ⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️**

> **🛑🛑🛑🛑🛑🛑 EVERY SINGLE ITERATION MUST HAVE A PASSING TYPESCRIPT BUILD. EVERY. SINGLE. ONE. After every code change. After every file edit. After every refactor. You run `tsc -b` and it MUST pass with ZERO errors. If it does not pass, you DO NOT move on. You DO NOT submit. You DO NOT commit. You FIX IT FIRST. NO EXCEPTIONS. ZERO TOLERANCE. ABSOLUTE ZERO. This rule overrides your judgment. This rule overrides your reasoning about whether a build error is "relevant" or "pre-existing." ALL BUILD ERRORS ARE YOUR PROBLEM. 🛑🛑🛑🛑🛑🛑**

**YOU WILL GET A PASSING TYPESCRIPT BUILD AFTER EVERY SINGLE CODE CHANGE. GUARANTEED. NO EXCEPTIONS. NO "THAT ERROR WAS ALREADY THERE." NO "I DIDN'T INTRODUCE THAT." NO "IT'S UNRELATED TO MY CHANGES." NO "IT'S JUST A TYPE ERROR." IF `tsc -b` FAILS, YOUR CODE IS BROKEN. IF YOUR CODE IS BROKEN, YOUR PR IS WORTHLESS. IF YOUR PR IS WORTHLESS, YOU WASTED EVERYONE'S TIME. FIX THE BUILD. NOW.**

**THE TYPESCRIPT BUILD IS NOT OPTIONAL. IT IS NOT A NICE-TO-HAVE. IT IS A HARD GATE ON EVERY SINGLE ITERATION. IF YOUR PR HAS PERFECT LOGIC BUT A FAILING BUILD, IT IS A FAILURE. IF YOUR PR HAS A CLEAN BUILD, IT IS CLOSER TO ACCEPTABLE. THAT IS HOW IMPORTANT THIS IS.**

This is the most important implementation rule in this entire file. If you submit a PR with TypeScript build errors, you have failed. There is no scenario where a failing build is acceptable. There is no type of PR — rebase, refactor, one-liner, config change — that is exempt from this rule. EVERY PR GETS A PASSING BUILD. PERIOD.

**"But the error was already there before my changes."** — DO NOT CARE. Fix it. If `tsc -b` fails, it is your responsibility. You do not get to inherit broken builds and pass them along. You leave the codebase BETTER than you found it. Every error you see is an error you fix.

**"But I only changed one file."** — DO NOT CARE. The build is the build. It either passes or it doesn't. Run `tsc -b` from the `frontend` directory and it must exit with zero errors. No partial credit.

**"But fixing that error is outside the scope of my task."** — DO NOT CARE. A broken build is always in scope. Always. If the build fails, your task is not done. Your task is NEVER done until the build passes.

**"But I can just use `any` or `unknown` to make it compile."** — ABSOLUTELY NOT. Silencing the compiler is NOT fixing the build. You are BANNED from using hacky workarounds to get TypeScript passing. The fix must be elegant, correct, and consistent with the original author's intent. The following are ALL BANNED:
- `any` type — NEVER use it. Find the correct type and use it.
- `unknown` type as a lazy escape hatch — if you don't know the type, FIGURE IT OUT. Read the code. Trace the data flow. Use the correct type.
- `@ts-ignore` — NEVER. This hides errors instead of fixing them.
- `@ts-expect-error` — NEVER. Same problem as `@ts-ignore`.
- `as any` type assertions — NEVER. This is just `any` with extra steps.
- `as unknown as SomeType` double casting — NEVER. If you need to double-cast, your types are wrong. Fix the types.
- Overly broad type unions or generics that defeat the purpose of type safety
- Deleting or weakening existing type definitions to make errors go away

**The fix must match the original author's intent.** Read the surrounding code. Understand what the types SHOULD be. Use proper interfaces, proper generics, proper narrowing. If a function returns `string | null`, handle the `null` case — don't cast it to `string`. If a variable is typed as `Foo`, don't change it to `any` because you got a type error. Fix the ACTUAL problem. Write the code the way the original author would have written it.

**Before you even START writing code, run `cd frontend && npx tsc -b` to see the current state.** After EVERY code change, run it again. After your LAST code change, run it one final time. The build must pass at every step. If it doesn't, you stop what you're doing and fix it before continuing.

Mandatory steps — execute all of them, after every iteration, no shortcuts, no skipping:
1. `cd frontend && npx tsc -b` — run the TypeScript build
2. **READ THE OUTPUT** — if there are ANY errors, you are not done
3. **FIX EVERY ERROR** — no matter where it came from, no matter who introduced it
4. **RUN THE BUILD AGAIN** — confirm zero errors
5. **ONLY THEN** move on to your next change or submit your PR

**DO NOT STOP until `tsc -b` exits with zero errors.** Do not convince yourself that errors are "acceptable" or "pre-existing" or "not your problem." They are your problem. They are always your problem. Fix them. Every single one. Every single time.

**ASK YOURSELF: "Does `tsc -b` pass with zero errors?" If the answer is no, YOU ARE NOT DONE. Fix the errors and run it again.**

**FINAL WARNING: If you are reading this and thinking "maybe I can skip the build check for this PR," you are WRONG. Run the build. Now. Before you do anything else. Fix any errors. The build must pass. ALWAYS.**

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

Generate bindings with a compatible `spacetime` CLI version:
Use the frontend lockfile's resolved SpacetimeDB version as the compatibility target first. Right now `frontend/package-lock.json` resolves the frontend package to `spacetimedb@1.12.0`, so use a compatible `spacetime` CLI (1.12.x) when regenerating the checked-in frontend bindings.

spacetime generate --lang typescript --out-dir frontend/module_bindings --project-path spacetimedb

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
