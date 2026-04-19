# Frontend (UI)

This repo’s React/Tailwind UI lives in `pfe-navigator-main/` (Vite + React + TypeScript).

The `front/` folder currently only contains `node_modules/` and does not appear to include the frontend source code.

## Run the frontend (dev)

From the repo root:

```bash
cd pfe-navigator-main
npm install
npm run dev
```

Vite is configured to run on:

- http://localhost:8081

## Build

```bash
cd pfe-navigator-main
npm run build
```

## Preview the production build

```bash
cd pfe-navigator-main
npm run preview
```

## Tests

```bash
cd pfe-navigator-main
npm run test
```

## Useful paths

- Frontend app: `pfe-navigator-main/src/`
- Vite config (port, server): `pfe-navigator-main/vite.config.ts`
