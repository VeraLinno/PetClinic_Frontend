# Pet Clinic frontend — Full project explanation

## Overview

This document explains the frontend SPA located in the `velinn-petclinic_js` folder. The app is a Vue 3 + Vite single-page application (SPA) that provides Owner, Vet and Admin UIs and integrates with the backend API in `velinn-petclinic_charp`.

Key goals:
- fast developer feedback (Vite)
- predictable state management (Pinia)
- typed DTOs where useful (TS)
- robust E2E coverage (Playwright)

## Stack

- Vue 3 (Composition API)
- Vite (dev server and build)
- TypeScript
- Pinia for state
- Vue Router for routes
- i18n (app-specific layer + backend translations)
- Tailwind CSS for styling
- Vitest for unit tests
- Playwright for E2E tests

## Folder structure (important parts)

- `src/main.ts` — app bootstrap (router, store, i18n, global plugins)
- `src/App.vue` — root layout and global error handling
- `src/router/` — route definitions and guards
- `src/stores/` — Pinia stores (auth, user, appointments, inventory)
- `src/services/` — API wrappers and helpers (authService, api client)
- `src/pages/` — top-level route pages (Owner, Vet, Admin pages)
- `src/components/` — reusable UI components
- `src/locales/` — frontend translation files (fallback), supplemented by backend DB translations
- `public/` — static assets

See the source tree for more detail of individual components and pages.

## Authentication flow

- Login: frontend sends credentials to `POST /api/v1/auth/login`.
- Backend returns an access token (JWT) in JSON and sets a httpOnly refresh cookie.
- Frontend stores the short-lived access token in memory (Pinia) and attaches it to `Authorization: Bearer <token>` on API calls.
- On 401, frontend calls `POST /api/v1/auth/refresh` (no JS access to refresh cookie required) to obtain a new access token.

Security notes:
- Refresh token is stored in an httpOnly cookie — frontend cannot read it (defense vs XSS).
- Do not persist access token to localStorage; prefer in-memory + persistent refresh cookie pattern.

## API client & base URL

- API base is controlled by `VITE_API_BASE` (defaulting to `/api/v1` or `http://localhost:5001/api/v1` when running backend locally).
- `src/services/api.ts` centralizes fetch/axios instance, auth header injection, and automatic token refresh on 401.

## Environment variables (Vite)

- `VITE_API_BASE` — backend base URL
- `VITE_APP_TITLE` — app title
- `VITE_SENTRY_DSN` — optional error reporting
- `VITE_ENABLE_MOCKS` — enable client-side mocks during development

Add variables in `.env`, `.env.development` or pass via CI.

## Local development

Install and run dev server:

```bash
cd velinn-petclinic_js
npm install
npm run dev
```

The default dev server runs on `http://localhost:5173`.

To run the backend locally in parallel (recommended):

```bash
cd velinn-petclinic_charp
dotnet run --project src/PetClinic.Api/PetClinic.Api.csproj
```

If you use docker-compose from the root, both services can be started together.

## Build and preview

```bash
npm run build
npm run preview
```

`preview` runs the built assets on a local static server so you can sanity-check production build behavior.

## Docker

- The repository contains a `Dockerfile` for the frontend. The CI builds the frontend image and serves built static assets from an Nginx container in production.

Example local container build:

```bash
cd velinn-petclinic_js
docker build -t petclinic-frontend:local .
docker run -p 8080:80 petclinic-frontend:local
```

## Testing

Unit tests (Vitest):

```bash
npm run test
```

E2E tests (Playwright):

```bash
npx playwright install --with-deps
npx playwright test
```

Important Playwright suites in `tests/`:
- `owner-flow.spec.ts` — owner happy path
- `login.spec.ts` — login validations
- `idor.spec.ts` — negative IDOR checks

CI runs both Vitest and Playwright (headed or headless depending on pipeline).

## State management patterns

- `auth` store holds current user info and access token (in-memory).
- `user` store caches profile and pets.
- `appointments` store provides queries and optimistic UI update helpers.

Keep stores small: prefer service calls for complex mutations and keep stores as a single source of UI state.

## Localization (i18n)

- Frontend uses local JSON resource fallbacks and requests DB translations from backend when available.
- `Accept-Language` header and user profile language preference are respected.

## Accessibility & UX notes

- Forms use proper labels and error messages.
- Keyboard navigation is enabled for primary flows.

## CI/CD and deployment

- Frontend CI builds production bundle, runs unit tests and e2e, then publishes Docker image or uploads static bundle to artifact storage.
- Deploy is typically: frontend served from Nginx (static) and proxying `/api` to backend.

CI files:
- `.gitlab-ci.yml` and `.github/workflows/ci-cd.yml` exist in this folder — see them for pipeline steps.

## Troubleshooting & tips

- CORS: ensure backend `ASPNETCORE_ENVIRONMENT` and `VITE_API_BASE` match the runtime addresses.
- Token refresh: if 401s persist, check browser cookies for missing refresh cookie (httpOnly) and backend cookie domain/path.
- Local backend: run backend with `ASPNETCORE_ENVIRONMENT=Development` and `dotnet user-secrets` for secrets.

## Links & related docs

- UI wireframes: [UI-WIREFRAMES.md](./UI-WIREFRAMES.md)
- Backend full explanation: ../velinn-petclinic_charp/docs/FULL_PROJECT_EXPLAIN.MD
- Playwright report: `playwright-report/index.html` (generated after E2E)

---

If you want, I can also add a short linking section into the backend `docs/FULL_PROJECT_EXPLAIN.MD` to point directly to this frontend doc (I can update that file too).
