# Pet Clinic Frontend

A Vue 3 + TypeScript frontend application for the Pet Clinic system.

## Quick Start

1. Copy the environment file:
   ```bash
   cp .env.example .env
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:5173`.

## Configuration

Configure the backend API URL in `.env`:

```
VITE_API_BASE_URL=http://localhost:5001
```

## Docker Development

To run with Docker:

```bash
docker-compose -f docker-compose.dev.yml up --build
```

This will mount the local source, install dependencies, and start the dev server with `--host 0.0.0.0`.

## API Examples

### Login
```bash
curl -X POST http://localhost:5001/api/v1/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"owner@example.com","password":"pass"}' \
  -c cookies.txt
```

### Refresh Token
```bash
curl -X POST http://localhost:5001/api/v1/auth/refresh \
  -b cookies.txt
```

### Create Appointment
```bash
curl -X POST http://localhost:5001/api/v1/appointments \
  -H 'Authorization: Bearer <token>' \
  -H 'Content-Type: application/json' \
  -d '{"petId": "123", "vetId": "456", "date": "2023-10-01"}'
```

### Complete Visit
```bash
curl -X PATCH http://localhost:5001/api/v1/visits/123/complete \
  -H 'Authorization: Bearer <token>' \
  -H 'Content-Type: application/json' \
  -d '{"notes": "Visit completed"}'
```

## Security Notes

- Access tokens are stored in memory only (Pinia store), never in localStorage.
- Refresh tokens are handled via httpOnly cookies by the backend.
- Use HTTPS in production.
- Backend must enforce RBAC server-side; client-side checks are for UX only.

## CI/CD

Example GitHub Actions workflow:

```yaml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - run: npm test
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npx playwright install
      - run: npm run e2e
```

## Project Structure

- `src/components/` - Reusable Vue components
- `src/pages/` - Page components
- `src/services/` - API services
- `src/stores/` - Pinia stores
- `src/router/` - Vue Router configuration
- `src/utils/` - Utility functions
