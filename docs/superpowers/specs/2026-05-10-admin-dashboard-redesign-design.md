# Admin Dashboard Redesign - Single-Screen Command Center

## Purpose
Redesign the `/admin/dashboard` page to act as a focused, single-screen "Command Center". The current dashboard is visually cluttered, requires scrolling, and contains information (like server stats) that belongs elsewhere. The goal is to provide a clean, 100vh layout on desktop that summarizes key metrics, recent content, and activities without requiring page scrolls.

## Architecture & Layout Constraints
- **Desktop Layout:** 100vw, 100vh max (no document-level scrolling).
- **Structure:**
  - Header (Fixed height)
  - Key Metrics Row (Fixed height)
  - Main Grid Row (Fills remaining height)
- **Scrolling:** Any overflowing content must scroll *internally* within its respective card container (`overflow-y-auto`), leaving the main page locked in place.
- **Server Stats:** All system monitoring data (CPU, RAM, Uptime, Disk) will be removed from the Dashboard and moved to the `/admin/monitor` page.

## Component Breakdown

### 1. Header Area
- **Left:** Greeting and Page Title ("Dashboard").
- **Right:** Action buttons (`AI Summary`, `+ New Blog`, `+ New Project`).

### 2. Key Metrics (Row 1)
4 compact stat cards summarizing the most important data:
- **Blogs:** Total (Drafts / Published).
- **Projects:** Total count.
- **Comments:** Total comments.
- **Mail:** New/Total messages.

### 3. Main Grid (Row 2) - Three Columns

#### Column 1: Consolidated Charts
- Remove "Web Analytics" entirely.
- Combine the existing 3 charts (Activity Timeline, Content Distribution Pie, Blog Status Pie) into a single container.
- Use a Tabs component to switch between charts OR a highly optimized compact view to prevent wasting space.

#### Column 2: Content Hub (Tabs)
- Replace separate full-height lists for Blogs, Projects, and Photos.
- Create a unified Card with a Tabs interface (`Blogs` | `Projects` | `Photos`).
- The content inside the active tab will show a list/grid of recent items.
- Container will have `overflow-y-auto` to handle overflow internally.

#### Column 3: Activity & Quick Actions
- **Top section:** Quick Actions (buttons for common administrative tasks).
- **Bottom section:** Activity Feed. A vertical list of recent events (comments, emails, publishes) with `overflow-y-auto` to scroll internally.

## Migration Steps
1. Refactor `DashboardClient.jsx` to use a flex/grid layout constrained to `h-[calc(100vh-OFFSET)]`.
2. Extract the Server Stats components and integrate them into `MonitorClient.jsx`.
3. Refactor the `DashboardCharts` component to remove Web Analytics and consolidate the remaining charts (likely using Tabs).
4. Create the Tabbed Content Hub for recent items.
5. Create the unified Activity Feed card.

## Testing & Quality Assurance
- **Responsiveness:** On mobile/tablet, the 100vh constraint should be lifted to allow natural vertical scrolling. The 100vh layout strictly targets desktop viewports.
- **Data Integrity:** Ensure that the API calls required for the removed server stats are only triggered on the Monitor page, preventing unnecessary polling on the dashboard.
