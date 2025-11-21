# Next.js Frontend Migration

This repository now contains a complete Next.js migration of the TypeRace.io frontend.

## Location

The new Next.js frontend is located in: `nextjs-frontend/`

## Quick Start

```bash
cd nextjs-frontend
npm install
npm run generate-bindings  # Requires SpacetimeDB CLI
npm run dev
```

## Documentation

- **[README-FRONTEND.md](nextjs-frontend/README-FRONTEND.md)** - Setup guide and project overview
- **[MIGRATION-GUIDE.md](nextjs-frontend/MIGRATION-GUIDE.md)** - Detailed migration documentation

## What Was Migrated

✅ **Complete Frontend Migration**
- 3 pages (Lobby, Game, Profile)
- 25+ React components
- All hooks and utilities
- Firebase authentication
- SpacetimeDB integration
- Tailwind CSS styling
- All assets and favicons

## Key Changes

| Feature | Original (Vite) | New (Next.js) |
|---------|----------------|---------------|
| Framework | Vite + React | Next.js 16 |
| Routing | React Router | App Router |
| Navigation | useNavigate() | useRouter() |
| Env Variables | VITE_* | NEXT_PUBLIC_* |
| Build Tool | Vite | Next.js/Turbopack |

## Features Preserved

✅ 100% feature parity with original frontend
- Real-time multiplayer typing races
- Firebase authentication (email, Google, GitHub)
- SpacetimeDB real-time sync
- Player profiles and statistics
- Public/private/practice game modes
- Level progression and XP system
- Customizable player colors
- Performance analytics and charts

## Important Note

The module bindings must be generated before building:

```bash
cd nextjs-frontend
npm run generate-bindings
```

This requires the SpacetimeDB CLI to be installed on your system.

## Original Frontend

The original Vite-based frontend remains in: `frontend/`

Both frontends are functionally identical and can coexist in the repository.
