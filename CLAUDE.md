# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development (starts both API on :3001 and Web on :3000)
npm run dev

# Build all packages
npm run build

# Lint / Format / Typecheck
npm run lint
npm run format
npm run typecheck

# Tests (all)
npm run test

# Single API test file
cd apps/api && npx jest src/modules/auth/auth.service.spec.ts

# API E2E tests
cd apps/api && npm run test:e2e
```

Run commands from the monorepo root unless targeting a specific app.

## Architecture

Turborepo monorepo with three packages:

- **`apps/api`** — NestJS 11 backend. All routes prefixed with `/api`. WebSocket gateway at `/ws` using the `ws` protocol.
- **`apps/web`** — Next.js 16 (App Router, Turbopack). Uses `(auth)` and `(dashboard)` route groups. Path alias `@/*` maps to `./src/*`.
- **`packages/shared`** — TypeScript types shared between apps (`@collab-platform/shared`). Defines User, Workspace, Document, Comment, Version, ApiResponse, etc.

### Backend (NestJS) patterns

- **Modules**: Each feature is a self-contained NestJS module in `apps/api/src/modules/` (auth, workspaces, documents, whiteboard, realtime, versions, comments, reactions, storage, notifications, analytics, audit, webhooks, sharing).
- **Auth**: `SupabaseAuthGuard` in `apps/api/src/common/guards/auth.guard.ts` validates Bearer JWT tokens via Supabase, attaches user to `req.user`.
- **Data access**: Services call Supabase client directly (no ORM). The client is provided by `SupabaseModule` (`apps/api/src/supabase/`), configured with the service role key.
- **Realtime**: `RealtimeGateway` manages WebSocket connections with room-based messaging, presence tracking, and broadcast patterns for cursors, canvas strokes, and document operations.

### Frontend (Next.js) patterns

- **State**: Zustand for client state, React Query (`@tanstack/react-query`) for server state.
- **Forms**: react-hook-form + zod validation via `@hookform/resolvers`.
- **Auth**: Supabase SSR (`@supabase/ssr`) with middleware-based session refresh in `apps/web/src/middleware.ts`.
- **API calls**: Supabase client in `apps/web/src/lib/api.ts`; WebSocket client in `apps/web/src/lib/socket.ts`.
- **Styling**: Tailwind CSS v4.

## Environment

Copy `.env.example` to `.env` (API) and `.env.local` (Web). Required variables:

| Variable | App | Purpose |
|---|---|---|
| `SUPABASE_URL` | API | Supabase project URL (default: `http://127.0.0.1:54321`) |
| `SUPABASE_SERVICE_KEY` | API | Service role key for admin operations |
| `JWT_SECRET` | API | JWT signing secret |
| `PORT` | API | Server port (default: `3001`) |
| `NEXT_PUBLIC_SUPABASE_URL` | Web | Public Supabase URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Web | Public anon key |
| `NEXT_PUBLIC_API_URL` | Web | Backend URL (default: `http://localhost:3001/api`) |
| `NEXT_PUBLIC_WS_URL` | Web | WebSocket URL (default: `ws://localhost:3001/ws`) |

### Local services

| Service | Port |
|---|---|
| Next.js dev | 3000 |
| NestJS API | 3001 |
| Supabase API | 54321 |
| PostgreSQL | 54322 |

## Database

Supabase with PostgreSQL 17. Migrations live in `supabase/migrations/` and are numbered sequentially (`00001_initial_schema.sql` through `00008_*`). Core tables: `workspaces`, `workspace_members`, `documents`, `whiteboard_sessions`, plus supporting tables for comments, versions, analytics, audit logs, webhooks, notifications, templates, file attachments, and shared links.

## Testing

- **API**: Jest + ts-jest. Config in `apps/api/package.json` under `"jest"`. Test files: `*.spec.ts` alongside source. E2E tests in `apps/api/test/` with `jest-e2e.json` config.
- **Web**: ESLint only (no test runner configured yet).
