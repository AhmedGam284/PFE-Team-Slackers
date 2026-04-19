# PFE Compass Frontend

Vite + React + TypeScript frontend for the PFE Compass hackathon MVP.

## Run (dev)

```bash
npm install
npm run dev
```

Vite is configured to run on:

- http://localhost:8081

## Backend API base URL

The frontend fetch client uses `import.meta.env.VITE_API_BASE_URL`.

Default:

- `http://localhost:5000`

To override, create `pfe-navigator-main/.env`:

```bash
VITE_API_BASE_URL=http://localhost:5000
```

## API integration (current)

- Diagnosis: `POST /api/diagnosis/analyze`
- Dashboard summary (available): `GET /api/dashboard/summary`
- PFE:
  - Project ideas: `GET /api/pfe/projects`
  - Progress analysis: `POST /api/pfe/progress`

API helpers live in:

- `src/lib/apiClient.ts`
- `src/lib/apiContracts.ts`
- `src/lib/diagnosisApi.ts`
- `src/lib/pfeApi.ts`
- `src/lib/dashboardApi.ts`

## MVP persistence (localStorage)

This hackathon MVP uses `localStorage` for cross-page continuity (no Redux/Zustand):

- Diagnosis result: `pfe-compass-diagnosis`
- Latest PFE progress feedback: `pfe-compass-pfe-progress`

Helpers:

- `src/lib/storage.ts` (safe JSON parse + optional runtime validation)

## Build

```bash
npm run build
```

## Preview the production build

```bash
npm run preview
```

## Tests

```bash
npm run test
```
