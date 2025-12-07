# typerace.io

deployed at https://typerace.io

A multiplayer typing race game built with a spacetimedb backend

## Development

### Prerequisites

- SpacetimeDB CLI

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
spacetime generate --lang typescript --out-dir src/module_bindings --project-path spacetimedb
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
