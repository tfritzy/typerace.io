# typerace.io

A React + SpacetimeDB typing race application.

## GitHub Pages Deployment

This app is configured to be deployed to GitHub Pages automatically. To enable GitHub Pages for this repository:

1. Go to your repository settings on GitHub
2. Navigate to **Settings** → **Pages**
3. Under **Source**, select **GitHub Actions**
4. Push to the `main` branch or manually trigger the workflow

Once deployed, the app will be available at: `https://tfritzy.github.io/typerace.io/`

### Manual Deployment

You can also manually trigger the deployment workflow from the **Actions** tab in your GitHub repository.

## Development

### Prerequisites

To work with SpacetimeDB locally, you need to install the SpacetimeDB CLI:
```bash
curl -fsSL https://install.spacetimedb.com | bash
```

### Generate Client Bindings

The `src/module_bindings` directory contains TypeScript client bindings generated from the SpacetimeDB schema. To regenerate these bindings after modifying the schema in `spacetimedb/src/index.ts`:

```bash
# For local development (requires local SpacetimeDB server)
npm run local

# OR for production deployment
npm run deploy
```

**Note:** The current bindings are stubs to allow the app to build. For full functionality, generate proper bindings using the commands above with SpacetimeDB CLI installed.

### Install Dependencies
```bash
npm install
```

### Run Development Server
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## Configuration

The app connects to a SpacetimeDB instance. You can configure the connection using environment variables:

- `VITE_SPACETIMEDB_HOST` - The SpacetimeDB server host (default: `ws://localhost:3000`)
- `VITE_SPACETIMEDB_DB_NAME` - The database name (default: `my-db`)

Create a `.env.local` file in the root directory to set these variables for local development.
