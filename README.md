# typerace.io

A multiplayer typing race game built with a spacetimedb backend

## Development

### Prerequisites

- SpacetimeDB CLI
- Node.js 20+

### Setup

1. Start spacetime server
```bash
spacetime start
```

2. Publish spacetime module
```bash
spacetime publish --project-path spacetimedb typerace
```

3. Generate TypeScript bindings from the SpacetimeDB module:
```bash
spacetime generate --lang typescript --out-dir frontend/module_bindings --project-path spacetimedb
```

4. Install dependencies:
```bash
cd frontend
npm install
```

5. Start the development server:
```bash
cd frontend
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## Deployment

The frontend is built with Next.js and includes server-rendered dynamic routes for games and player profiles. For production deployment, consider:

- **Vercel** (recommended for Next.js): Zero-configuration deployment with automatic SSR support
- **Firebase Hosting + Functions**: Requires Firebase Functions setup for server-side rendering
- **Custom Node.js hosting**: Use `npm run build && npm run start` to run the Next.js server

For static-only hosting, the Next.js configuration would need to be modified to use `output: 'export'` with pre-generated static params, which may not be suitable for this real-time multiplayer application with dynamic game IDs.
