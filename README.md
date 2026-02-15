# Yunkhngn Website

A modern, enterprise-grade Portfolio & Blog platform built for high performance, rich interactivity, and seamless developer experience.

## Project Overview

This platform serves as a central hub for showcasing projects, sharing technical insights, and engaging with the developer community. It integrates **Google Gemini AI** for content assistance, uses **Socket.IO** for real-time notifications, and is deployed via a robust **Docker + Caddy** pipeline.

### Key Features
- **AI-Powered**: Integrated with Google Gemini for intelligent content generation and assistance.
- **Advanced Blog Engine**: Built with TipTap for a rich editing experience (code blocks, embeds, images).
- **Real-time Notifications**: Socket.IO integration for instant updates on interactions.
- **Smart Gallery**: Cloudinary-powered image gallery with unique photo reactions.
- **Secure Auth**: Firebase Authentication (Admin + Anonymous support).
- **Modern UI**: Crafted with Next.js 14, TailwindCSS, and shadcn/ui for a clean, responsive design.
- **Admin Dashboard**: Comprehensive CMS for managing content, users, and settings.

## 🛠 Tech Stack

### Frontend (`/fe`)
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS, shadcn/ui, Framer Motion
- **State & Auth**: Firebase Auth, Context API
- **Editor**: TipTap (Headless WYSIWYG)
- **Real-time**: Socket.IO Client

### Backend (`/be`)
- **Framework**: NestJS (Modular Architecture)
- **Database**: MSSQL (via Azure SQL Edge)
- **ORM**: Prisma
- **AI Integration**: Google Gemini API
- **Real-time**: Socket.IO Gateway
- **Auth**: Firebase Admin SDK

### Infrastructure & DevOps
- **Containerization**: Docker & Docker Compose
- **Reverse Proxy**: Caddy (Automatic HTTPS & Routing)
- **CI/CD**: GitHub Actions (Linting, Testing, Building, Deploying)
- **Registry**: GitHub Container Registry (GHCR)

## Getting Started

### Prerequisites
- Docker & Docker Compose
- Node.js (v20+)
- Package Manager: Yarn (Preferred)

### Environment Setup

1.  **Frontend (`/fe/.env`)**
    ```env
    NEXT_PUBLIC_FIREBASE_API_KEY="..."
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="..."
    NEXT_PUBLIC_FIREBASE_PROJECT_ID="..."
    NEXT_PUBLIC_API_URL="http://localhost:3001" # Or https://your-domain.com/api
    ```

2.  **Backend (`/be/.env`)**
    ```env
    DATABASE_URL="sqlserver://mssql:1433;database=blogdb;..."
    FIREBASE_CREDENTIALS="..."
    GEMINI_API_KEY="..."
    CLOUDINARY_URL="..."
    CORS_ORIGIN="*"
    ```

### Running Locally (Recommended)

The easiest way to run the full stack (Frontend, Backend, Database, Caddy) is via Docker Compose.

```bash
# Start all services in detached mode
docker-compose up -d

# Check logs
docker-compose logs -f
```

- **Frontend**: `http://localhost:3000`
- **Backend API**: `http://localhost:3001`
- **Swagger Docs**: `http://localhost:3001/api/docs`

### Manual Development

If you prefer running services individually for development:

**Backend:**
```bash
cd be
yarn install
yarn prisma generate
yarn start:dev
```

**Frontend:**
```bash
cd fe
yarn install
yarn dev
```

## Contributing

1.  Fork the repository.
2.  Create a feature branch (`git checkout -b feature/amazing-feature`).
3.  Commit your changes (`git commit -m 'feat: Add amazing feature'`).
4.  Push to the branch (`git push origin feature/amazing-feature`).
5.  Open a Pull Request.

## License

This project is licensed under the MIT License.
