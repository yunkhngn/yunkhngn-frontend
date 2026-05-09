# Vercel Analytics & Speed Insights Integration

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Display Vercel Web Analytics (visitors, pageviews, bounce rate) and Speed Insights (Real Experience Score, Core Web Vitals) in the admin dashboard.

**Architecture:** Vercel has NO public REST API for analytics data. We use Vercel's internal API (`https://vercel.com/api/web/insights`) which powers their own dashboard. The backend proxies requests using a Vercel API token + project ID stored in the Settings DB. Frontend adds two new admin pages following the existing Cloudflare analytics pattern.

**Tech Stack:** NestJS (backend), Next.js (frontend), Prisma (settings), Recharts (charts)

**Key Vercel Internal API Endpoints:**
- `GET https://vercel.com/api/web/insights/stats?projectId=X&from=X&to=X` — visitors, pageviews, bounce rate
- `GET https://vercel.com/api/web/insights/timeseries?projectId=X&from=X&to=X` — chart data
- `GET https://vercel.com/api/speed-insights/timeseries?projectId=X&from=X&to=X` — RES score
- Auth: `Bearer <vercel_api_token>` header

---

## File Structure

### Backend (yunkhngn-be)
| File | Action | Purpose |
|------|--------|---------|
| `src/modules/integrations/vercel/vercel.service.ts` | Create | Fetch analytics & speed insights from Vercel API |
| `src/modules/integrations/vercel/vercel.controller.ts` | Create | Expose `/admin/vercel/analytics` and `/admin/vercel/speed-insights` |
| `src/modules/integrations/vercel/vercel.module.ts` | Create | NestJS module registration |
| `src/modules/settings/settings.service.ts` | Modify | Add `vercel_api_token`, `vercel_project_id`, `vercel_team_id` to SYSTEM_SETTINGS/SENSITIVE_KEYS |
| `src/app.module.ts` | Modify | Import VercelModule |

### Frontend (yunkhngn-fe)
| File | Action | Purpose |
|------|--------|---------|
| `app/(admin)/admin/analytics/page.jsx` | Create | Analytics page route |
| `app/(admin)/admin/analytics/AnalyticsClient.jsx` | Create | Web Analytics dashboard |
| `app/(admin)/admin/speed-insights/page.jsx` | Create | Speed Insights page route |
| `app/(admin)/admin/speed-insights/SpeedInsightsClient.jsx` | Create | RES score, Core Web Vitals |
| `components/template/Admin/Navbar.jsx` | Modify | Add nav items |

---

### Task 1: Add Vercel settings keys to backend

**Files:**
- Modify: `yunkhngn-be/src/modules/settings/settings.service.ts:15-99`

- [ ] **Step 1: Add vercel keys to SYSTEM_SETTINGS array**

Add after `'journal_moods'` (line 57):

```typescript
  'vercel_api_token',
  'vercel_project_id',
  'vercel_team_id',
```

- [ ] **Step 2: Add vercel_api_token to SENSITIVE_KEYS array**

Add after `'lastfm_api_key'` (line 97):

```typescript
  'vercel_api_token',
```

- [ ] **Step 3: Restart backend to seed new settings**

Run: `cd yunkhngn-be && npm run start:dev`
Expected: Log shows "Initializing system settings", new keys created.

- [ ] **Step 4: Commit**

```bash
git add src/modules/settings/settings.service.ts
git commit -m "feat(settings): add vercel api token and project id to system settings"
```

---

### Task 2: Create Vercel integration service (backend)

**Files:**
- Create: `yunkhngn-be/src/modules/integrations/vercel/vercel.service.ts`

- [ ] **Step 1: Create the VercelService**

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { SettingsService } from '../../settings/settings.service';

@Injectable()
export class VercelService {
  private readonly logger = new Logger(VercelService.name);

  constructor(private readonly settingsService: SettingsService) {}

  private async getCredentials() {
    const token = await this.settingsService.getDecryptedSetting('vercel_api_token');
    const projectId = await this.settingsService.getDecryptedSetting('vercel_project_id');
    const teamId = await this.settingsService.getDecryptedSetting('vercel_team_id');
    if (!token || !projectId) {
      this.logger.warn('Vercel credentials not configured');
      return null;
    }
    return { token, projectId, teamId };
  }

  private getDateRange(period: '24h' | '7d' | '30d') {
    const to = new Date();
    const from = new Date();
    switch (period) {
      case '24h': from.setDate(to.getDate() - 1); break;
      case '7d': from.setDate(to.getDate() - 7); break;
      case '30d': from.setDate(to.getDate() - 30); break;
    }
    return { from: from.getTime(), to: to.getTime() };
  }

  async getAnalytics(period: '24h' | '7d' | '30d' = '7d') {
    const creds = await this.getCredentials();
    if (!creds) return null;
    const { from, to } = this.getDateRange(period);
    const teamQuery = creds.teamId ? `&teamId=${creds.teamId}` : '';

    try {
      const [statsRes, timeseriesRes] = await Promise.all([
        fetch(
          `https://vercel.com/api/web/insights/stats?projectId=${creds.projectId}&from=${from}&to=${to}${teamQuery}`,
          { headers: { Authorization: `Bearer ${creds.token}` } },
        ),
        fetch(
          `https://vercel.com/api/web/insights/timeseries?projectId=${creds.projectId}&from=${from}&to=${to}${teamQuery}`,
          { headers: { Authorization: `Bearer ${creds.token}` } },
        ),
      ]);

      if (!statsRes.ok || !timeseriesRes.ok) {
        throw new Error(`Vercel API error: stats=${statsRes.status}, timeseries=${timeseriesRes.status}`);
      }

      const [stats, timeseries] = await Promise.all([statsRes.json(), timeseriesRes.json()]);
      return { stats, timeseries };
    } catch (error) {
      this.logger.error('Failed to fetch Vercel analytics', error);
      throw error;
    }
  }

  async getSpeedInsights(period: '24h' | '7d' | '30d' = '7d') {
    const creds = await this.getCredentials();
    if (!creds) return null;
    const { from, to } = this.getDateRange(period);
    const teamQuery = creds.teamId ? `&teamId=${creds.teamId}` : '';

    try {
      const res = await fetch(
        `https://vercel.com/api/speed-insights/timeseries?projectId=${creds.projectId}&from=${from}&to=${to}${teamQuery}`,
        { headers: { Authorization: `Bearer ${creds.token}` } },
      );
      if (!res.ok) throw new Error(`Vercel Speed Insights API error: ${res.status}`);
      return res.json();
    } catch (error) {
      this.logger.error('Failed to fetch Speed Insights', error);
      throw error;
    }
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/modules/integrations/vercel/vercel.service.ts
git commit -m "feat(vercel): create vercel analytics service"
```

---

### Task 3: Create Vercel controller and module (backend)

**Files:**
- Create: `yunkhngn-be/src/modules/integrations/vercel/vercel.controller.ts`
- Create: `yunkhngn-be/src/modules/integrations/vercel/vercel.module.ts`
- Modify: `yunkhngn-be/src/app.module.ts`

- [ ] **Step 1: Create the controller**

```typescript
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { VercelService } from './vercel.service';
import { FirebaseAuthGuard, RolesGuard } from '../../../common/guards';
import { Roles } from '../../../common/decorators';

@ApiTags('Vercel')
@Controller('admin/vercel')
@UseGuards(FirebaseAuthGuard, RolesGuard)
@Roles('ADMIN')
export class VercelController {
  constructor(private readonly vercelService: VercelService) {}

  @Get('analytics')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get web analytics from Vercel' })
  @ApiQuery({ name: 'period', enum: ['24h', '7d', '30d'], required: false })
  async getAnalytics(@Query('period') period: '24h' | '7d' | '30d') {
    return this.vercelService.getAnalytics(period || '7d');
  }

  @Get('speed-insights')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get speed insights from Vercel' })
  @ApiQuery({ name: 'period', enum: ['24h', '7d', '30d'], required: false })
  async getSpeedInsights(@Query('period') period: '24h' | '7d' | '30d') {
    return this.vercelService.getSpeedInsights(period || '7d');
  }
}
```

- [ ] **Step 2: Create the module**

```typescript
import { Module } from '@nestjs/common';
import { VercelController } from './vercel.controller';
import { VercelService } from './vercel.service';

@Module({
  controllers: [VercelController],
  providers: [VercelService],
  exports: [VercelService],
})
export class VercelModule {}
```

- [ ] **Step 3: Import VercelModule in app.module.ts**

Add `import { VercelModule } from './modules/integrations/vercel/vercel.module';` and add `VercelModule` to the `imports` array.

- [ ] **Step 4: Commit**

```bash
git add src/modules/integrations/vercel/ src/app.module.ts
git commit -m "feat(vercel): add controller, module, and register in app"
```

---

### Task 4: Create Analytics frontend page

**Files:**
- Create: `yunkhngn-fe/app/(admin)/admin/analytics/page.jsx`
- Create: `yunkhngn-fe/app/(admin)/admin/analytics/AnalyticsClient.jsx`

- [ ] **Step 1: Create page route**

```jsx
import AnalyticsClient from './AnalyticsClient';
export const metadata = { title: 'Analytics – Admin' };
export default function AnalyticsPage() {
  return <AnalyticsClient />;
}
```

- [ ] **Step 2: Create AnalyticsClient**

Build a client component:
- Fetches `/admin/vercel/analytics?period=X`
- Stat cards: Visitors, Page Views, Bounce Rate (match `DashboardClient.jsx` StatCard pattern)
- Recharts `AreaChart` for timeseries (dark bg, primary color fill matching screenshot)
- Period selector using `Select` (24h / 7d / 30d)
- Empty state if credentials not configured
- Uses `AdminPageHeader`, standard `Loader2` spinner

- [ ] **Step 3: Commit**

```bash
git add app/\(admin\)/admin/analytics/
git commit -m "feat(analytics): add vercel web analytics page"
```

---

### Task 5: Create Speed Insights frontend page

**Files:**
- Create: `yunkhngn-fe/app/(admin)/admin/speed-insights/page.jsx`
- Create: `yunkhngn-fe/app/(admin)/admin/speed-insights/SpeedInsightsClient.jsx`

- [ ] **Step 1: Create page route**

```jsx
import SpeedInsightsClient from './SpeedInsightsClient';
export const metadata = { title: 'Speed Insights – Admin' };
export default function SpeedInsightsPage() {
  return <SpeedInsightsClient />;
}
```

- [ ] **Step 2: Create SpeedInsightsClient**

Build a client component:
- Fetches `/admin/vercel/speed-insights?period=X`
- Circular gauge for RES score (Great >90 green, Needs Improvement 50-90 yellow, Poor <50 red)
- Recharts `LineChart` for P75/P90/P95/P99 percentile lines
- Device filter (Desktop/Mobile), period selector
- Standard loading/empty patterns

- [ ] **Step 3: Commit**

```bash
git add app/\(admin\)/admin/speed-insights/
git commit -m "feat(speed-insights): add vercel speed insights page"
```

---

### Task 6: Add nav items and E2E test

**Files:**
- Modify: `yunkhngn-fe/components/template/Admin/Navbar.jsx`

- [ ] **Step 1: Add nav entries**

Add after Monitor nav item:
- `{ label: 'Analytics', href: '/admin/analytics', icon: BarChart3 }`
- `{ label: 'Speed Insights', href: '/admin/speed-insights', icon: Gauge }`

Import `Gauge` from `lucide-react`.

- [ ] **Step 2: Configure credentials in Settings**

Go to `/admin/settings` → set `vercel_api_token`, `vercel_project_id`, `vercel_team_id`.

- [ ] **Step 3: Verify full flow**

Navigate to `/admin/analytics` and `/admin/speed-insights` — should show data.

- [ ] **Step 4: Commit**

```bash
git add components/template/Admin/Navbar.jsx
git commit -m "feat(nav): add analytics and speed insights navigation"
```
