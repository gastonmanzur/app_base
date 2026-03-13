# Professional Web Starter (React + Express + MongoDB)

Starter modular monorepo for future web projects.

## Quick start

```bash
npm install
npm run dev
```

This runs:
- API: http://localhost:4000
- Web: http://localhost:5173

## Workspaces
- `apps/web`: React + TypeScript + Vite
- `apps/api`: Express + TypeScript
- `packages/shared-types`: shared DTOs/contracts
- `packages/shared-utils`: reusable utilities
- `packages/ui`: reusable UI base components
- `docs`: architecture and stage roadmap

## Stage status
Implemented in this commit:
- Stage 1: architecture and base setup

Not implemented yet:
- Auth, roles, emails, images, push, payments, admin, full testing matrix

See `docs/roadmap.md` and `docs/env.md`.
