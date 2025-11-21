# TypeRace.io - Next.js Lobby Page

This is a Next.js implementation of the TypeRace.io lobby page, demonstrating the conversion from a React/Vite application to Next.js App Router.

## What's Been Converted

- **Root Lobby Page**: The main landing page where users search for a game
- **TypeBox Component**: Interactive typing component with cursor tracking
- **ModeSelector**: Language/mode selection interface
- **MatchTypeSelector**: Public/Private/Practice game type selector
- **Header**: Application header with logo
- **Cursor**: Custom animated cursor component
- **Styling**: All CSS including Tailwind configuration and custom styles

## Project Structure

```
nextjs-app/
├── app/
│   ├── layout.tsx       # Root layout with metadata
│   ├── page.tsx         # Lobby page (root route)
│   └── globals.css      # Global styles
├── components/
│   ├── TypeBox.tsx
│   ├── ModeSelector.tsx
│   ├── MatchTypeSelector.tsx
│   ├── Header.tsx
│   ├── Cursor.tsx
│   └── SelectionButton.css
├── utils/
│   └── modes.ts         # Game mode utilities
└── lib/
    └── firebase.ts      # Firebase configuration
```

## Getting Started

### Install Dependencies

```bash
cd nextjs-app
npm install
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the lobby page.

### Build for Production

```bash
npm run build
npm start
```

## Features

✅ **Fully Functional UI**: All components work identically to the original React version
✅ **TypeScript**: Full type safety maintained
✅ **Tailwind CSS**: Using the latest Tailwind v4 with PostCSS
✅ **Next.js App Router**: Modern Next.js 16 with App Router
✅ **Client Components**: Interactive components using 'use client' directive
✅ **Responsive**: Fully responsive design maintained
✅ **Animations**: All custom animations and cursor effects working

## Notes

- This is a standalone Next.js application demonstrating the lobby page conversion
- SpacetimeDB integration would require generated bindings (not included)
- Firebase auth configuration is included but not fully integrated in this demo
- The page logs game start attempts to console for demonstration purposes

## Differences from React/Vite Version

1. **File Structure**: Uses Next.js App Router structure instead of React Router
2. **Client Components**: Interactive components marked with 'use client'
3. **Metadata**: Uses Next.js Metadata API instead of HTML head
4. **Routing**: Would use Next.js file-based routing for additional pages
5. **Build System**: Next.js/Turbopack instead of Vite

## Next Steps for Full Integration

To integrate with the full TypeRace.io application:

1. Generate SpacetimeDB bindings: `spacetime generate --lang typescript --out-dir nextjs-app/module_bindings --project-path spacetimedb`
2. Add SpacetimeDB provider setup (similar to original main.tsx)
3. Add Firebase AuthProvider
4. Create additional pages for game and profile routes
5. Integrate navigation between pages
