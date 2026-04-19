# Backend (`be`)

Backend API for **yunkhngn.dev**, built with **NestJS** and organized by domain modules.

## Tech stack

- NestJS (TypeScript)
- MSSQL
- Prisma
- Firebase Admin (authentication/verification)
- Cloudinary (media handling)
- Socket.IO (real-time events)
- Redis cache (via docker-compose)

## Requirements

- Node.js 20+
- npm or yarn
- MSSQL database (local Docker stack is supported from project root)

## Environment variables

Create `be/.env` from `be/.env.example` and adjust values:

```bash
cp be/.env.example be/.env
```

Current example includes:

```env
DATABASE_URL="sqlserver://localhost:1434;database=blogdb;user=sa;password=YourStrong@Passw0rd;encrypt=false"
PORT=3001
FIREBASE_CREDENTIALS="./firebase-admin-sdk.json"
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"
```

## Run locally

```bash
cd be
npm install
npm run start:dev
```

API runs at `http://localhost:3001`.

## Scripts

```bash
npm run build       # Build NestJS app
npm run start       # Start app
npm run start:dev   # Start in watch mode
npm run start:debug # Start in debug + watch mode
npm run start:prod  # Run built output
npm run lint        # Run ESLint (with --fix)
npm run test        # Run unit tests
npm run test:e2e    # Run e2e tests
npm run test:cov    # Run coverage
```

## Docker (from repository root)

Use the root `docker-compose.yml` to run backend with dependencies:

```bash
docker-compose up -d backend mssql redis
```
