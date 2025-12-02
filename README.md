# Developer Blog & Portfolio Platform

A comprehensive, enterprise-grade Blog and Portfolio platform designed for developers. It features a Codecademy-inspired UI, rich text editing, AI-powered interactions, and a robust, secure CI/CD pipeline.

## Project Overview

This system serves as a personal brand hub, allowing the owner to showcase projects, write technical blogs, and interact with the community. It leverages **Google Gemini AI** for intelligent features and employs an **Enterprise CI/CD** workflow for reliable deployments.

### Key Features
*   **AI Integration**: Powered by Google Gemini for content assistance and intelligent interactions.
*   **Advanced Blog**: Rich text editor (TipTap) with code blocks, embeds, and image support.
*   **Portfolio**: Showcase projects with detailed descriptions and tech stacks.
*   **Gallery**: Image gallery powered by Cloudinary with **Photo Reactions**.
*   **Interaction**: Anonymous commenting system via Firebase Auth.
*   **Support**: BuyMeACoffee integration.
*   **Admin Panel**: Full CMS for managing content, site settings, and users.
*   **Customization**: Editable design tokens (colors, spacing, typography).

## Tech Stack

### Frontend (`/fe`)
*   **Framework**: Next.js 14
*   **Styling**: TailwindCSS + shadcn/ui
*   **State/Auth**: Firebase Auth (Anonymous + Admin)
*   **Editor**: TipTap
*   **Media**: Cloudinary SDK

### Backend (`/be`)
*   **Framework**: NestJS
*   **Database**: MSSQL (Microsoft SQL Server)
*   **ORM**: Prisma
*   **AI**: Google Gemini API
*   **API**: RESTful API + Swagger Docs
*   **Auth**: Firebase Admin SDK

### Infrastructure & DevOps
*   **Containerization**: Docker & Docker Compose
*   **Proxy**: Caddy (Reverse Proxy)
*   **CI/CD**: GitHub Actions
    *   **SAST**: Semgrep Security Scanning
    *   **Registry**: GitHub Container Registry (GHCR)
    *   **Deployment**: SSH to VPS

## Enterprise CI/CD Pipeline

The project uses an advanced CI/CD pipeline defined in `.github/workflows/ci-cd.yml`:

1.  **Quality Check**: Runs ESLint and Unit Tests for both Frontend and Backend.
2.  **Security Scan (SAST)**: Uses **Semgrep** to scan for security vulnerabilities (OWASP Top 10).
3.  **Build & Push**: Builds Docker images and pushes them to GHCR with unique SHA tags.
4.  **Deploy Production**: Deploys the approved images to the production server via SSH.
    *   **Health Check**: Automatically verifies the deployment via a `/health` endpoint.
5.  **Rollback**: Automatically reverts to the previous stable image tag if the production deployment fails.

## Setup & Installation

### Prerequisites
*   Docker & Docker Compose
*   Node.js (v20+)
*   Yarn

### Environment Variables
Create `.env` files in `/fe` and `/be` based on the examples.

**Backend (`/be/.env`)**
```env
DATABASE_URL="sqlserver://mssql:1433;database=mydb;..."
FIREBASE_CREDENTIALS="..."
CLOUDINARY_URL="..."
GEMINI_API_KEY="..."
CORS_ORIGIN="..."
```

**Frontend (`/fe/.env`)**
```env
NEXT_PUBLIC_FIREBASE_CONFIG="..."
NEXT_PUBLIC_API_URL="http://localhost:3000"
```

### Running Locally
```bash
# Start all services
docker-compose up -d

# The application will be available at:
# Frontend: http://localhost
# Backend API: http://localhost/api
# Swagger Docs: http://localhost/api/docs
```

## Contributing
1.  Fork the repository
2.  Create your feature branch (`git checkout -b feat/amazing-feature`)
3.  Commit your changes (`git commit -m 'feat: add some amazing feature'`)
4.  Push to the branch (`git push origin feat/amazing-feature`)
5.  Open a Pull Request
