## Main prompt

You are an authenticated frontend development assistant. Generate a complete frontend scaffold for a Pet Clinic client application (separate repo) using Vue 3 + TypeScript + Vite and the technologies below. Produce the project tree and generate the first 10 files (full file contents) so the project is runnable locally (dev and Docker). Put all kilocode prompts you use (for any sub-generation steps) into one file prompts.md at the repository root. Output only this prompt content — the kilocode driver will consume it.

Summary / constraints

Framework: Vue 3 + TypeScript + Vite

State: Pinia

Router: Vue Router

HTTP client: Axios

Styling: Tailwind CSS

Testing: Vitest (unit), Playwright (E2E)

CI: GitHub Actions

Docker: Dockerfile + docker-compose.dev.yml that runs frontend dev server and proxies /api to backend http://host.docker.internal:5001 (or environment variable)

Backend contract: C# REST API at base URL VITE_API_BASE_URL (default http://localhost:5001/api/v1)

Auth: JWT access token (short-lived) returned in login response; refresh token stored as httpOnly cookie by backend. Frontend must keep accessToken in memory only (Pinia store) — never store tokens in localStorage. Implement automatic refresh using /auth/refresh cookie flow when access token is expired or 401 encountered.

Route guards: role-based UI. Roles come from access token roles claim (array). Users can have "Owner", "Vet", "Admin". Login endpoint: POST /api/v1/auth/login returns { accessToken } and backend sets refreshToken cookie.

Provide .env example for Vite: VITE_API_BASE_URL=http://localhost:5001/api/v1

Provide README with start instructions, curl examples for login/refresh/create appointment/complete visit.

Provide prompts.md containing all kilocode prompts used (Main prompt + tier prompts + follow-ups). prompts.md should be ready for a code generator to consume.

Required repository structure (frontend only)
/frontend
  /src
    /components
    /pages
    /services
    /stores
    /router
    main.ts
    App.vue
  index.html
  package.json
  tsconfig.json
  tailwind.config.js
  vite.config.ts
  Dockerfile
  docker-compose.dev.yml
  .env.example
  README.md
  prompts.md
Deliverables (what to generate)

Project scaffold (Vite + Vue 3 + TS) with Tailwind and Pinia configured.

Implement auth flow and Axios instance with interceptor for:

adding Authorization: Bearer <accessToken> header,

on 401 (and if refresh token cookie exists), call POST /api/v1/auth/refresh to obtain new access token and retry the failed request,

if refresh fails, redirect to login.

Implement route guards:

Protect routes via Vue Router meta fields: meta: { requiresAuth: true, roles: ['Owner'] }.

If a logged-in user has multiple roles, show role switch UI (optional) — but ensure they cannot access routes they are not authorized for.

Token handling:

Access token stored in Pinia (memory only).

Provide helper to decode JWT to extract roles and expiry (don’t trust client for security — backend must enforce).

Provide sample pages/components for Owner and Vet flows:

LoginPage.vue, RegisterPage.vue (skeleton), OwnerDashboard.vue, VetDashboard.vue, BookingPage.vue, AppointmentList.vue, VisitDetails.vue.

Provide services/auth.ts and services/api.ts (Axios instance) with typed interfaces.

Provide stores/auth.ts (Pinia) with actions: login, logout, refreshAccessToken, setAccessToken, getRoles, isAuthenticated.

docker-compose.dev.yml that mounts local source and runs npm install && npm run dev -- --host 0.0.0.0 and proxies /api to backend using Vite dev server proxy or an Nginx service. Provide a simple proxy configuration using Vite’s dev server server.proxy setting in vite.config.ts.

Provide GitHub Actions ci.yml skeleton in README section (no full workflow needed unless requested).

Provide first 10 files with full contents (listed below) so the project can be started immediately with npm install and npm run dev.

Tier breakdown (instructions for kilocode)

Tier 1 — Setup & scaffolding

Create Vite + Vue TypeScript project.

Install dependencies: vue@3, pinia, vue-router@4, axios, jwt-decode (or small decode helper), tailwindcss, postcss, autoprefixer, typescript, vitest, playwright dev deps.

Configure tailwind.config.js, add index.css with Tailwind imports.

Configure vite.config.ts with server.proxy for VITE_API_BASE_URL (map /api to backend).

Create file/folder structure under /src as above.

Generate .env.example.

Tier 2 — Auth & role handling

Implement src/services/api.ts (Axios instance) that reads access token from Pinia store on request and attaches Authorization header.

Add response interceptor to:

If 401 and request is not /auth/refresh nor /auth/login, call authStore.refresh() which calls POST /api/v1/auth/refresh (cookies sent automatically), update access token in store, then retry original request once.

If refresh fails (401/403), call authStore.logout() and navigate to /login.

Implement src/services/auth.ts wrapping API calls: login(email, password), register(...), refresh(), logout(). login stores access token in auth store; logout calls backend logout endpoint and clears store.

Implement src/stores/auth.ts (Pinia) with:

state: accessToken: string | null, user: { id, email, roles } | null

getters: isAuthenticated, roles, tokenExpiresAt

actions: login, setAccessToken, refresh, logout, decodeToken

Implement route guard in router/index.ts:

global guard: if route requires auth and not authenticated → redirect to /login.

if route has meta.roles ensure user roles overlap; if not → redirect to 403 page or /.

Provide small helper src/utils/jwt.ts to decode JWT safely (no signature check).

Tier 3 — Core flows (Owner + Vet views)

Provide skeleton pages/components:

LoginPage.vue with form that calls authService.login.

OwnerDashboard.vue that calls GET /appointments?ownerId=me (via API).

VetDashboard.vue shows today's visits (GET /appointments?date=today).

BookingPage.vue with two-step flow and calls POST /appointments.

VisitDetails.vue shows visit and invoice.

Provide src/services/appointments.ts with typed methods: getAppointments, createAppointment, etc.

Provide src/components/ProtectedRoute.vue or rely on router guards.

Tier 4 — Tests, CI, quality

Add vitest config in package.json and an example unit test for a small component or util (e.g., jwt decode).

Add Playwright test scaffold in package.json with one basic scenario (login flow).

Add GitHub Actions example snippet in README for running npm ci, npm run build, npm test.

Provide Dockerfile to build production static assets (npm run build) and serve with nginx (skeleton) and docker-compose.prod.yml note in README.

First 10 files to generate (full contents)

Produce exact contents for these files:

/frontend/package.json — scripts: dev, build, preview, test, e2e, plus dependencies & devDependencies.

/frontend/vite.config.ts — Vite config with server.proxy pointing /api to process.env.VITE_API_BASE_URL host (use host http://host.docker.internal:5001 fallback).

/frontend/tsconfig.json — TypeScript config for Vite + Vue.

/frontend/tailwind.config.js — Tailwind config.

/frontend/index.html — Vite entry HTML.

/frontend/src/main.ts — createApp, Pinia, Router, import global css.

/frontend/src/App.vue — root component with <router-view/>.

/frontend/src/services/api.ts — Axios instance, interceptors (attach token, refresh on 401).

/frontend/src/stores/auth.ts — Pinia store for auth (in-memory access token, decode token).

/frontend/src/router/index.ts — Router with sample routes and guards (login, owner dashboard, vet dashboard, booking).

Additionally add file stubs (but contents not required now): README.md, .env.example, Dockerfile, docker-compose.dev.yml, src/pages/LoginPage.vue, src/pages/OwnerDashboard.vue, src/pages/VetDashboard.vue, src/services/auth.ts, src/services/appointments.ts, src/utils/jwt.ts, src/styles/index.css.

prompts.md requirement

Create prompts.md in project root containing:

## Main prompt — the top-level instruction (this whole document).

## Tier 1 prompt — specific instructions to scaffold Vite/Vue project and install dependencies and generate the first 10 files above.

## Tier 2 prompt — instructions to implement Axios interceptors, Pinia auth store, and token refresh flow.

## Tier 3 prompt — instructions to scaffold pages/components and appointment service.

## Tier 4 prompt — instructions to add tests and CI snippets.

Any follow-up sub-prompts or commands that will be run (e.g., npm install, npx tailwindcss init, npx vitest init, etc.).

Each block should be copy-pastable and ready for a code generator.

README content (must include)

Quick start: cp .env.example .env and npm install && npm run dev, or docker-compose -f docker-compose.dev.yml up --build.

How to configure VITE_API_BASE_URL.

Curl examples:

curl -X POST http://localhost:5001/api/v1/auth/login -H 'Content-Type: application/json' -d '{"email":"owner@example.com","password":"pass"}' -c cookies.txt

curl -X POST http://localhost:5001/api/v1/auth/refresh -b cookies.txt

curl -X POST http://localhost:5001/api/v1/appointments -H 'Authorization: Bearer <token>' -d '{...}'

curl -X PATCH http://localhost:5001/api/v1/visits/{id}/complete -H 'Authorization: Bearer <token>' -d '{...}'

Security notes: access token in memory, refresh token httpOnly cookie, use HTTPS in production.

Notes on where backend should be configured, and expectation that backend enforces RBAC server-side.

Output constraint for kilocode

Generate full project tree under /frontend and write the 10 files listed with exact contents.

Create prompts.md with the main prompt and tier-specific prompts (as described).

Add .env.example and README.md.

Ensure src/services/api.ts implements automatic refresh + retry logic and uses Pinia auth store.

Output only this prompt content (the content you are reading)...... for now only the tier 1 and stop until i do not say to continue with the tier 2... it is the frontend and externally i also have another repo for the backend

## Tier 1 prompt

Create Vite + Vue TypeScript project.

Install dependencies: vue@3, pinia, vue-router@4, axios, jwt-decode (or small decode helper), tailwindcss, postcss, autoprefixer, typescript, vitest, playwright dev deps.

Configure tailwind.config.js, add index.css with Tailwind imports.

Configure vite.config.ts with server.proxy for VITE_API_BASE_URL (map /api to backend).

Create file/folder structure under /src as above.

Generate .env.example.

Generate the first 10 files with full contents as specified.

## Tier 2 prompt

Implement src/services/api.ts (Axios instance) that reads access token from Pinia store on request and attaches Authorization header.

Add response interceptor to:

If 401 and request is not /auth/refresh nor /auth/login, call authStore.refresh() which calls POST /api/v1/auth/refresh (cookies sent automatically), update access token in store, then retry original request once.

If refresh fails (401/403), call authStore.logout() and navigate to /login.

Implement src/services/auth.ts wrapping API calls: login(email, password), register(...), refresh(), logout(). login stores access token in auth store; logout calls backend logout endpoint and clears store.

Implement src/stores/auth.ts (Pinia) with:

state: accessToken: string | null, user: { id, email, roles } | null

getters: isAuthenticated, roles, tokenExpiresAt

actions: login, setAccessToken, refresh, logout, decodeToken

Implement route guard in router/index.ts:

global guard: if route requires auth and not authenticated → redirect to /login.

if route has meta.roles ensure user roles overlap; if not → redirect to 403 page or /.

Provide small helper src/utils/jwt.ts to decode JWT safely (no signature check).

## Tier 3 prompt

Provide skeleton pages/components:

LoginPage.vue with form that calls authService.login.

OwnerDashboard.vue that calls GET /appointments?ownerId=me (via API).

VetDashboard.vue shows today's visits (GET /appointments?date=today).

BookingPage.vue with two-step flow and calls POST /appointments.

VisitDetails.vue shows visit and invoice.

Provide src/services/appointments.ts with typed methods: getAppointments, createAppointment, etc.

Provide src/components/ProtectedRoute.vue or rely on router guards.

## Tier 4 prompt

Add vitest config in package.json and an example unit test for a small component or util (e.g., jwt decode).

Add Playwright test scaffold in package.json with one basic scenario (login flow).

Add GitHub Actions example snippet in README for running npm ci, npm run build, npm test.

Provide Dockerfile to build production static assets (npm run build) and serve with nginx (skeleton) and docker-compose.prod.yml note in README.

## Follow-up commands

- npm install

- npx tailwindcss init -p (for postcss)

- npx vitest init

- npx playwright install