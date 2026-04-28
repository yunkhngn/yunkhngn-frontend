# Docker Container Monitor & Dashboard Performance

**Date:** 2026-04-29
**Scope:** New monitor-agent sidecar, `/admin/monitor` page, dashboard performance fixes

---

## 1. Overview

Two related improvements to the admin dashboard:

1. **Docker Container Monitor** — Real-time container log streaming and health monitoring via a new sidecar container and dedicated admin page
2. **Dashboard Performance** — Fix slow initial load by consolidating API calls and optimizing polling behavior

---

## 2. Architecture

### 2.1 Monitor Agent (Sidecar Container)

A lightweight Node.js service that mounts the Docker socket and exposes internal REST + WebSocket APIs.

```
┌─────────────────────────────────────────────────────────┐
│ VPS (Docker Host)                                       │
│                                                         │
│  ┌──────────┐    ┌──────────┐    ┌──────────────────┐   │
│  │ Frontend │───▶│ Backend  │───▶│  Monitor Agent   │   │
│  │ (Vercel) │ WS │ (NestJS) │HTTP│  (Fastify+       │   │
│  │          │    │ port:3001│ /WS│   dockerode)      │   │
│  └──────────┘    └──────────┘    │  port:9100        │   │
│                   app-network    │  app-network       │   │
│                                  │                    │   │
│                                  │  /var/run/docker   │   │
│                                  │   .sock mounted    │   │
│                                  └──────────────────┘   │
│                                                         │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌──────┐ ┌───────┐   │
│  │backend │ │  mssql │ │ redis  │ │caddy │ │ai-svc │   │
│  └────────┘ └────────┘ └────────┘ └──────┘ └───────┘   │
└─────────────────────────────────────────────────────────┘
```

**Why a sidecar, not in backend:**
- Backend runs as non-root user `nestjs` — cannot access Docker socket without privilege escalation
- Separation of concerns: monitor agent has Docker access, backend has auth logic
- Monitor agent is optional — removing it doesn't affect the main app

### 2.2 Data Flow

```
Frontend                    Backend (NestJS)              Monitor Agent
   │                            │                              │
   │── GET /monitor/containers ─▶── GET :9100/containers ─────▶│
   │◀── [{id,name,status,...}] ─┤◀── [{id,name,status,...}] ──┤
   │                            │                              │
   │── WS /monitor/logs ───────▶── WS :9100/logs?id=xxx ─────▶│
   │    {containerId: xxx}      │                              │
   │◀── stream log lines ──────┤◀── docker.logs({follow}) ───┤
   │                            │                              │
```

---

## 3. Monitor Agent Service

**Location:** `/yunkhngn-infra/monitor-agent/`

**Tech stack:**
- Node.js 20 Alpine
- Fastify for REST endpoints
- `ws` (native WebSocket) for log streaming
- `dockerode` for Docker Engine API

### 3.1 REST Endpoints (internal only, port 9100)

| Endpoint | Method | Response |
|----------|--------|----------|
| `/containers` | GET | List all containers with status, image, created, ports, state |
| `/containers/:id` | GET | Single container detail with resource stats (CPU/RAM) |
| `/containers/:id/logs` | GET | Last N log lines (query param `tail`, default 100) |

### 3.2 WebSocket Endpoint

| Path | Description |
|------|-------------|
| `/logs?containerId=xxx&tail=100` | Stream real-time logs for a container. Initial burst of `tail` lines, then follow mode. |

**WebSocket message format:**
```json
{
  "type": "log",
  "containerId": "abc123",
  "stream": "stdout",
  "timestamp": "2026-04-29T02:30:00.000Z",
  "message": "Server started on port 3001"
}
```

**Error/disconnect messages:**
```json
{
  "type": "error",
  "message": "Container not found"
}
```

### 3.3 Docker Compose Addition

```yaml
monitor-agent:
  build: ./monitor-agent
  container_name: yunkhngn-monitor
  restart: always
  volumes:
    - /var/run/docker.sock:/var/run/docker.sock:ro
  networks:
    - app-network
  environment:
    - PORT=9100
```

The socket is mounted **read-only** (`:ro`) — agent can read logs and stats but cannot start/stop containers.

### 3.4 Security

- Port 9100 is **not exposed** to host — only accessible via `app-network`
- Backend authenticates requests before proxying to agent
- Docker socket is read-only
- Agent does not accept external connections

---

## 4. Backend Changes (NestJS)

### 4.1 New Monitor Module

**Files:**
- `src/modules/monitor/monitor.module.ts`
- `src/modules/monitor/monitor.controller.ts`
- `src/modules/monitor/monitor.service.ts`
- `src/modules/monitor/monitor.gateway.ts`

### 4.2 REST Endpoints (auth-guarded)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/monitor/containers` | GET | Proxy to agent `/containers` |
| `/monitor/containers/:id` | GET | Proxy to agent `/containers/:id` |

### 4.3 WebSocket Gateway

Extend the existing Socket.IO setup (same pattern as `NotificationsGateway`):

```typescript
@WebSocketGateway({ cors: { origin: '*' } })
export class MonitorGateway {
  @SubscribeMessage('monitor:subscribe')
  handleSubscribe(client: Socket, payload: { containerId: string }) {
    // Open WS connection to monitor-agent
    // Pipe log messages back to client
  }

  @SubscribeMessage('monitor:unsubscribe')
  handleUnsubscribe(client: Socket, payload: { containerId: string }) {
    // Close upstream connection
  }
}
```

### 4.4 Environment Variable

```env
MONITOR_AGENT_URL=http://monitor-agent:9100
```

Added to `docker-compose.yml` backend service environment.

---

## 5. Frontend — Monitor Page

**Route:** `/admin/monitor`

### 5.1 Layout (Tab-Based)

```
┌─────────────────────────────────────────────────────┐
│  Container Monitor                    [Auto-refresh] │
│                                                      │
│  ┌─────────────────────────────────────────────────┐ │
│  │ Overview │ backend │ mssql │ redis │ caddy │ ai │ │
│  └─────────────────────────────────────────────────┘ │
│                                                      │
│  [Overview Tab]                                      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐            │
│  │ 🟢 backend│ │ 🟢 mssql │ │ 🟢 redis │            │
│  │ 2d 4h up │ │ 5d up    │ │ 5d up    │            │
│  │ CPU: 12% │ │ CPU: 3%  │ │ CPU: 1%  │            │
│  │ RAM: 210M│ │ RAM: 1.2G│ │ RAM: 45M │            │
│  └──────────┘ └──────────┘ └──────────┘            │
│  ┌──────────┐ ┌──────────┐ ┌──────────────────┐    │
│  │ 🟢 caddy │ │ 🟢 ai-svc│ │ 🟢 monitor-agent │    │
│  │ 5d up    │ │ 5d up    │ │ 0d up            │    │
│  │ CPU: 0%  │ │ CPU: 5%  │ │ CPU: 0%          │    │
│  └──────────┘ └──────────┘ └──────────────────┘    │
│                                                      │
│  [Container Tab - e.g. "backend"]                    │
│  ┌─────────────────────────────────────────────────┐ │
│  │ Filter: [All ▾] [Error ▾]   Search: [________] │ │
│  │ [Auto-scroll ✓] [Pause] [Clear]                 │ │
│  ├─────────────────────────────────────────────────┤ │
│  │ 02:30:01  [INFO]  Server started on port 3001   │ │
│  │ 02:30:02  [INFO]  Database connected             │ │
│  │ 02:30:05  [ERROR] Failed to connect to Redis ◀── red highlight │
│  │ 02:30:06  [WARN]  Retrying connection...         │ │
│  │ 02:30:07  [INFO]  Redis reconnected              │ │
│  │ ...                                              │ │
│  │                                          ▼ tail  │ │
│  └─────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

### 5.2 Features

**Overview tab:**
- Grid of container cards showing: name, status (color-coded dot), uptime, CPU %, RAM usage
- Cards are clickable → switch to that container's tab
- Auto-refresh container stats every 5 seconds
- Containers with status `!= running` show red border + alert

**Container log tab:**
- Real-time log stream via WebSocket (Socket.IO through backend)
- **Error highlighting**: Lines containing `error`, `Error`, `ERR`, `exception`, `FATAL`, `panic` → red background
- **Warning highlighting**: Lines containing `warn`, `WARN`, `Warning` → yellow/amber background
- **Filter dropdown**: All / Errors only / Warnings only / stdout / stderr
- **Search**: Client-side text search through buffered log lines
- **Auto-scroll**: Enabled by default, pauses when user scrolls up, resume button at bottom
- **Log buffer**: Keep last 1000 lines in memory, older lines are discarded
- **Tail param**: Initial load fetches last 200 lines, then streams new ones

### 5.3 Files

- `app/(admin)/admin/monitor/page.jsx` — server component with metadata
- `app/(admin)/admin/monitor/MonitorClient.jsx` — main client component
- `components/admin/monitor/ContainerCard.jsx` — overview card
- `components/admin/monitor/LogViewer.jsx` — log stream viewer with controls
- `components/admin/monitor/LogLine.jsx` — single log line with highlighting

### 5.4 Dashboard Widget

Add a small "Container Status" card to the existing dashboard:

```
┌──────────────────────────────┐
│ 🐳 Containers         View → │
│                              │
│ 🟢 backend  🟢 mssql        │
│ 🟢 redis    🟢 caddy        │
│ 🟢 ai-svc   🟢 monitor      │
│                              │
│ All 6 containers running     │
└──────────────────────────────┘
```

If any container is down → card turns red with alert text.

---

## 6. Dashboard Performance Fixes

### 6.1 Problem

Current dashboard fetches 6 API endpoints on load:
- `/blogs` — returns ALL blogs, then `.slice(0, 5)` on client
- `/projects` — returns ALL projects
- `/gallery` — returns ALL photos
- `/comments?limit=1` — just for count
- `/contact` — returns ALL contacts
- `/admin/analytics?period=24h` — analytics data

Plus system stats polling every 2 seconds.

### 6.2 Solution: Consolidated Dashboard Stats Endpoint

**New backend endpoint:** `GET /admin/dashboard-stats`

Returns all dashboard data in a single response with proper limits:

```json
{
  "stats": {
    "blogs": 42,
    "blogsPublished": 35,
    "blogsDraft": 7,
    "projects": 12,
    "gallery": 156,
    "comments": 89,
    "mailTotal": 34,
    "mailReceived": 20,
    "mailSent": 14
  },
  "recentBlogs": [],
  "recentProjects": [],
  "recentPhotos": [],
  "recentContacts": [],
  "activityFeed": [],
  "activityTimeline": []
}
```

**Benefits:**
- 1 request instead of 6
- Server does the aggregation, filtering, and limiting
- Only returns fields the dashboard actually needs (no full blog content)
- Can be cached in Redis for 30s

### 6.3 System Stats Polling Optimization

**Changes:**
1. Increase polling interval from **2s → 5s** (CPU/RAM values don't need sub-5s updates)
2. Use **Page Visibility API** — pause polling when browser tab is not active
3. Use **IntersectionObserver** — pause polling when system stats section is scrolled out of view

### 6.4 Backend Implementation

**New files:**
- `src/modules/system/dashboard.controller.ts` — consolidated endpoint
- `src/modules/system/dashboard.service.ts` — aggregation logic

The service will use Prisma `count()` and `findMany({ take: N, select: {...} })` instead of fetching everything.

### 6.5 Frontend Changes

- Replace 6 `fetch()` calls with single `GET /admin/dashboard-stats`
- Add visibility-based polling for system stats
- Analytics data fetched separately (only on period change) since it has its own dropdown

---

## 7. Navigation Updates

Add "Monitor" to the admin navbar with a small status indicator dot (green/red) based on whether all containers are healthy.

---

## 8. Error Handling

| Scenario | Behavior |
|----------|----------|
| Monitor agent is down | Dashboard widget shows "Monitor offline" gray state. Monitor page shows connection error with retry button. |
| WebSocket disconnects | Auto-reconnect with exponential backoff (1s, 2s, 4s, max 30s). Show "Reconnecting..." banner. |
| Container not found | Show error in log viewer, allow switching to another container. |
| Backend can't reach agent | Return 503 with message. Frontend shows inline error. |

---

## 9. Files Changed Summary

### New (Monitor Agent — `/yunkhngn-infra/monitor-agent/`)
- `package.json`
- `Dockerfile`
- `src/index.js` — Fastify server + WS setup
- `src/docker.js` — dockerode wrapper

### New (Backend)
- `src/modules/monitor/monitor.module.ts`
- `src/modules/monitor/monitor.controller.ts`
- `src/modules/monitor/monitor.service.ts`
- `src/modules/monitor/monitor.gateway.ts`
- `src/modules/system/dashboard.controller.ts`
- `src/modules/system/dashboard.service.ts`

### New (Frontend)
- `app/(admin)/admin/monitor/page.jsx`
- `app/(admin)/admin/monitor/MonitorClient.jsx`
- `components/admin/monitor/ContainerCard.jsx`
- `components/admin/monitor/LogViewer.jsx`
- `components/admin/monitor/LogLine.jsx`

### Modified
- `yunkhngn-infra/docker-compose.yml` — add monitor-agent service + backend env
- `yunkhngn-be/src/app.module.ts` — import MonitorModule
- `yunkhngn-fe/app/(admin)/admin/dashboard/DashboardClient.jsx` — use consolidated endpoint + polling fixes
- Admin Navbar component — add Monitor nav link
