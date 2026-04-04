# Pet Clinic Frontend

Vue 3 + TypeScript frontend for the Pet Clinic system.

## Stack

- Vue 3 + TypeScript
- Vite 4
- Pinia
- Vue Router
- Vue I18n
- Axios
- Tailwind CSS
- Vitest + Playwright

## Prerequisites

- Node.js 20+ (recommended)
- npm 9+

## Quick Start

From this folder (`velinn-petclinic_js`):

```bash
npm ci
npm run dev
```

Frontend runs at:

- `http://localhost:5173`

## API Configuration

The app uses `VITE_API_BASE_URL`.

- If omitted, frontend uses `/api/v1`.
- In local Vite dev mode, `/api/v1` is proxied to `http://127.0.0.1:5001` by default.

Create a `.env` file only if you need custom behavior. Example:

```env
VITE_API_BASE_URL=/api/v1
VITE_API_PROXY_TARGET=http://127.0.0.1:5001
```

If backend runs on another host/port, update `VITE_API_PROXY_TARGET` accordingly.

## Scripts

- `npm run dev` - start Vite dev server
- `npm run build` - type-check and create production build
- `npm run preview` - preview production build locally
- `npm run test` - run unit tests (Vitest)
- `npm run e2e` - run end-to-end tests (Playwright)

## Docker (Production Build)

Build frontend image:

```bash
docker build -t petclinic-frontend .
```

Run container:

```bash
docker run --rm -p 80:80 petclinic-frontend
```

For full stack (db + api + frontend), use Compose from backend folder:

```bash
cd ../velinn-petclinic_charp
docker compose up --build
```

## Auth/Security Notes

- API client sends credentials (`withCredentials: true`) for refresh cookie flow.
- Access token is sent as `Authorization: Bearer <token>`.
- Backend still enforces authorization; frontend checks are UX-only.

## Project Structure

- `src/components` - reusable UI components
- `src/layouts` - page layout wrappers
- `src/pages` - route pages
- `src/router` - Vue Router setup
- `src/services` - API layer
- `src/stores` - Pinia state stores
- `src/locales` - i18n dictionaries
- `src/styles` - global styles/themes
