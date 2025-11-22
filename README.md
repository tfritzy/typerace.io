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

The frontend uses Next.js with `output: 'export'` for static generation. The home page is server-side rendered at build time for SEO, while dynamic routes (`/game/*`, `/profile/*`) are handled client-side.

### Firebase Hosting (Recommended, No Functions Needed)

The current configuration works with Firebase Hosting alone:

```bash
cd frontend
npm run build
firebase deploy --only hosting
```

The Firebase rewrite rule serves `index.html` for all routes, and Next.js handles client-side routing. This provides:
- ✅ Good SEO for the home page (pre-rendered HTML with metadata)
- ✅ Fast initial load
- ✅ No serverless functions needed
- ✅ All dynamic routing handled client-side
- ✅ Works with CDN caching

### Alternative Deployment Options

- **Netlify/Cloudflare Pages**: Also support static exports with client-side routing
- **GitHub Pages**: Use the included workflow for automated deployments
- **Vercel**: Simplified deployment with automatic configuration

No Node.js server or Firebase Functions are required for deployment.
