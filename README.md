# typerace.io

A multiplayer typing race game built with SpacetimeDB and React.

## Development

### Prerequisites

- Node.js 20+
- SpacetimeDB CLI

### Setup

1. Install dependencies:
```bash
npm install
```

2. Generate TypeScript bindings from the SpacetimeDB module:
```bash
spacetime generate --lang typescript --out-dir src/module_bindings --project-path spacetimedb
```

3. Start the development server:
```bash
npm run dev
```

## Deployment

The frontend is automatically deployed to GitHub Pages when changes are pushed to the `main` branch.

The deployment workflow:
1. Installs dependencies
2. Installs SpacetimeDB CLI
3. Generates TypeScript bindings from the C# module
4. Builds the Vite application
5. Deploys to GitHub Pages

View the live site at: https://tfritzy.github.io/typerace.io/

## Environment Variables

- `VITE_SPACETIMEDB_HOST` - SpacetimeDB server URL (default: `ws://localhost:3000`)
- `VITE_SPACETIMEDB_DB_NAME` - Database name (default: `my-db`)

## Project Structure

- `/src` - React frontend source code
- `/spacetimedb` - SpacetimeDB C# module
- `/.github/workflows` - GitHub Actions workflows
