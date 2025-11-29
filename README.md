# Developer Blog & Portfolio Platform

A comprehensive Blog and Portfolio platform designed for developers, featuring a Codecademy-inspired UI, rich text editing, and a robust backend architecture.

## 🚀 Project Overview

This system is built to serve as a personal brand hub, allowing the owner to showcase projects, write technical blogs, and interact with the community through comments and donations.

### Key Features
*   **Blog**: Rich text editor (TipTap) with code blocks, embeds, and image support.
*   **Portfolio**: Showcase projects with detailed descriptions and tech stacks.
*   **Gallery**: Image gallery powered by Cloudinary.
*   **Interaction**: Anonymous commenting system via Firebase Auth.
*   **Support**: BuyMeACoffee integration.
*   **Admin Panel**: Full CMS for managing content and site settings.
*   **Customization**: Editable design tokens (colors, spacing, typography).

## 🛠 Tech Stack

### Frontend (`/fe`)
*   **Framework**: Next.js (SSR only)
*   **Styling**: TailwindCSS + shadcn/ui
*   **State/Auth**: Firebase Auth (Anonymous + Admin)
*   **Editor**: TipTap
*   **Media**: Cloudinary SDK

### Backend (`/be`)
*   **Framework**: NestJS
*   **Database**: MSSQL (Microsoft SQL Server)
*   **ORM**: Prisma
*   **API**: RESTful API
*   **Auth**: Firebase Admin SDK (Server-side verification)

### Infrastructure
*   **Containerization**: Docker & Docker Compose
*   **Proxy**: Caddy (Reverse Proxy)

## 🏗 System Architecture

### Actors
1.  **Visitor**: Can view content, comment anonymously, and donate.
2.  **Admin**: Full access to CMS features (CRUD Blogs, Projects, Gallery, Settings).

### Database Schema Overview
*   **Blogs**: Content, metadata, status.
*   **Projects**: Portfolio items.
*   **Comments**: Linked to blogs, supports anonymous users.
*   **Gallery**: Image assets.
*   **Settings**: Site configuration and Design Tokens.

## 📦 Setup & Installation

### Prerequisites
*   Docker & Docker Compose
*   Node.js (v18+)

### Environment Variables
Create `.env` files in `/fe` and `/be` based on the examples.

**Backend (`/be/.env`)**
```env
DATABASE_URL="sqlserver://mssql:1433;database=mydb;user=sa;password=..."
FIREBASE_CREDENTIALS="..."
CLOUDINARY_URL="..."
```

**Frontend (`/fe/.env`)**
```env
NEXT_PUBLIC_FIREBASE_CONFIG="..."
NEXT_PUBLIC_API_URL="http://localhost:3000"
```

### Running the Project
```bash
# Start all services
docker-compose up -d

# The application will be available at:
# Frontend: http://localhost
# Backend API: http://localhost/api
```

## 🎨 UI/UX Design
*   **Style**: Codecademy-inspired (Pastel background, White cards, Purple accents).
*   **Typography**: Inter font family.
*   **Responsiveness**: Mobile-first design.

## 🤝 Contributing
1.  Fork the repository
2.  Create your feature branch (`git checkout -b feat/amazing-feature`)
3.  Commit your changes (`git commit -m 'feat: add some amazing feature'`)
4.  Push to the branch (`git push origin feat/amazing-feature`)
5.  Open a Pull Request
