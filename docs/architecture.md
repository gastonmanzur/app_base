# Stage 1 - Architecture Baseline

## Monorepo principles
- Clear split between apps and reusable packages.
- Strict TypeScript baseline across all workspaces.
- Business features isolated by modules in `apps/api/src/modules` and `apps/web/src/features`.
- Shared contracts in `packages/shared-types` to reduce drift frontend/backend.

## API layering
- `core`: cross-cutting concerns (errors, http response shape).
- `config`: env parsing and app config.
- `modules/*`: feature modules with route/controller/service separation.

## Web layering
- `app`: app shell, routing setup.
- `features/*`: feature scoped UI + logic.
- `i18n`: localization bootstrap and dictionaries.

## Reusable packages
- `shared-types`: API contracts and domain primitives.
- `shared-utils`: formatting, validators, helper functions.
- `ui`: reusable design-system-ready components.
