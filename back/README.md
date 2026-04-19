# PFE Compass Backend (Hackathon MVP)

Node.js + Express + TypeScript backend for the PFE Compass frontend.

## Features

- Express + TypeScript
- `dotenv` environment variables
- CORS allowlist (defaults to `http://localhost:8080` and `http://localhost:8081`)
- JSON body parsing
- Request logging (morgan)
- Centralized error handling
- Zod request validation
- OpenAI integration (optional) with graceful fallbacks

## Setup

```bash
cd back
npm install
cp .env.example .env
```

### Environment variables

- `PORT` (default: `5000`)
- `CORS_ORIGINS` (default: `http://localhost:8080,http://localhost:8081`)
- `OPENAI_API_KEY` (optional)
- `OPENAI_MODEL` (optional, default set in code)

## Run (dev)

```bash
npm run dev
```

Backend runs on `http://localhost:5000` by default.

## Build + start

```bash
npm run build
npm start
```

## Endpoints

- `GET /api/health`
- `POST /api/diagnosis/analyze`
- `GET /api/dashboard/summary`
- `GET /api/pfe/projects`
- `POST /api/pfe/progress`

## OpenAI (optional)

Set `OPENAI_API_KEY` in `.env`.
If OpenAI is not configured or fails, endpoints return a deterministic fallback response instead of crashing.
