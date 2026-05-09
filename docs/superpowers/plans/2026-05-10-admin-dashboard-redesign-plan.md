# Admin Dashboard Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the current cluttered dashboard into a strict 100vh "Command Center" layout, migrating server stats to the Monitor page and consolidating charts and content lists.

**Architecture:** Single-screen layout using Grid/Flexbox with `h-[calc(100vh-offset)]`. Internal `overflow-y-auto` scrolling for data-heavy sections like Activity Feed and Tabbed Content. Server polling logic will be extracted from the Dashboard and added to the Monitor page.

**Tech Stack:** Next.js (App Router), React, Tailwind CSS, shadcn/ui.

---

### Task 1: Migrate Server Stats to Monitor Page

**Files:**
- Modify: `yunkhngn-fe/app/(admin)/admin/dashboard/DashboardClient.jsx:77-115`
- Modify: `yunkhngn-fe/app/(admin)/admin/monitor/MonitorClient.jsx`

- [ ] **Step 1: Add system stats polling to MonitorClient**

In `yunkhngn-fe/app/(admin)/admin/monitor/MonitorClient.jsx`, add the `systemStats` state and polling effect that is currently inside `DashboardClient.jsx`. 
Also add `formatDistanceToNow` import.

```javascript
// Add import at the top
import { formatDistanceToNow } from 'date-fns';

// Inside MonitorClient component
const [systemStats, setSystemStats] = useState(null);

useEffect(() => {
  let intervalId;
  const fetchSystemStats = async () => {
    if (!user) return;
    if (typeof document !== 'undefined' && document.visibilityState !== 'visible') return;
    try {
      const token = await user.getIdToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/system/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setSystemStats(await readNestJson(res));
      }
    } catch (error) {
      console.error("Failed to fetch system stats", error);
    }
  };

  fetchSystemStats();
  intervalId = setInterval(fetchSystemStats, 5000);

  const handleVisibilityChange = () => {
    if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
      fetchSystemStats();
    }
  };
  if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', handleVisibilityChange);
  }

  return () => {
    clearInterval(intervalId);
    if (typeof document !== 'undefined') {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    }
  };
}, [user]);
```

- [ ] **Step 2: Render Server Stats in Monitor Overview**

In `yunkhngn-fe/app/(admin)/admin/monitor/MonitorClient.jsx`, find the `TabsContent` for `overview` and add the 4 stat cards above the container grid.

```jsx
<TabsContent value="overview" className="mt-4">
  {/* System Status Cards */}
  <div className="grid gap-3 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 mb-6">
    <Card className="bg-green-500/10 border-green-500/20">
      <CardContent className="p-4 flex items-center gap-4">
        <div className="p-2 rounded-full bg-green-500/20 text-green-500">
          <Server className="h-5 w-5" />
        </div>
        <div className="w-full">
          <p className="text-sm font-medium">CPU Load</p>
          <div className="flex items-center justify-between">
            <p className="text-2xl font-bold font-mono">
              {systemStats ? `${systemStats.currentLoad.currentLoad.toFixed(1)}%` : '...'}
            </p>
            {systemStats && (
              <div className="h-1.5 w-16 bg-green-500/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 transition-all duration-500"
                  style={{ width: `${Math.min(systemStats.currentLoad.currentLoad, 100)}%` }}
                />
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>

    <Card className="bg-blue-500/10 border-blue-500/20">
      <CardContent className="p-4 flex items-center gap-4">
        <div className="p-2 rounded-full bg-blue-500/20 text-blue-500">
          <Database className="h-5 w-5" />
        </div>
        <div className="w-full">
          <p className="text-sm font-medium">Memory (RAM)</p>
          {systemStats ? (
            <div>
              <div className="flex items-end gap-1">
                <p className="text-2xl font-bold font-mono">
                  {((systemStats.mem.active / systemStats.mem.total) * 100).toFixed(1)}%
                </p>
                <p className="text-xs text-muted-foreground mb-1">
                  ({(systemStats.mem.active / 1024 / 1024 / 1024).toFixed(1)}GB / {(systemStats.mem.total / 1024 / 1024 / 1024).toFixed(1)}GB)
                </p>
              </div>
              <div className="h-1.5 w-full bg-blue-500/20 rounded-full overflow-hidden mt-1">
                <div
                  className="h-full bg-blue-500 transition-all duration-500"
                  style={{ width: `${(systemStats.mem.active / systemStats.mem.total) * 100}%` }}
                />
              </div>
            </div>
          ) : <p className="...">Loading...</p>}
        </div>
      </CardContent>
    </Card>

    <Card className="bg-purple-500/10 border-purple-500/20">
      <CardContent className="p-4 flex items-center gap-4">
        <div className="p-2 rounded-full bg-purple-500/20 text-purple-500">
          <Activity className="h-5 w-5" />
        </div>
        <div className="w-full">
          <p className="text-sm font-medium">Uptime</p>
          <p className="text-lg font-bold font-mono truncate">
            {systemStats && systemStats.time && typeof systemStats.time.uptime === 'number'
              ? formatDistanceToNow(new Date(Date.now() - systemStats.time.uptime * 1000))
              : '...'}
          </p>
          <p className="text-xs text-purple-500/80">
            System Online
          </p>
        </div>
      </CardContent>
    </Card>

    <Card className="bg-orange-500/10 border-orange-500/20">
      <CardContent className="p-4 flex items-center gap-4">
        <div className="p-2 rounded-full bg-orange-500/20 text-orange-500">
          <Server className="h-5 w-5" />
        </div>
        <div className="w-full">
          <p className="text-sm font-medium">Disk Usage</p>
          {systemStats && systemStats.fsSize && systemStats.fsSize.length > 0 ? (
            <div>
              <div className="flex items-end gap-1">
                <p className="text-2xl font-bold font-mono">
                  {systemStats.fsSize[0].use.toFixed(1)}%
                </p>
                <p className="text-xs text-muted-foreground mb-1">
                  ({(systemStats.fsSize[0].used / 1024 / 1024 / 1024).toFixed(0)}GB used)
                </p>
              </div>
              <div className="h-1.5 w-full bg-orange-500/20 rounded-full overflow-hidden mt-1">
                <div
                  className="h-full bg-orange-500 transition-all duration-500"
                  style={{ width: `${systemStats.fsSize[0].use}%` }}
                />
              </div>
            </div>
          ) : <p className="text-sm font-mono text-muted-foreground">Unknown</p>}
        </div>
      </CardContent>
    </Card>
  </div>

  <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
    {containers.map((container) => (
      <Card key={container.id} className="bg-card hover:border-primary/50 transition-all cursor-pointer overflow-hidden border-border" onClick={() => setActiveTab(container.id)}>
        <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-sm font-bold truncate pr-2">{container.names?.[0]?.replace(/^\//, '')}</CardTitle>
          <Badge variant="outline" className={`${getStatusColor(container.state)} text-[9px] px-1.5 py-0`}>{container.state.toUpperCase()}</Badge>
        </CardHeader>
        <CardContent className="p-4 pt-0 space-y-2 text-[10px]">
          <div className="flex justify-between text-muted-foreground"><span>Image</span><span className="truncate max-w-[120px] font-mono">{container.image.split(':')[0]}</span></div>
          <div className="flex justify-between text-muted-foreground"><span>Status</span><span className="text-emerald-500">{container.status}</span></div>
        </CardContent>
      </Card>
    ))}
  </div>
</TabsContent>
```

- [ ] **Step 3: Remove Server Stats from DashboardClient**

In `yunkhngn-fe/app/(admin)/admin/dashboard/DashboardClient.jsx`:
1. Remove `systemStats` state declaration.
2. Remove the `useEffect` that polls `/system/stats`.
3. Delete the entire JSX block labeled `<!-- System Status -->` that renders the 4 server stat cards (CPU, RAM, Uptime, Disk).

- [ ] **Step 4: Commit**

```bash
git add yunkhngn-fe/app/\(admin\)/admin/monitor/MonitorClient.jsx yunkhngn-fe/app/\(admin\)/admin/dashboard/DashboardClient.jsx
git commit -m "feat: migrate server stats from dashboard to monitor page"
```

### Task 2: Implement Single-Screen Layout Core

**Files:**
- Modify: `yunkhngn-fe/app/(admin)/admin/dashboard/DashboardClient.jsx`

- [ ] **Step 1: Set up the 100vh Grid Container**

Replace the outermost `<div className="space-y-8">` wrapper in `DashboardClient.jsx` with a constrained flexbox/grid layout.

```jsx
<div className="flex flex-col h-[calc(100vh-6rem)] overflow-hidden gap-4">
  {/* Header */}
  <div className="flex-none flex flex-col md:flex-row md:items-center justify-between gap-4">
    {/* Keep existing header content */}
  </div>
  
  {/* The rest of the content will go here in subsequent tasks */}
</div>
```

- [ ] **Step 2: Consolidate the Key Metrics**

Keep only 4 key metrics and place them directly under the header. Ensure they are compact. Replace the existing 8-card grid.

```jsx
{/* Inside the flex container, below Header */}
<div className="flex-none grid gap-3 grid-cols-2 lg:grid-cols-4 h-24">
  <StatCard
    title="Blogs"
    value={stats.blogs}
    subtitle={`${stats.blogsPublished} pub, ${stats.blogsDraft} draft`}
    icon={FileText}
  />
  <StatCard
    title="Projects"
    value={stats.projects}
    subtitle="Showcased"
    icon={Folder}
  />
  <StatCard
    title="Comments"
    value={stats.comments}
    subtitle="Total"
    icon={MessageSquare}
  />
  <StatCard
    title="Mail"
    value={stats.mailTotal}
    subtitle={`${stats.mailReceived} received`}
    icon={Mail}
  />
</div>
```

- [ ] **Step 3: Commit**

```bash
git add yunkhngn-fe/app/\(admin\)/admin/dashboard/DashboardClient.jsx
git commit -m "feat: implement 100vh layout and reduce stat cards"
```

### Task 3: Restructure DashboardCharts (Remove Web Analytics)

**Files:**
- Modify: `yunkhngn-fe/components/admin/DashboardCharts.jsx`
- Modify: `yunkhngn-fe/app/(admin)/admin/dashboard/DashboardClient.jsx`

- [ ] **Step 1: Strip out Analytics logic and API call**

In `DashboardClient.jsx`:
- Remove `analyticsData` and `analyticsPeriod` states.
- Remove the fetch call for `/admin/analytics`.
- Remove `analyticsData` and `analyticsPeriod` props passed to `DashboardCharts`.

In `DashboardCharts.jsx`:
- Remove all code, imports, and rendering logic associated with Web Analytics.
- Modify the layout so the remaining 3 charts (Activity Timeline, Content Distribution, Blog Status) fit compactly using Tabs or a tight grid.

- [ ] **Step 2: Convert DashboardCharts to Tabbed Interface**

Update `DashboardCharts.jsx` to render a single Card containing Tabs (`Timeline`, `Content`, `Status`).
```jsx
// yunkhngn-fe/components/admin/DashboardCharts.jsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
// ... imports for charts ...

export default function DashboardCharts({ stats, theme, activityData }) {
  // ... chart config logic ...
  
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex-none pb-2">
        <CardTitle className="text-sm">Activity & Distribution</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 min-h-0">
        <Tabs defaultValue="timeline" className="h-full flex flex-col">
          <TabsList className="flex-none grid w-full grid-cols-3">
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="status">Status</TabsTrigger>
          </TabsList>
          
          <TabsContent value="timeline" className="flex-1 min-h-0 mt-2">
            <div className="h-full w-full">
              {/* Render AreaChart here */}
            </div>
          </TabsContent>
          <TabsContent value="content" className="flex-1 min-h-0 mt-2">
            <div className="h-full w-full">
              {/* Render Content PieChart here */}
            </div>
          </TabsContent>
          <TabsContent value="status" className="flex-1 min-h-0 mt-2">
            <div className="h-full w-full">
              {/* Render Status PieChart here */}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add yunkhngn-fe/components/admin/DashboardCharts.jsx yunkhngn-fe/app/\(admin\)/admin/dashboard/DashboardClient.jsx
git commit -m "feat: consolidate charts into tabbed interface, remove analytics"
```

### Task 4: Content Hub & Activity Feed

**Files:**
- Modify: `yunkhngn-fe/app/(admin)/admin/dashboard/DashboardClient.jsx`

- [ ] **Step 1: Set up the Main Grid Area**

Below the Stat Cards in `DashboardClient.jsx`, add a grid that fills the remaining height.

```jsx
{/* Main Grid - Fills remaining height */}
<div className="flex-1 min-h-0 grid gap-4 grid-cols-1 lg:grid-cols-12">
  {/* Column 1: Charts (Span 5) */}
  <div className="lg:col-span-5 h-full">
    <DashboardCharts
      stats={stats}
      theme={theme}
      activityData={activityData}
    />
  </div>

  {/* Column 2 & 3 will go here */}
</div>
```

- [ ] **Step 2: Implement Tabbed Content Hub (Column 2)**

Add the Content Hub (Span 4) beside the charts.
Include imports for `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent` from `@/components/ui/Tabs` if not present.

```jsx
{/* Column 2: Content Hub (Span 4) */}
<div className="lg:col-span-4 h-full flex flex-col min-h-0">
  <Card className="h-full flex flex-col min-h-0">
    <CardContent className="p-4 flex-1 min-h-0 flex flex-col">
      <Tabs defaultValue="blogs" className="h-full flex flex-col">
        <TabsList className="grid w-full grid-cols-3 mb-2 flex-none">
          <TabsTrigger value="blogs">Blogs</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="photos">Photos</TabsTrigger>
        </TabsList>
        <div className="flex-1 overflow-y-auto min-h-0 space-y-2 pr-2 custom-scrollbar">
          <TabsContent value="blogs" className="mt-0 h-full">
             {/* Map over recentBlogs as done previously, keeping them compact */}
          </TabsContent>
          <TabsContent value="projects" className="mt-0 h-full">
             {/* Map over recentProjects in a tight grid or list */}
          </TabsContent>
          <TabsContent value="photos" className="mt-0 h-full">
             {/* Map over recentPhotos in a tight grid */}
          </TabsContent>
        </div>
      </Tabs>
    </CardContent>
  </Card>
</div>
```

- [ ] **Step 3: Implement Activity Feed (Column 3)**

Add the Quick Actions and Activity Feed (Span 3) on the right side.

```jsx
{/* Column 3: Quick Actions & Activity (Span 3) */}
<div className="lg:col-span-3 h-full flex flex-col min-h-0 gap-4">
  <Card className="flex-none">
    <CardHeader className="py-3">
      <CardTitle className="text-sm">Quick Actions</CardTitle>
    </CardHeader>
    <CardContent className="pb-3 flex gap-2">
       <Button asChild variant="outline" size="sm" className="flex-1">
         <Link href="/admin/blog/new">Write</Link>
       </Button>
       <Button asChild variant="outline" size="sm" className="flex-1">
         <Link href="/admin/photo">Upload</Link>
       </Button>
    </CardContent>
  </Card>

  <Card className="flex-1 min-h-0 flex flex-col">
    <CardHeader className="py-3 flex-none">
      <CardTitle className="flex items-center gap-2 text-sm">
        <Clock className="h-4 w-4" /> Activity
      </CardTitle>
    </CardHeader>
    <CardContent className="flex-1 overflow-y-auto p-0 px-4 pb-4 min-h-0 custom-scrollbar">
      <div className="space-y-1">
        {activities.map((activity) => (
          <ActivityItem key={activity.id} activity={activity} />
        ))}
      </div>
    </CardContent>
  </Card>
</div>
```

- [ ] **Step 4: Cleanup removed code**

Ensure the old separate blocks for `Recent Blogs`, `Recent Projects`, `Recent Photos`, and the old `Activity Feed` at the bottom of the component are completely deleted to ensure there are no duplicates and the page remains perfectly 100vh.

- [ ] **Step 5: Commit**

```bash
git add yunkhngn-fe/app/\(admin\)/admin/dashboard/DashboardClient.jsx
git commit -m "feat: complete single screen layout with content hub and feed"
```
