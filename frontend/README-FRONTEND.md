# Frontend for TypeRace.io

This is a Next.js frontend for TypeRace.io, a multiplayer typing race game.

## Prerequisites

- Node.js 20+ and npm
- SpacetimeDB CLI (for generating module bindings)

## Setup

1. Install dependencies:
```bash
npm install
```

2. Generate SpacetimeDB module bindings:
```bash
# From the repository root:
spacetime generate --lang typescript --out-dir frontend/module_bindings --project-path spacetimedb
```

This will generate all the necessary TypeScript bindings from the SpacetimeDB module schema.

## Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Building for Production

```bash
npm run build
npm start
```

## Environment Variables

- `.env.development` - Development environment configuration
  - `NEXT_PUBLIC_SPACETIMEDB_URI=ws://localhost:3000`

- `.env.production` - Production environment configuration  
  - `NEXT_PUBLIC_SPACETIMEDB_URI=wss://maincloud.spacetimedb.com`

## Project Structure

- `app/` - Next.js App Router pages
  - `page.tsx` - Lobby page (home)
  - `game/[gameId]/page.tsx` - Game page
  - `profile/[playerId]/page.tsx` - Profile page
- `components/` - React components
- `lib/` - Utility functions and configurations
  - `firebase/` - Firebase authentication
  - `utils/` - Helper functions
  - `providers/` - Context providers
- `hooks/` - Custom React hooks
- `module_bindings/` - SpacetimeDB generated TypeScript bindings (must be generated)
- `public/` - Static assets

## Key Features

1. **Routing**: Uses Next.js App Router with file-based routing
   - `useRouter()` from `next/navigation` for programmatic navigation
   - `useParams()` from `next/navigation` for route parameters
   - File-based routing in `app/` directory

2. **Environment Variables**: Uses `NEXT_PUBLIC_` prefix for client-side env vars

3. **Import Paths**: Uses `@/` alias for imports from root

4. **Client Components**: All interactive components use `'use client'` directive

5. **Build System**: Uses Next.js with static export for deployment

## Features

- Real-time multiplayer typing races
- Firebase authentication (email/password, Google, GitHub)
- SpacetimeDB real-time database integration
- Player profiles with stats and performance history
- Public and private game modes
- Practice mode with bots
- Level progression system
- Customizable player colors
- Performance charts and analytics

## Notes

- The module_bindings directory must be populated by running the SpacetimeDB generate command before building
- All components that use React hooks or browser APIs are marked as Client Components with 'use client'
