# Frontend (`fe`)

Frontend for **yunkhngn.dev**, built with **Next.js + React + TailwindCSS**.

## Tech stack

- Next.js (App Router)
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

## Docker

There is no `Dockerfile` in this package (frontend is deployed on Vercel). To run a full stack with containers, use the compose setup under your infra repo (e.g. `yunkhngn-infra`) and point the frontend service at this Next.js app as needed.
