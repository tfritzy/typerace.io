# typerace.io

A React + SpacetimeDB typing race application.

## GitHub Pages Deployment

This app is configured to be deployed to GitHub Pages automatically. To enable GitHub Pages for this repository:

1. Go to your repository settings on GitHub
2. Navigate to **Settings** → **Pages**
3. Under **Source**, select **GitHub Actions**
4. Add your SpacetimeDB token as a repository secret:
   - Go to **Settings** → **Secrets and variables** → **Actions**
   - Click **New repository secret**
   - Name: `SPACETIME_TOKEN`
   - Value: Your SpacetimeDB authentication token
5. Push to the `main` branch or manually trigger the workflow

The workflow will:
- Deploy the SpacetimeDB backend to SpacetimeDB cloud
- Generate TypeScript client bindings
- Build and deploy the frontend to GitHub Pages

Once deployed, the app will be available at: `https://tfritzy.github.io/typerace.io/`

### Manual Deployment

You can also manually trigger the deployment workflow from the **Actions** tab in your GitHub repository.

## Development

### Install Dependencies
```bash
npm install
```

### Run Development Server
```bash
npm run dev
```

Note: You'll need to deploy the SpacetimeDB module first:
```bash
npm run local  # For local development
# or
npm run deploy # For production deployment
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
