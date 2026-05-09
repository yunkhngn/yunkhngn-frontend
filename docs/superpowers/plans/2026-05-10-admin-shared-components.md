# Admin Shared Components Extraction Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extract 4 shared UI components from repeated patterns across admin pages to improve consistency without breaking existing layouts.

**Architecture:** Create small, composable components in `components/admin/shared/`. Each component is a thin wrapper around existing Tailwind classes — no new design system, no breaking changes. Migrate one page at a time, verifying visually after each.

**Tech Stack:** React, Tailwind CSS, Lucide Icons, Next.js App Router

---

## Strategy: Conservative Extraction

**What we extract (high duplication, low risk):**
1. `AdminPageHeader` — title + description + action button (used in ~12 pages)
2. `BulkActionBar` — selected count + action buttons (used in 5 pages)
3. `AdminEmptyState` — icon + message + optional CTA (used in ~8 pages)
4. `StatusIndicator` — colored dot/icon for publish/draft/active states (used in ~6 pages)

**What we DON'T touch:**
- Blog editor, Letters canvas, Chat, Journal, Dashboard, Monitor — these stay as-is
- Page-specific logic (fetch, delete, CRUD) — stays in each `*Client.jsx`
- Existing Shadcn `components/ui/` — no modifications

## File Structure

```
components/admin/shared/
├── AdminPageHeader.jsx    (NEW - ~30 lines)
├── BulkActionBar.jsx      (NEW - ~40 lines)
├── AdminEmptyState.jsx    (NEW - ~25 lines)
├── StatusIndicator.jsx    (NEW - ~20 lines)
└── index.js               (NEW - barrel export)
```

**Pages to migrate (in order, safest first):**
1. `ShortlinksClient.jsx` — has all 4 patterns, good test case
2. `NewsletterClient.jsx` — simplest page, quick win
3. `NotificationsClient.jsx` — simple list page
4. `AdminBlogListClient.jsx` — has bulk actions + empty state
5. `AdminProjectListClient.jsx` — similar to blog
6. `CommentsClient.jsx` — bulk actions with tabs
7. `AdminContactClient.jsx` — bulk actions
8. `AdminPhotoClient.jsx` — bulk actions + empty state

**Pages to SKIP:**
- `DashboardClient.jsx`, `MonitorClient.jsx`, `LettersClient.jsx`
- `ChatClient.jsx`, `ChatLogsClient.jsx`, `AdminJournalClient.jsx`
- `AIManagementClient.jsx`, `SettingsClient.jsx`, `ProfileClient.jsx`
- `MediaClient.jsx`, All blog/project detail and edit pages

---

### Task 1: Create AdminPageHeader Component

**Files:**
- Create: `components/admin/shared/AdminPageHeader.jsx`

- [ ] **Step 1: Create the component**

```jsx
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export function AdminPageHeader({ title, description, action, children }) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        {description && <p className="text-muted-foreground mt-1">{description}</p>}
      </div>
      <div className="flex items-center gap-2">
        {children}
        {action && (action.href ? (
          <Link href={action.href}>
            <Button className="w-full md:w-auto gap-2" onClick={action.onClick}>
              {action.icon}{action.label}
            </Button>
          </Link>
        ) : (
          <Button className="w-full md:w-auto gap-2" onClick={action.onClick}>
            {action.icon}{action.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/admin/shared/AdminPageHeader.jsx
git commit -m "feat(admin): add AdminPageHeader shared component"
```

---

### Task 2: Create BulkActionBar Component

**Files:**
- Create: `components/admin/shared/BulkActionBar.jsx`

- [ ] **Step 1: Create the component**

```jsx
import { Button } from '@/components/ui/Button';
import { Trash2, Loader2, XCircle } from 'lucide-react';

export function BulkActionBar({ count, onClear, onDelete, loading = false, children }) {
  if (count === 0) return null;
  return (
    <div className="flex items-center gap-3 p-3 bg-primary/5 border border-primary/20 rounded-lg animate-in fade-in slide-in-from-top-2">
      <span className="text-sm font-medium">{count} selected</span>
      <div className="flex-1" />
      {children}
      {onDelete && (
        <Button variant="outline" size="sm" onClick={onDelete} disabled={loading}
          className="gap-1.5 text-red-500 hover:text-red-600 border-red-200 hover:border-red-300 hover:bg-red-50 dark:border-red-800 dark:hover:border-red-700 dark:hover:bg-red-950">
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />} Delete
        </Button>
      )}
      {onClear && (
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClear}>
          <XCircle className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/admin/shared/BulkActionBar.jsx
git commit -m "feat(admin): add BulkActionBar shared component"
```

---

### Task 3: Create AdminEmptyState Component

**Files:**
- Create: `components/admin/shared/AdminEmptyState.jsx`

- [ ] **Step 1: Create the component**

```jsx
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Plus } from 'lucide-react';

export function AdminEmptyState({ icon, message, action }) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-16">
        <div className="text-muted-foreground mb-4">{icon}</div>
        <p className="text-muted-foreground text-lg">{message}</p>
        {action && (
          <Button onClick={action.onClick} variant="outline" className="mt-4 gap-2">
            <Plus className="h-4 w-4" />{action.label}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/admin/shared/AdminEmptyState.jsx
git commit -m "feat(admin): add AdminEmptyState shared component"
```

---

### Task 4: Create StatusIndicator Component

**Files:**
- Create: `components/admin/shared/StatusIndicator.jsx`

- [ ] **Step 1: Create the component**

```jsx
import { CheckCircle2, FileEdit, ToggleRight, ToggleLeft } from 'lucide-react';

const presets = {
  published: { icon: CheckCircle2, className: 'text-emerald-500' },
  draft: { icon: FileEdit, className: 'text-amber-500' },
  active: { icon: ToggleRight, className: 'text-green-500' },
  inactive: { icon: ToggleLeft, className: 'text-muted-foreground' },
  visible: { icon: CheckCircle2, className: 'text-emerald-500' },
  hidden: { icon: FileEdit, className: 'text-muted-foreground' },
};

export function StatusIndicator({ status, size = 'h-4 w-4', showLabel = false }) {
  const preset = presets[status];
  if (!preset) return null;
  const Icon = preset.icon;
  return (
    <div className="flex items-center gap-1.5 flex-none">
      <Icon className={`${size} ${preset.className}`} />
      {showLabel && <span className={`text-xs ${preset.className}`}>{status}</span>}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/admin/shared/StatusIndicator.jsx
git commit -m "feat(admin): add StatusIndicator shared component"
```

---

### Task 5: Create barrel export

**Files:**
- Create: `components/admin/shared/index.js`

- [ ] **Step 1: Create index file**

```js
export { AdminPageHeader } from './AdminPageHeader';
export { BulkActionBar } from './BulkActionBar';
export { AdminEmptyState } from './AdminEmptyState';
export { StatusIndicator } from './StatusIndicator';
```

- [ ] **Step 2: Commit**

```bash
git add components/admin/shared/index.js
git commit -m "feat(admin): add barrel export for shared components"
```

---

### Task 6: Migrate ShortlinksClient (pilot)

**Files:**
- Modify: `app/(admin)/admin/shortlinks/ShortlinksClient.jsx`

- [ ] **Step 1: Add imports, replace PageHeader (lines 284-292), BulkActionBar (lines 296-313), EmptyState (lines 321-330) with shared components**
- [ ] **Step 2: Visual verification at `/admin/shortlinks`**
- [ ] **Step 3: Commit**

```bash
git commit -am "refactor(admin): migrate ShortlinksClient to shared components"
```

---

### Task 7: Migrate AdminBlogListClient

**Files:**
- Modify: `app/(admin)/admin/blog/AdminBlogListClient.jsx`

- [ ] **Step 1: Replace PageHeader (lines 186-196) and BulkActionBar (lines 242-258)**
- [ ] **Step 2: Visual verification at `/admin/blog`**
- [ ] **Step 3: Commit**

```bash
git commit -am "refactor(admin): migrate AdminBlogListClient to shared components"
```

---

### Task 8: Migrate CommentsClient

**Files:**
- Modify: `app/(admin)/admin/comments/CommentsClient.jsx`

- [ ] **Step 1: Replace PageHeader (lines 406-412), comments BulkActionBar (lines 415-432), reports BulkActionBar (lines 390-403)**
- [ ] **Step 2: Visual verification at `/admin/comments`**
- [ ] **Step 3: Commit**

```bash
git commit -am "refactor(admin): migrate CommentsClient to shared components"
```

---

### Task 9: Migrate remaining pages

- [ ] **Step 1: Migrate NewsletterClient** — PageHeader only
- [ ] **Step 2: Migrate NotificationsClient** — PageHeader only
- [ ] **Step 3: Migrate AdminContactClient** — PageHeader + BulkActionBar
- [ ] **Step 4: Migrate AdminPhotoClient** — PageHeader + BulkActionBar + EmptyState
- [ ] **Step 5: Migrate AdminProjectListClient** — PageHeader + BulkActionBar
- [ ] **Step 6: Visual verification of all migrated pages**
- [ ] **Step 7: Commit all**

```bash
git add -A
git commit -m "refactor(admin): migrate remaining pages to shared components"
```

---

### Task 10: Final cleanup

- [ ] **Step 1: Run build**

```bash
npm run build 2>&1 | head -50
```

- [ ] **Step 2: Remove unused imports from migrated files**
- [ ] **Step 3: Final commit**

```bash
git commit -am "chore(admin): clean up unused imports after shared component migration"
```
