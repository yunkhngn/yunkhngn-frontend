# Next.js App Router Migration & Full Refactor Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate the `yunkhngn-fe` frontend from Pages Router to App Router, enable backend API response standardization (TransformInterceptor), tighten security (CSP via middleware, env hygiene), optimize performance (Server Components, streaming), clean up dead code, and upgrade dependencies.

**Architecture:** The migration replaces `pages/` with `app/` directory using Next.js 16 App Router conventions. Public-facing pages become Server Components with selective `'use client'` boundaries. Admin pages remain fully client-side behind auth middleware. The backend enables `TransformInterceptor` globally and the frontend API client auto-unwraps the standardized `{ data, statusCode, timestamp }` envelope.

**Tech Stack:** Next.js 16 (App Router), React 19, TailwindCSS 3, Radix UI, Firebase Auth, Axios, NestJS (backend)

> **Status (implemented in repo):** `pages/` removed; `app/` + route groups; `proxy.js` (CSP/security headers); `global-error.jsx`; `loading.jsx` at `(public)`, `(admin)/admin`, `blog/[slug]`, `project`, `admin/dashboard`; `server-only` on `lib/api/server.js`; `.env.example` documents Gemini **backend-only** (no `NEXT_PUBLIC_GEMINI_*`); Axios envelope unwrap + Nest `TransformInterceptor`; Dockerfile/`.dockerignore` removed; CI runs `yarn build`; dead `Layout.js` / `Metadata` / Pages layouts removed. **Still manual:** deploy Vercel preview, full click-through QA checklist, optional `yarn up` dependency sweeps.

---

> [!IMPORTANT]
> This is a **multi-phase project** broken into 6 independent sub-projects. Each sub-project produces working, testable software on its own and can be merged independently. Execute them **in order** because later phases depend on earlier ones.

## Codebase Inventory

### Current Structure (Pages Router)
```
pages/
├── _app.jsx              # Global providers, fonts, transitions
├── _document.jsx          # HTML shell
├── _error.jsx             # Error page
├── 404.jsx, 500.jsx       # Error pages
├── index.jsx              # Homepage (getStaticProps + ISR)
├── about.jsx              # About page
├── blog/
│   ├── index.jsx          # Blog list (client-side fetch)
│   └── [slug].jsx         # Blog detail (getServerSideProps)
├── project/
│   ├── index.jsx          # Project list
│   └── [id].jsx           # Project detail
├── admin/                 # 15 admin pages (all client-side)
│   ├── dashboard.jsx
│   ├── blog/              # CRUD pages
│   ├── project/           # CRUD pages
│   ├── photo.jsx, journal.jsx, letters.jsx
│   ├── comments.jsx, contact.jsx, notifications.jsx
│   ├── settings.jsx, profile.jsx, media.jsx
│   ├── shortlinks.jsx, chat.jsx
│   └── newsletter/
├── contact.jsx, journal.jsx, photo.jsx
├── letter/[code].jsx, s/[code].jsx
├── login.jsx, resume.jsx, search.jsx, showcase.jsx
├── privacy.jsx, terms.jsx
└── sitemap.xml.jsx

components/
├── admin/        # 6 admin components
├── blog/         # 6 blog components
├── chat/         # 1 chat component
├── extensions/   # 2 tiptap extensions
├── home/         # 2 home components
├── letter/       # 3 letter components
├── live/         # 3 live activity components
├── seo/          # 3 SEO components
├── shared/       # 7 shared components
├── template/     # Metadata, Admin/Default layouts (11 files)
└── ui/           # 35 UI primitives

lib/
├── api/client.js           # Axios instance + auth interceptor
├── firebase/config.js      # Firebase init
├── cloudinary.js, utils.js, settingsCache.js, etc.

contexts/
├── AuthContext.js           # Firebase auth state
├── NotificationContext.jsx  # Socket.io notifications
└── FocusModeContext.js      # Focus mode toggle
```

### Target Structure (App Router)
```
app/
├── layout.jsx              # Root layout (fonts, providers, analytics)
├── not-found.jsx            # 404 page
├── error.jsx                # Error boundary
├── globals.css → (moved from styles/)
├── (public)/               # Route group: public pages
│   ├── layout.jsx          # DefaultLayout (navbar, footer, bg)
│   ├── page.jsx            # Homepage (Server Component)
│   ├── about/page.jsx
│   ├── blog/
│   │   ├── page.jsx        # Blog list
│   │   └── [slug]/page.jsx # Blog detail
│   ├── project/
│   │   ├── page.jsx
│   │   └── [id]/page.jsx
│   ├── contact/page.jsx
│   ├── journal/page.jsx
│   ├── photo/page.jsx
│   ├── letter/[code]/page.jsx
│   ├── s/[code]/page.jsx
│   ├── login/page.jsx
│   ├── resume/page.jsx
│   ├── search/page.jsx
│   ├── showcase/page.jsx
│   ├── privacy/page.jsx
│   └── terms/page.jsx
├── (admin)/                # Route group: admin pages
│   ├── layout.jsx          # AdminLayout + auth guard
│   ├── admin/
│   │   ├── dashboard/page.jsx
│   │   ├── blog/...
│   │   ├── project/...
│   │   └── ...all admin pages
├── sitemap.js              # Built-in sitemap generation
├── robots.js               # robots.txt generation
└── proxy.js                 # CSP headers + security headers (Next.js 16 proxy)

lib/                         # Unchanged location
├── api/client.js            # Updated with response unwrapper
├── firebase/config.js
├── cloudinary.js, utils.js, etc.

components/                  # Unchanged location, add 'use client' where needed
```

---

## Phase 1: Backend — Enable API Response Standardization

> This phase is **backend-only** and must be completed first. It enables the `TransformInterceptor` to wrap all API responses in `{ data, statusCode, timestamp }` format.

### Task 1.1: Update Frontend API Client to Unwrap Responses

**Files:**
- Modify: `lib/api/client.js`

- [ ] **Step 1: Add response interceptor to Axios client**

The interceptor must auto-extract `.data` from the standardized response envelope, so all existing call sites continue to work transparently.

```javascript
import axios from 'axios';
import { auth } from '../firebase/config';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Attach Firebase token to every request
api.interceptors.request.use(
    async (config) => {
        const user = auth.currentUser;
        if (user) {
            const token = await user.getIdToken();
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Unwrap standardized response envelope { data, statusCode, timestamp }
api.interceptors.response.use(
    (response) => {
        const body = response.data;
        if (body && typeof body === 'object' && 'data' in body && 'statusCode' in body) {
            // Return the inner data, but attach meta if present
            response.data = body.data;
            if (body.meta) {
                response.meta = body.meta;
            }
        }
        return response;
    },
    (error) => Promise.reject(error)
);

export default api;
```

- [ ] **Step 2: Verify the interceptor handles edge cases**

Run the dev server and confirm:
- A normal API call like `api.get('/blogs')` returns the array directly, not wrapped.
- Pagination responses (e.g., `/comments?limit=5`) still expose `.meta` via `response.meta`.

- [ ] **Step 3: Commit**
```bash
git add lib/api/client.js
git commit -m "feat(api): add response interceptor to unwrap standardized envelope"
```

### Task 1.2: Enable TransformInterceptor in Backend

**Files:**
- Modify: `yunkhngn-be/src/app.module.ts`

- [ ] **Step 1: Register TransformInterceptor as global interceptor**

```typescript
// In the providers array, add:
{
  provide: APP_INTERCEPTOR,
  useClass: TransformInterceptor,
},
```

Add the import alongside `LoggingInterceptor`:
```typescript
import {
  LoggingInterceptor,
  TransformInterceptor,
} from './common/interceptors';
```

- [ ] **Step 2: Update frontend pages that use raw `fetch()` instead of the Axios client**

Many pages use `fetch()` directly (e.g., `NotificationContext.jsx`, `AuthContext.js`, blog detail page). These must be updated to unwrap the envelope:

In every `fetch()` call that expects JSON, change the pattern:
```diff
- const data = await res.json();
+ const json = await res.json();
+ const data = json.data !== undefined ? json.data : json;
```

Key files to update (each is a sub-step):

**AuthContext.js** (`contexts/AuthContext.js`):
- Lines ~45-52: `fetch('/user/me')` — the profile response will be wrapped
- Lines ~102-112: `loginWithGoogle` fetch
- Lines ~142-152: `loginWithGithub` fetch

**NotificationContext.jsx** (`contexts/NotificationContext.jsx`):
- Lines ~63-69: `fetch('/notifications?limit=5')` — already reads `data.data` and `data.meta.unreadCount`, but the envelope will add another layer

**Blog pages, admin pages, etc.:** All pages that use inline `fetch()` instead of the `api` client need the same unwrap pattern.

> [!WARNING]
> There are ~40+ files with inline `fetch()` calls. The safest approach is to create a thin wrapper function and migrate calls incrementally. This will be handled in Phase 2.

- [ ] **Step 3: Create a server-side fetch helper for App Router**

Create `lib/api/server.js`:
```javascript
/**
 * Server-side fetch helper that unwraps the standardized response envelope.
 * Use this in Server Components and Route Handlers.
 */
const API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL;

export async function apiFetch(path, options = {}) {
    const url = `${API_URL}${path}`;
    const res = await fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
    });

    if (!res.ok) {
        return { data: null, meta: null, error: res.status };
    }

    const json = await res.json();

    // Unwrap standardized envelope
    if (json && typeof json === 'object' && 'data' in json && 'statusCode' in json) {
        return { data: json.data, meta: json.meta || null, error: null };
    }

    // Fallback for non-wrapped responses
    return { data: json, meta: null, error: null };
}
```

- [ ] **Step 4: Commit**
```bash
git add -A
git commit -m "feat(api): enable TransformInterceptor and add unwrap helpers"
```

---

## Phase 2: Foundation — App Router Scaffolding

> This phase creates the App Router directory structure, migrates the root layout, providers, fonts, and global CSS. Pages Router continues to work during this phase.

### Task 2.1: Create Root Layout

**Files:**
- Create: `app/layout.jsx`
- Move: `styles/globals.css` → `app/globals.css`

- [ ] **Step 1: Create `app/layout.jsx`**

```jsx
import './globals.css';
import { Playfair_Display, JetBrains_Mono, Be_Vietnam_Pro } from 'next/font/google';

const playfair = Playfair_Display({
    subsets: ['latin'],
    variable: '--font-playfair',
    display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
    subsets: ['latin'],
    variable: '--font-jetbrains-mono',
    display: 'swap',
});

const beVietnamPro = Be_Vietnam_Pro({
    subsets: ['latin', 'vietnamese'],
    weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
    variable: '--font-be-vietnam-pro',
    display: 'swap',
});

export const metadata = {
    metadataBase: new URL('https://yunkhngn.dev'),
    title: {
        default: 'Khoa Nguyễn - Software Engineer',
        template: '%s - Khoa Nguyễn',
    },
    description: "I'm Khoa Nguyen (yun.khngn) - a talented software engineering student, self-taught creator, graphic designer, and guitarist/musician.",
    keywords: ['Blog', 'Khoa Nguyen', 'Software Engineer', 'Web Developer', 'React', 'Next.js'],
    authors: [{ name: 'Khoa Nguyễn', url: 'https://yunkhngn.dev' }],
    creator: 'Khoa Nguyễn',
    openGraph: {
        type: 'website',
        locale: 'vi_VN',
        url: 'https://yunkhngn.dev',
        siteName: 'Khoa Nguyen',
        images: [{ url: '/image/thumbnail.jpg', width: 1200, height: 630, alt: 'Khoa Nguyễn' }],
    },
    twitter: {
        card: 'summary_large_image',
    },
    icons: {
        icon: '/favicon.ico',
        apple: '/apple-icon-180x180.png',
    },
    manifest: '/manifest.json',
};

export default function RootLayout({ children }) {
    return (
        <html lang="vi" suppressHydrationWarning>
            <body className={`${playfair.variable} ${jetbrainsMono.variable} ${beVietnamPro.variable} font-sans antialiased`}>
                {children}
            </body>
        </html>
    );
}
```

- [ ] **Step 2: Copy `styles/globals.css` to `app/globals.css`**

```bash
cp styles/globals.css app/globals.css
```

- [ ] **Step 3: Commit**
```bash
git add app/layout.jsx app/globals.css
git commit -m "feat: create App Router root layout with fonts and metadata"
```

### Task 2.2: Create Client Providers Component

**Files:**
- Create: `components/providers/Providers.jsx`

- [ ] **Step 1: Create the Providers wrapper**

This component wraps all client-side providers that were previously in `_app.jsx`. It must be a Client Component.

```jsx
'use client';

import { ThemeProvider } from 'next-themes';
import { AuthProvider } from '@/contexts/AuthContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { FocusModeProvider } from '@/contexts/FocusModeContext';
import { Toaster } from 'sonner';

export default function Providers({ children }) {
    return (
        <AuthProvider>
            <NotificationProvider>
                <FocusModeProvider>
                    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
                        {children}
                        <Toaster position="top-right" offset="80px" />
                    </ThemeProvider>
                </FocusModeProvider>
            </NotificationProvider>
        </AuthProvider>
    );
}
```

- [ ] **Step 2: Wire Providers into root layout**

Update `app/layout.jsx` to wrap `{children}` with `<Providers>`:

```jsx
import Providers from '@/components/providers/Providers';
// ...
<body className={...}>
    <Providers>
        {children}
    </Providers>
</body>
```

- [ ] **Step 3: Commit**
```bash
git add components/providers/Providers.jsx app/layout.jsx
git commit -m "feat: create client Providers component for App Router"
```

### Task 2.3: Create CSP Middleware (Replaces next.config headers)

**Files:**
- Create: `middleware.js` (project root)
- Modify: `next.config.mjs` (remove headers function)

- [ ] **Step 1: Create `middleware.js`**

This replaces the CSP headers previously defined in `next.config.mjs` and adds admin route protection:

```javascript
import { NextResponse } from 'next/server';

export function middleware(request) {
    const response = NextResponse.next();

    // --- Content Security Policy ---
    const csp = [
        "default-src 'self'",
        "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com https://apis.google.com https://cdn.jsdelivr.net",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net",
        "img-src 'self' blob: data: https://res.cloudinary.com https://github.com https://avatars.githubusercontent.com https://lh3.googleusercontent.com https://cataas.com https://placekitten.com https://cdn.buymeacoffee.com https://lastfm.freetls.fastly.net",
        "font-src 'self' https://fonts.gstatic.com https://cdn.jsdelivr.net",
        `connect-src 'self' https://www.google-analytics.com https://api.cloudinary.com https://api.github.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://www.googleapis.com https://yunkhngn.dev https://api.yunkhngn.dev wss://api.yunkhngn.dev ${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}`,
        "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com https://*.firebaseapp.com https://*.spotify.com https://*.music.apple.com https://soundcloud.com https://w.soundcloud.com https://bandcamp.com",
        "worker-src 'self' blob:",
    ].join('; ');

    response.headers.set('Content-Security-Policy', csp);
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

    return response;
}

export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|json)$).*)',
    ],
};
```

- [ ] **Step 2: Remove `headers()` function from `next.config.mjs`**

Delete the entire `async headers() { ... }` block from `next.config.mjs`. Keep `redirects()`, `rewrites()`, `webpack`, and `images`.

- [ ] **Step 3: Commit**
```bash
git add middleware.js next.config.mjs
git commit -m "feat: add CSP middleware, remove CSP from next.config"
```

### Task 2.4: Create Error and Not-Found Pages

**Files:**
- Create: `app/not-found.jsx`
- Create: `app/error.jsx`

- [ ] **Step 1: Create `app/not-found.jsx`**

Port the content from `pages/404.jsx`:

```jsx
import Link from 'next/link';

export const metadata = {
    title: '404 - Page Not Found',
};

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
            <h1 className="text-8xl font-bold font-serif mb-4">404</h1>
            <p className="text-xl text-muted-foreground mb-8">
                The page you're looking for doesn't exist or has been moved.
            </p>
            <Link
                href="/"
                className="inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground px-8 h-12 text-base font-medium hover:bg-primary/90 transition-colors"
            >
                Go Home
            </Link>
        </div>
    );
}
```

- [ ] **Step 2: Create `app/error.jsx`**

```jsx
'use client';

import { useEffect } from 'react';

export default function Error({ error, reset }) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
            <h1 className="text-6xl font-bold font-serif mb-4">Oops!</h1>
            <p className="text-xl text-muted-foreground mb-8">
                Something went wrong. Please try again.
            </p>
            <button
                onClick={() => reset()}
                className="inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground px-8 h-12 text-base font-medium hover:bg-primary/90 transition-colors"
            >
                Try Again
            </button>
        </div>
    );
}
```

- [ ] **Step 3: Commit**
```bash
git add app/not-found.jsx app/error.jsx
git commit -m "feat: add App Router error and not-found pages"
```

### Task 2.5: Create Sitemap and Robots.js

**Files:**
- Create: `app/sitemap.js`
- Create: `app/robots.js`

- [ ] **Step 1: Create `app/sitemap.js`**

Replace the old `pages/sitemap.xml.jsx` with the built-in App Router convention:

```javascript
const API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL;
const BASE_URL = 'https://yunkhngn.dev';

export default async function sitemap() {
    const staticPages = [
        { url: BASE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
        { url: `${BASE_URL}/about`, changeFrequency: 'monthly', priority: 0.8 },
        { url: `${BASE_URL}/blog`, changeFrequency: 'daily', priority: 0.9 },
        { url: `${BASE_URL}/project`, changeFrequency: 'weekly', priority: 0.9 },
        { url: `${BASE_URL}/contact`, changeFrequency: 'monthly', priority: 0.7 },
        { url: `${BASE_URL}/journal`, changeFrequency: 'weekly', priority: 0.9 },
        { url: `${BASE_URL}/photo`, changeFrequency: 'weekly', priority: 0.8 },
        { url: `${BASE_URL}/showcase`, changeFrequency: 'monthly', priority: 0.8 },
        { url: `${BASE_URL}/resume`, changeFrequency: 'monthly', priority: 0.8 },
    ];

    let dynamicPages = [];

    try {
        const [blogsRes, projectsRes] = await Promise.all([
            fetch(`${API_URL}/blogs`, { next: { revalidate: 3600 } }),
            fetch(`${API_URL}/projects`, { next: { revalidate: 3600 } }),
        ]);

        if (blogsRes.ok) {
            const blogsJson = await blogsRes.json();
            const blogs = blogsJson.data || blogsJson;
            dynamicPages.push(
                ...blogs
                    .filter((b) => b.status === 'PUBLISHED')
                    .map((blog) => ({
                        url: `${BASE_URL}/blog/${blog.slug}`,
                        lastModified: new Date(blog.updatedAt || blog.createdAt),
                        changeFrequency: 'weekly',
                        priority: 0.8,
                    }))
            );
        }

        if (projectsRes.ok) {
            const projectsJson = await projectsRes.json();
            const projects = projectsJson.data || projectsJson;
            dynamicPages.push(
                ...projects.map((project) => ({
                    url: `${BASE_URL}/project/${project.slug}`,
                    lastModified: new Date(project.updatedAt || project.createdAt),
                    changeFrequency: 'monthly',
                    priority: 0.8,
                }))
            );
        }
    } catch (error) {
        console.error('Failed to fetch dynamic sitemap data:', error);
    }

    return [...staticPages, ...dynamicPages];
}
```

- [ ] **Step 2: Create `app/robots.js`**

```javascript
export default function robots() {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: '/admin/',
        },
        sitemap: 'https://yunkhngn.dev/sitemap.xml',
    };
}
```

- [ ] **Step 3: Commit**
```bash
git add app/sitemap.js app/robots.js
git commit -m "feat: add built-in sitemap.js and robots.js"
```

---

## Phase 3: Migrate Public Pages

> Migrate all public-facing pages from `pages/` to `app/(public)/`. Each page is a separate task.

### Task 3.1: Create Public Layout

**Files:**
- Create: `app/(public)/layout.jsx`

- [ ] **Step 1: Create the public layout**

This replaces the `DefaultLayout` pattern used via `getLayout` in Pages Router:

```jsx
import DefaultNavbar from '@/components/template/Default/Navbar';
import DefaultFooter from '@/components/template/Default/Footer';
import InteractiveBackground from '@/components/ui/InteractiveBackground';
import LiveActivityContainer from '@/components/live/LiveActivityContainer';
import FloatingControls from '@/components/ui/FloatingControls';
import { CommandMenu } from '@/components/ui/CommandMenu';
import CookieConsent from '@/components/ui/CookieConsent';
import GoogleAnalytics from '@/components/seo/GoogleAnalytics';
import ClientShell from './ClientShell';

export default function PublicLayout({ children }) {
    return (
        <ClientShell>
            <GoogleAnalytics />
            <div className="flex flex-col min-h-screen font-sans bg-background text-foreground relative">
                <div className="absolute top-0 left-0 w-full h-screen overflow-hidden z-0">
                    <InteractiveBackground />
                </div>
                <DefaultNavbar />
                <main className="flex-1 relative z-10">
                    {children}
                </main>
                <DefaultFooter />
                <LiveActivityContainer />
            </div>
            <FloatingControls />
            <CommandMenu />
            <CookieConsent />
        </ClientShell>
    );
}
```

- [ ] **Step 2: Create `app/(public)/ClientShell.jsx`**

This thin client wrapper handles focus mode visibility:

```jsx
'use client';

import { useFocusMode } from '@/contexts/FocusModeContext';
import ErrorBoundary from '@/components/shared/ErrorBoundary';

export default function ClientShell({ children }) {
    return (
        <ErrorBoundary>
            {children}
        </ErrorBoundary>
    );
}
```

- [ ] **Step 3: Commit**
```bash
git add app/(public)/layout.jsx app/(public)/ClientShell.jsx
git commit -m "feat: create public route group layout"
```

### Task 3.2: Migrate Homepage

**Files:**
- Create: `app/(public)/page.jsx`

- [ ] **Step 1: Create homepage as Server Component**

Convert the existing `pages/index.jsx` (which uses `getStaticProps`) into a Server Component with `fetch()` calls at the top level. Move interactive sections (Terminal, SocialLinks) into separate Client Components.

The homepage currently fetches blogs, projects, gallery, settings, and GitHub repos via `getStaticProps` with ISR (revalidate: 120). In App Router, use `fetch()` with `next: { revalidate: 120 }`.

```jsx
import { apiFetch } from '@/lib/api/server';
import HomeContent from './HomeContent';

export const revalidate = 120;

export const metadata = {
    title: 'Khoa Nguyễn - Software Engineer',
    description: "I'm Khoa Nguyen (yun.khngn) - a talented software engineering student, self-taught creator, graphic designer, and guitarist/musician.",
};

export default async function HomePage() {
    const [blogsResult, projectsResult, galleryResult, settingsResult, reposResult] = await Promise.all([
        apiFetch('/blogs'),
        apiFetch('/projects'),
        apiFetch('/gallery'),
        apiFetch('/settings'),
        apiFetch('/admin/github/repos'),
    ]);

    const blogs = Array.isArray(blogsResult.data) ? blogsResult.data : [];
    const recentBlogs = blogs.filter(b => b.status === 'PUBLISHED').slice(0, 3);

    const projects = Array.isArray(projectsResult.data) ? projectsResult.data : [];
    const featuredProjects = projects.map(p => {
        let techStack = p.techStack;
        if (typeof techStack === 'string') {
            try { techStack = JSON.parse(techStack); } catch { techStack = []; }
        }
        return { ...p, techStack };
    }).slice(0, 5);

    const galleryRaw = galleryResult.data;
    const photos = Array.isArray(galleryRaw) ? galleryRaw : (galleryRaw?.data || []);
    const galleryPhotos = photos.slice(0, 12);

    const settingsArr = Array.isArray(settingsResult.data) ? settingsResult.data : [];
    const settings = settingsArr.reduce((acc, curr) => {
        acc[curr.settingTitle] = curr.content;
        return acc;
    }, {});

    const reposArr = Array.isArray(reposResult.data) ? reposResult.data : [];
    const featuredRepos = reposArr.sort((a, b) => b.stargazers_count - a.stargazers_count).slice(0, 9);

    return (
        <HomeContent
            recentBlogs={recentBlogs}
            featuredProjects={featuredProjects}
            galleryPhotos={galleryPhotos}
            settings={settings}
            featuredRepos={featuredRepos}
        />
    );
}
```

- [ ] **Step 2: Create `app/(public)/HomeContent.jsx`**

Extract the JSX from `pages/index.jsx` into a Client Component (it needs `useMemo`, `useEffect`, framer-motion, etc.). Add `'use client'` at top. Remove `getStaticProps` and `getLayout`.

- [ ] **Step 3: Smoke test**

```bash
npm run dev
# Navigate to http://localhost:3000
# Verify: homepage loads, terminal works, images load, links work
```

- [ ] **Step 4: Commit**
```bash
git add app/(public)/page.jsx app/(public)/HomeContent.jsx
git commit -m "feat: migrate homepage to App Router Server Component"
```

### Task 3.3: Migrate Blog Pages

**Files:**
- Create: `app/(public)/blog/page.jsx`
- Create: `app/(public)/blog/BlogList.jsx` (client component)
- Create: `app/(public)/blog/[slug]/page.jsx`
- Create: `app/(public)/blog/[slug]/BlogDetail.jsx` (client component)

- [ ] **Step 1: Create blog list page**

The blog list is currently a **fully client-side** page (fetches in useEffect). Keep it as a Client Component but wrap in a Server Component for metadata:

```jsx
// app/(public)/blog/page.jsx
import BlogList from './BlogList';

export const metadata = {
    title: 'Blog',
    description: 'Sharing my thoughts and experiences on web development, technology, and life.',
};

export default function BlogPage() {
    return <BlogList />;
}
```

- [ ] **Step 2: Move blog list component**

Copy `pages/blog/index.jsx` content to `app/(public)/blog/BlogList.jsx`:
- Add `'use client'` directive
- Replace `useRouter` from `next/router` with `next/navigation` (`useRouter`, `useSearchParams`, `usePathname`)
- Remove `getLayout`

- [ ] **Step 3: Create blog detail page with `generateMetadata`**

The blog detail page currently uses `getServerSideProps`. Convert to App Router with `generateMetadata`:

```jsx
// app/(public)/blog/[slug]/page.jsx
import { apiFetch } from '@/lib/api/server';
import { notFound } from 'next/navigation';
import BlogDetail from './BlogDetail';
import { extractTextFromTipTap, stripHtml } from '@/lib/utils';

export async function generateMetadata({ params }) {
    const { slug } = await params;
    const { data: blog } = await apiFetch(`/blogs/${slug}`);
    if (!blog) return { title: 'Blog Not Found' };

    const description = blog.seoDescription || blog.description ||
        (blog.contentJSON ? extractTextFromTipTap(blog.contentJSON).substring(0, 160) : '');

    return {
        title: blog.seoTitle || blog.title,
        description,
        openGraph: {
            title: blog.seoTitle || blog.title,
            description,
            type: 'article',
            publishedTime: blog.createdAt,
            modifiedTime: blog.updatedAt,
            images: blog.seoImage || blog.thumbnail ? [{ url: blog.seoImage || blog.thumbnail }] : [],
        },
    };
}

export default async function BlogDetailPage({ params }) {
    const { slug } = await params;
    const { data: blog } = await apiFetch(`/blogs/${slug}`);

    if (!blog) notFound();

    // Calculate reading time
    let cleanContent = '';
    if (blog.contentJSON) cleanContent = extractTextFromTipTap(blog.contentJSON);
    else if (blog.content) cleanContent = stripHtml(blog.content);

    const wordCount = cleanContent.trim().split(/\s+/).length;
    const readingTime = Math.max(1, Math.ceil(wordCount / 200));

    const description = blog.description || (cleanContent.length > 300 ? cleanContent.substring(0, 297) + '...' : cleanContent);

    return (
        <BlogDetail
            blogData={{
                ...blog,
                description,
                readingTime,
            }}
        />
    );
}
```

- [ ] **Step 4: Move blog detail client component**

Copy `pages/blog/[slug].jsx` to `app/(public)/blog/[slug]/BlogDetail.jsx`:
- Add `'use client'`
- Replace `useRouter` from `next/router` → `next/navigation`
- Remove `getServerSideProps` and `getLayout`
- Remove `<Metadata>` and `<Head>` components (handled by `generateMetadata`)

- [ ] **Step 5: Smoke test both blog pages**
```bash
npm run dev
# Test /blog and /blog/[any-slug]
```

- [ ] **Step 6: Commit**
```bash
git add app/(public)/blog/
git commit -m "feat: migrate blog pages to App Router"
```

### Task 3.4: Migrate Remaining Public Pages

Each page follows the same pattern. For brevity, I list all pages and their approach:

**Files:**
- Create pages for: `about`, `contact`, `journal`, `photo`, `project/*`, `letter/[code]`, `s/[code]`, `login`, `resume`, `search`, `showcase`, `privacy`, `terms`

- [ ] **Step 1: Migrate static/simple pages**

Pages that are mostly static or only have client-side interactivity:

| Old Path | New Path | Strategy |
|---|---|---|
| `pages/about.jsx` | `app/(public)/about/page.jsx` | Client Component (heavy animations) |
| `pages/contact.jsx` | `app/(public)/contact/page.jsx` | Client Component (form) |
| `pages/login.jsx` | `app/(public)/login/page.jsx` | Client Component (auth) |
| `pages/resume.jsx` | `app/(public)/resume/page.jsx` | Client Component (minimal) |
| `pages/search.jsx` | `app/(public)/search/page.jsx` | Client Component (dynamic) |
| `pages/showcase.jsx` | `app/(public)/showcase/page.jsx` | Client Component |
| `pages/privacy.jsx` | `app/(public)/privacy/page.jsx` | Server Component (static text) |
| `pages/terms.jsx` | `app/(public)/terms/page.jsx` | Server Component (static text) |

For each:
1. Create `app/(public)/<name>/page.jsx` with `export const metadata = { ... }`
2. If mostly client-side, create a separate Client Component and import it
3. Replace `useRouter` from `next/router` → `next/navigation`
4. Remove `getLayout`

- [ ] **Step 2: Migrate data-fetching pages**

| Old Path | New Path | Strategy |
|---|---|---|
| `pages/journal.jsx` | `app/(public)/journal/page.jsx` | Client Component (complex state) |
| `pages/photo.jsx` | `app/(public)/photo/page.jsx` | Client Component (gallery interactions) |
| `pages/project/index.jsx` | `app/(public)/project/page.jsx` | Client Component |
| `pages/project/[id].jsx` | `app/(public)/project/[id]/page.jsx` | Server Component + Client detail |

- [ ] **Step 3: Migrate dynamic route pages**

| Old Path | New Path | Strategy |
|---|---|---|
| `pages/letter/[code].jsx` | `app/(public)/letter/[code]/page.jsx` | Client Component |
| `pages/s/[code].jsx` | `app/(public)/s/[code]/page.jsx` | Server Component (redirect) |

- [ ] **Step 4: Test all public pages**
```bash
npm run dev
# Systematically visit each page and verify functionality
```

- [ ] **Step 5: Commit**
```bash
git add app/(public)/
git commit -m "feat: migrate all public pages to App Router"
```

---

## Phase 4: Migrate Admin Pages

> Admin pages are fully client-side. They all use the `AdminLayout` pattern.

### Task 4.1: Create Admin Layout

**Files:**
- Create: `app/(admin)/layout.jsx`
- Create: `app/(admin)/admin/layout.jsx`

- [ ] **Step 1: Create admin route group layout**

```jsx
// app/(admin)/layout.jsx
export default function AdminRootLayout({ children }) {
    return children;
}
```

```jsx
// app/(admin)/admin/layout.jsx
import AdminLayoutClient from './AdminLayoutClient';

export const metadata = {
    robots: 'noindex, nofollow',
};

export default function AdminLayout({ children }) {
    return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
```

- [ ] **Step 2: Create `app/(admin)/admin/AdminLayoutClient.jsx`**

```jsx
'use client';

import AdminNavbar from '@/components/template/Admin/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminLayoutClient({ children }) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && (!user || user.role !== 'ADMIN')) {
            router.push('/');
        }
    }, [user, loading, router]);

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    if (!user || user.role !== 'ADMIN') return null;

    return (
        <div className="flex flex-col min-h-screen font-sans bg-background">
            <AdminNavbar />
            <main className="flex-1 p-1 md:p-8 mt-4 mb-24">
                <div className="mx-2 md:container md:mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
```

- [ ] **Step 3: Commit**
```bash
git add app/(admin)/
git commit -m "feat: create admin route group with auth-protected layout"
```

### Task 4.2: Migrate Admin Pages

**Files:**
- Create all admin page files under `app/(admin)/admin/`

- [ ] **Step 1: Migrate all admin pages**

All admin pages are Client Components. The migration pattern is:
1. Create `app/(admin)/admin/<name>/page.jsx`
2. Copy content from `pages/admin/<name>.jsx`
3. Add `'use client'` directive
4. Replace `useRouter` from `next/router` → `next/navigation`
5. Remove `AdminLayout` wrapper (now handled by route group layout)
6. Remove any `getLayout` pattern

Pages to migrate:
- `dashboard` → `app/(admin)/admin/dashboard/page.jsx`
- `blog/index` → `app/(admin)/admin/blog/page.jsx`
- `blog/new` → `app/(admin)/admin/blog/new/page.jsx`
- `blog/[id]` → `app/(admin)/admin/blog/[id]/page.jsx`
- `blog/[id]/edit` → `app/(admin)/admin/blog/[id]/edit/page.jsx`
- `project/index` → `app/(admin)/admin/project/page.jsx`
- `project/add-project` → `app/(admin)/admin/project/add-project/page.jsx`
- `project/[slug]` → `app/(admin)/admin/project/[slug]/page.jsx`
- `project/edit-project/[slug]` → `app/(admin)/admin/project/edit-project/[slug]/page.jsx`
- `photo` → `app/(admin)/admin/photo/page.jsx`
- `journal` → `app/(admin)/admin/journal/page.jsx`
- `letters` → `app/(admin)/admin/letters/page.jsx`
- `comments` → `app/(admin)/admin/comments/page.jsx`
- `contact` → `app/(admin)/admin/contact/page.jsx`
- `notifications` → `app/(admin)/admin/notifications/page.jsx`
- `settings` → `app/(admin)/admin/settings/page.jsx`
- `profile` → `app/(admin)/admin/profile/page.jsx`
- `media` → `app/(admin)/admin/media/page.jsx`
- `shortlinks` → `app/(admin)/admin/shortlinks/page.jsx`
- `chat` → `app/(admin)/admin/chat/page.jsx`
- `newsletter/index` → `app/(admin)/admin/newsletter/page.jsx`

- [ ] **Step 2: Test admin dashboard and key CRUD flows**
```bash
npm run dev
# Login → Dashboard → Create blog → Edit blog → Delete
```

- [ ] **Step 3: Commit**
```bash
git add app/(admin)/
git commit -m "feat: migrate all admin pages to App Router"
```

---

## Phase 5: Cleanup & Config Updates

### Task 5.1: Delete Pages Router Files

**Files:**
- Delete: entire `pages/` directory
- Delete: `styles/globals.css` (now at `app/globals.css`)

- [ ] **Step 1: Remove old Pages Router files**
```bash
rm -rf pages/
rm styles/globals.css
rmdir styles/ 2>/dev/null || true
```

- [ ] **Step 2: Clean up next.config.mjs**

Remove the `headers()` function (moved to middleware), remove duplicate `github.com` remote pattern, keep `redirects()`, `rewrites()`, `webpack`, and `images`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    images: {
        remotePatterns: [
            { protocol: 'https', hostname: 'res.cloudinary.com', pathname: '/**' },
            { protocol: 'https', hostname: 'github.com', pathname: '/**' },
            { protocol: 'https', hostname: 'cataas.com', pathname: '/cat' },
            { protocol: 'https', hostname: 'placekitten.com', pathname: '/**' },
            { protocol: 'https', hostname: 'avatars.githubusercontent.com', pathname: '/**' },
            { protocol: 'https', hostname: 'lh3.googleusercontent.com', pathname: '/**' },
            { protocol: 'https', hostname: 'cdn.buymeacoffee.com', pathname: '/**' },
            { protocol: 'https', hostname: 'lastfm.freetls.fastly.net', pathname: '/i/u/**' },
        ],
    },
    async redirects() {
        return [
            {
                source: '/admin',
                destination: '/admin/dashboard',
                permanent: true,
            },
        ];
    },
    async rewrites() {
        return [
            {
                source: '/lastfm/widget',
                destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/lastfm/widget`,
            },
        ];
    },
};

export default nextConfig;
```

Note: The `webpack` alias for highlight.js should no longer be needed — test and remove. The `path` and `fileURLToPath` imports can also be removed.

- [ ] **Step 3: Remove Dockerfile (no longer self-hosting)**

Since frontend is now on Vercel, the `Dockerfile` and `.dockerignore` are no longer needed:
```bash
rm Dockerfile .dockerignore
```

- [ ] **Step 4: Update CI/CD**

Replace `.github/workflows/ci-cd.yml` — remove the Docker build job and replace with Vercel deployment (or remove entirely if using Vercel's GitHub integration):

```yaml
name: CI (Frontend)

on:
  push:
    branches: [ "*" ]
  pull_request:
    branches: [ "*" ]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Enable Corepack
        run: corepack enable

      - name: Install Dependencies
        run: yarn install --immutable

      - name: Lint
        run: yarn lint

      - name: Test
        run: |
          export JEST_JUNIT_OUTPUT_DIR="reports"
          export JEST_JUNIT_OUTPUT_NAME="fe-test-report.xml"
          yarn test --passWithNoTests

  security:
    runs-on: ubuntu-latest
    name: Security Scan
    steps:
      - uses: actions/checkout@v4
      - name: Semgrep
        uses: returntocorp/semgrep-action@v1
        with:
          config: p/default
```

- [ ] **Step 5: Commit**
```bash
git add -A
git commit -m "chore: remove Pages Router, clean up config, update CI"
```

### Task 5.2: Clean Up Dead Components and Imports

**Files:**
- Modify: various component files
- Delete: unnecessary files

- [ ] **Step 1: Remove `components/template/Metadata.jsx`**

The `<Head>`-based Metadata component is no longer needed since App Router uses `export const metadata` and `generateMetadata()`.

```bash
rm components/template/Metadata.jsx
```

- [ ] **Step 2: Update `components/template/index.js` exports**

Remove the `Metadata` export. Update any remaining imports across the codebase.

- [ ] **Step 3: Remove `components/shared/Layout.js`**

If this is a duplicate/unused layout component, remove it.

- [ ] **Step 4: Remove `next-nprogress-bar` usage**

App Router handles loading states differently (via `loading.jsx` files). Remove the ProgressBar:
- Remove from `Providers.jsx`
- Verify it's not imported elsewhere

- [ ] **Step 5: Add `loading.jsx` files for key routes**

```jsx
// app/(public)/blog/loading.jsx
export default function Loading() {
    return (
        <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
    );
}
```

Create similar loading files for: `app/(public)/blog/[slug]/loading.jsx`, `app/(public)/project/loading.jsx`, `app/(admin)/admin/dashboard/loading.jsx`.

- [ ] **Step 6: Commit**
```bash
git add -A
git commit -m "chore: remove dead components, add loading states"
```

### Task 5.3: Upgrade Dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Remove unused dependencies**

```bash
yarn remove next-nprogress-bar
```

- [ ] **Step 2: Update outdated dependencies**

```bash
yarn up next@latest react@latest react-dom@latest
yarn up eslint-config-next@latest
yarn up framer-motion@latest
yarn up @tiptap/react@latest @tiptap/starter-kit@latest @tiptap/extension-*@latest
yarn up sonner@latest lucide-react@latest
yarn up tailwindcss@latest autoprefixer@latest postcss@latest
```

- [ ] **Step 3: Run build to verify**

```bash
yarn build
```

Fix any build errors.

- [ ] **Step 4: Run tests**

```bash
yarn test --passWithNoTests
```

- [ ] **Step 5: Commit**
```bash
git add package.json yarn.lock
git commit -m "chore: upgrade dependencies, remove unused packages"
```

---

## Phase 6: Security & Environment Hardening

### Task 6.1: Audit Environment Variables

**Files:**
- Modify: `.env.example`
- Modify: `.env.local`

- [ ] **Step 1: Add server-only env var for internal API calls**

Create a non-`NEXT_PUBLIC_` variable for server-side API calls. This prevents the API URL from leaking to the client bundle for SSR calls:

Add to `.env.local`:
```
API_URL=https://api.yunkhngn.dev
```

Update `.env.example` accordingly.

- [ ] **Step 2: Update `lib/api/server.js` to use server-only env var**

```diff
- const API_URL = process.env.NEXT_PUBLIC_API_URL;
+ const API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL;
```

- [ ] **Step 3: Audit all `NEXT_PUBLIC_` vars**

Ensure no secrets are exposed. Currently exposed (and correct):
- `NEXT_PUBLIC_API_URL` — public API endpoint ✅
- `NEXT_PUBLIC_FIREBASE_*` — Firebase client config (by design, public) ✅
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` — public ✅
- `NEXT_PUBLIC_CLOUDINARY_API_KEY` — public API key (not secret) ✅
- `NEXT_PUBLIC_GA_ID` — public ✅
- **Gemini:** không dùng biến `NEXT_PUBLIC_*` trên FE; chỉ `GEMINI_API_KEY` trên backend (`yunkhngn-be/.env.example`) và/hoặc cài đặt `gemini_api_key` trong Admin.

- [ ] **Step 4: Commit**
```bash
git add .env.example .env.local lib/api/server.js
git commit -m "security: audit env vars, move Gemini key server-side"
```

### Task 6.2: Final Verification

- [ ] **Step 1: Full build verification**
```bash
yarn build
```

- [ ] **Step 2: Run dev and test all critical paths**

Checklist:
- [ ] Homepage loads with blogs, projects, gallery, terminal
- [ ] Blog list page with filtering and pagination
- [ ] Blog detail page with comments, SEO meta tags
- [ ] Project list and detail pages
- [ ] Photo gallery page
- [ ] Journal page
- [ ] Admin login flow
- [ ] Admin dashboard with system stats
- [ ] Admin blog CRUD
- [ ] Admin project CRUD
- [ ] Admin photo management
- [ ] Admin settings page
- [ ] Sitemap at `/sitemap.xml`
- [ ] Robots at `/robots.txt`
- [ ] 404 page for invalid routes
- [ ] CSP headers present in response

- [ ] **Step 3: Deploy to Vercel preview**
```bash
git push
# Verify Vercel preview deployment succeeds
```

- [ ] **Step 4: Final commit**
```bash
git add -A
git commit -m "chore: complete App Router migration"
```
