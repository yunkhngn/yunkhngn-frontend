# Frontend (`fe`)

Frontend for **yunkhngn.dev**, built with **Next.js + React + TailwindCSS**.

## Tech stack

- Next.js (Pages Router)
- React 19
- TailwindCSS + Radix UI + shadcn/ui-style components
- Firebase Auth
- Socket.IO client
- TipTap editor

## Requirements

- Node.js 20+
- npm or yarn

## Environment variables

Create `fe/.env` before running:

```env
NEXT_PUBLIC_FIREBASE_API_KEY="..."
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="..."
NEXT_PUBLIC_FIREBASE_PROJECT_ID="..."
NEXT_PUBLIC_API_URL="http://localhost:3001"
```

`NEXT_PUBLIC_API_URL` should point to the backend API base URL.

## Run locally

```bash
cd fe
npm install
npm run dev
```

App runs at `http://localhost:3000`.

## Scripts

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run start      # Run production build
npm run lint       # Run ESLint
npm run test       # Run Jest tests
npm run test:watch # Run tests in watch mode
```

## Docker (from repository root)

Use the root `docker-compose.yml` to run full stack:

```bash
docker-compose up -d frontend backend mssql redis caddy
```
