# Dynamic Settings Management

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the hardcoded `SETTINGS_GROUPS` in the frontend Settings page with a dynamic, database-driven system where the admin can create/edit/delete tabs (groups) and add/remove/edit settings keys within them — no more code changes needed to add new settings.

**Architecture:** Add a `group` field to the Settings model so each setting knows which tab it belongs to. The backend returns settings grouped by their `group` value. Frontend renders tabs dynamically from the API response instead of a hardcoded array. Admin can CRUD groups and keys directly from the UI.

**Tech Stack:** Prisma (migration), NestJS (backend API), React/Next.js (frontend)

---

## File Structure

### Backend (yunkhngn-be)
| File | Action | Purpose |
|------|--------|---------|
| `prisma/schema.prisma` | Modify | Add `group` and `sortOrder` fields to Settings model |
| `prisma/migrations/YYYYMMDD_add_settings_group/` | Create | Migration file |
| `src/modules/settings/domain/setting.entity.ts` | Modify | Add `group`, `sortOrder` fields |
| `src/modules/settings/domain/settings.repository.interface.ts` | Modify | Add `findGrouped()` method |
| `src/modules/settings/infrastructure/settings.repository.ts` | Modify | Implement `findGrouped()` |
| `src/modules/settings/dto/update-settings.dto.ts` | Modify | Add optional `group` field |
| `src/modules/settings/dto/create-settings.dto.ts` | Create | DTO for creating new settings |
| `src/modules/settings/settings.service.ts` | Modify | Add `create()`, update group assignment, return grouped data |
| `src/modules/settings/settings.controller.ts` | Modify | Add `POST /settings` endpoint, `GET /settings/admin/grouped` |

### Frontend (yunkhngn-fe)
| File | Action | Purpose |
|------|--------|---------|
| `app/(admin)/admin/settings/SettingsClient.jsx` | Rewrite | Dynamic tabs from API, CRUD for groups and keys |

---

### Task 1: Add group field to Prisma schema and migrate

**Files:**
- Modify: `yunkhngn-be/prisma/schema.prisma:188-194`

- [ ] **Step 1: Update the Settings model**

Replace the current Settings model with:

```prisma
model Settings {
  id           Int     @id @default(autoincrement())
  settingTitle String  @unique
  content      String? @db.NVarChar(Max)
  group        String  @default("Uncategorized")
  sortOrder    Int     @default(0)

  @@index([group])
  @@map("settings")
}
```

- [ ] **Step 2: Create and run migration**

```bash
cd yunkhngn-be
npx prisma migrate dev --name add_settings_group
```

Expected: Migration creates `group` (default "Uncategorized") and `sortOrder` columns.

- [ ] **Step 3: Commit**

```bash
git add prisma/
git commit -m "feat(db): add group and sortOrder fields to settings"
```

---

### Task 2: Seed existing settings with correct groups

**Files:**
- Modify: `yunkhngn-be/src/modules/settings/settings.service.ts`

- [ ] **Step 1: Replace SYSTEM_SETTINGS flat array with grouped definition**

Replace the `SYSTEM_SETTINGS` array (lines 15-57) with a grouped map:

```typescript
const SYSTEM_SETTINGS_MAP: Record<string, { keys: string[]; sortOrder: number }> = {
  'General': {
    keys: ['bio', 'quote', 'email', 'homepage_description', 'footer_description', 'about_content', 'comment_forbidden_keywords'],
    sortOrder: 0,
  },
  'Appearance': {
    keys: ['avatar', 'about_image_story', 'about_image_journey', 'about_image_skills', 'about_image_contact'],
    sortOrder: 1,
  },
  'Social Media': {
    keys: ['facebook', 'github', 'instagram', 'tiktok', 'linkedin'],
    sortOrder: 2,
  },
  'Resume / CV': {
    keys: ['education', 'experience', 'skills', 'projects', 'cv_url'],
    sortOrder: 3,
  },
  'Cloudinary': {
    keys: ['cloudinary_cloud_name', 'cloudinary_api_key', 'cloudinary_api_secret'],
    sortOrder: 4,
  },
  'Email / Resend': {
    keys: ['resend_api_key', 'resend_domain', 'admin_email'],
    sortOrder: 5,
  },
  'Cloudflare': {
    keys: ['cloudflare_zone_id', 'cloudflare_account_id', 'cloudflare_api_token'],
    sortOrder: 6,
  },
  'GitHub': {
    keys: ['github_api_key', 'github_username', 'github_repo_name'],
    sortOrder: 7,
  },
  'Music / Last.fm': {
    keys: ['lastfm_api_key', 'lastfm_username'],
    sortOrder: 8,
  },
  'Vercel': {
    keys: ['vercel_api_token', 'vercel_project_id', 'vercel_team_id'],
    sortOrder: 9,
  },
  'AI': {
    keys: ['gemini_api_key', 'gemini_api_keys', 'ai_persona', 'chat_api_key', 'chat_forbidden_words'],
    sortOrder: 10,
  },
  'Other': {
    keys: ['journal_moods'],
    sortOrder: 99,
  },
};

// Flatten for backward compat
const SYSTEM_SETTINGS = Object.values(SYSTEM_SETTINGS_MAP).flatMap(g => g.keys);
```

- [ ] **Step 2: Update onModuleInit to set groups**

```typescript
async onModuleInit() {
  try {
    this.logger.log('Initializing system settings');
    for (const [group, { keys, sortOrder }] of Object.entries(SYSTEM_SETTINGS_MAP)) {
      for (let i = 0; i < keys.length; i++) {
        const title = keys[i];
        const existing = await this.settingsRepository.findByTitle(title);
        if (!existing) {
          await this.settingsRepository.create(title, '', group, sortOrder * 100 + i);
        } else if (!existing.group || existing.group === 'Uncategorized') {
          await this.settingsRepository.updateGroup(existing.id, group, sortOrder * 100 + i);
        }
      }
    }
  } catch (error) {
    this.logger.error('Failed to initialize settings', error.stack);
  }
}
```

- [ ] **Step 3: Add create method**

```typescript
async create(settingTitle: string, content: string, group?: string) {
  if (await this.settingsRepository.findByTitle(settingTitle)) {
    throw new BadRequestException(`Setting "${settingTitle}" already exists`);
  }
  return this.settingsRepository.create(settingTitle, content || '', group || 'Uncategorized', 0);
}
```

- [ ] **Step 4: Add getGroupedSettings method**

```typescript
async getGroupedSettings(): Promise<{ group: string; settings: any[] }[]> {
  const all = await this.settingsRepository.findAll();

  // Mask sensitive values
  const masked = all.map(s => {
    if (SENSITIVE_KEYS.includes(s.settingTitle) && s.content) {
      return { ...s, content: '********' };
    }
    return s;
  });

  // Group by `group` field
  const groupMap = new Map<string, any[]>();
  for (const s of masked) {
    const g = s.group || 'Uncategorized';
    if (!groupMap.has(g)) groupMap.set(g, []);
    groupMap.get(g).push(s);
  }

  // Sort groups by min sortOrder, sort settings within group by sortOrder
  return Array.from(groupMap.entries())
    .map(([group, settings]) => ({
      group,
      settings: settings.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)),
    }))
    .sort((a, b) => {
      const aMin = Math.min(...a.settings.map(s => s.sortOrder || 0));
      const bMin = Math.min(...b.settings.map(s => s.sortOrder || 0));
      return aMin - bMin;
    });
}
```

- [ ] **Step 5: Commit**

```bash
git add src/modules/settings/
git commit -m "feat(settings): add grouped settings with seed logic"
```

---

### Task 3: Update repository layer

**Files:**
- Modify: `yunkhngn-be/src/modules/settings/domain/setting.entity.ts`
- Modify: `yunkhngn-be/src/modules/settings/domain/settings.repository.interface.ts`
- Modify: `yunkhngn-be/src/modules/settings/infrastructure/settings.repository.ts`

- [ ] **Step 1: Update entity**

```typescript
export class Setting {
  id: number;
  settingTitle: string;
  content: string;
  group: string;
  sortOrder: number;
}
```

- [ ] **Step 2: Update repository interface**

Add to `ISettingsRepository`:

```typescript
  create(title: string, content: string, group: string, sortOrder: number): Promise<Setting>;
  updateGroup(id: number, group: string, sortOrder: number): Promise<Setting>;
```

- [ ] **Step 3: Update repository implementation**

Add to `PrismaSettingsRepository`:

```typescript
  async create(title: string, content: string, group: string, sortOrder: number): Promise<Setting> {
    return this.prisma.settings.create({
      data: { settingTitle: title, content, group, sortOrder },
    });
  }

  async updateGroup(id: number, group: string, sortOrder: number): Promise<Setting> {
    return this.prisma.settings.update({
      where: { id },
      data: { group, sortOrder },
    });
  }
```

- [ ] **Step 4: Commit**

```bash
git add src/modules/settings/
git commit -m "feat(settings): update repository with group support"
```

---

### Task 4: Update controller with new endpoints

**Files:**
- Modify: `yunkhngn-be/src/modules/settings/settings.controller.ts`
- Create: `yunkhngn-be/src/modules/settings/dto/create-settings.dto.ts`

- [ ] **Step 1: Create CreateSettingsDto**

```typescript
import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

export class CreateSettingsDto {
  @IsString()
  @IsNotEmpty()
  settingTitle: string;

  @IsString()
  @IsOptional()
  content?: string;

  @IsString()
  @IsOptional()
  group?: string;
}
```

- [ ] **Step 2: Add endpoints to controller**

Add `POST /settings` for creating, and `GET /settings/admin/grouped` for grouped view:

```typescript
@Get('admin/grouped')
@ApiBearerAuth()
@ApiOperation({ summary: 'Get all settings grouped by tab (Admin only)' })
@UseGuards(FirebaseAuthGuard)
getGroupedSettings() {
  return this.settingsService.getGroupedSettings();
}

@Post()
@ApiBearerAuth()
@ApiOperation({ summary: 'Create a new setting' })
@UseGuards(FirebaseAuthGuard)
create(@Body() dto: CreateSettingsDto) {
  return this.settingsService.create(dto.settingTitle, dto.content, dto.group);
}
```

Import `Post` and `CreateSettingsDto` at top of file.

**Note:** The `GET admin/grouped` route must be defined BEFORE `GET admin` since `admin` route would also match. If conflicts arise, rename to `GET admin-grouped`.

- [ ] **Step 3: Commit**

```bash
git add src/modules/settings/
git commit -m "feat(settings): add create endpoint and grouped settings API"
```

---

### Task 5: Rewrite SettingsClient.jsx for dynamic groups

**Files:**
- Modify: `yunkhngn-fe/app/(admin)/admin/settings/SettingsClient.jsx`

- [ ] **Step 1: Rewrite the component**

Key changes:
1. **Remove** the hardcoded `SETTINGS_GROUPS` array entirely
2. **Fetch** from `/settings/admin/grouped` instead of `/settings/admin`
3. **Render tabs dynamically** from the API response `[{ group, settings }]`
4. **Add "New Setting" button** — opens a dialog with fields: Key (settingTitle), Content, Group (dropdown of existing groups or type new)
5. **Add "Delete" button** per setting row (with ConfirmModal)
6. **Keep** all existing edit functionality (Monaco editor, image upload, password masking)
7. **Add group rename** — clicking on group title allows inline edit

The Collapsible sections now iterate `groups` from the API:

```jsx
// Replace: const SETTINGS_GROUPS = [...]
// Replace: fetchSettings fetches from /settings/admin/grouped

const [groups, setGroups] = useState([]); // [{ group: string, settings: [] }]

// Fetch:
const res = await fetch(`${API}/settings/admin/grouped`, { headers: { Authorization: ... } });
const data = await readNestJson(res);
setGroups(data);

// Render:
{groups.map(({ group, settings }) => (
  <Collapsible key={group} ...>
    <CollapsibleTrigger>{group} ({settings.length})</CollapsibleTrigger>
    <CollapsibleContent>
      <Table>...</Table>
    </CollapsibleContent>
  </Collapsible>
))}
```

- [ ] **Step 2: Add "New Setting" dialog**

A dialog with:
- `settingTitle` input (required, snake_case)
- `content` textarea
- `group` — a combo input: Select from existing groups OR type a new group name
- Submit calls `POST /settings`

- [ ] **Step 3: Add delete per row**

Each table row gets a trash icon button. Clicking it opens `ConfirmModal`. On confirm, calls `DELETE /settings/:id`.

- [ ] **Step 4: Verify the UI**

Navigate to `/admin/settings`:
- Tabs should render dynamically from DB data
- "New Setting" button works
- Edit dialog works (unchanged behavior)
- Delete with confirm works
- Groups from DB match the old hardcoded groups

- [ ] **Step 5: Commit**

```bash
git add app/\(admin\)/admin/settings/
git commit -m "feat(settings): dynamic settings management with CRUD"
```

---

### Task 6: Frontend SETTINGS_GROUPS cleanup in other files

- [ ] **Step 1: Search for any hardcoded SETTINGS_GROUPS references**

```bash
grep -r "SETTINGS_GROUPS" yunkhngn-fe/
```

Remove any remaining references. The only file should be `SettingsClient.jsx` which was already updated.

- [ ] **Step 2: End-to-end test**

1. Go to `/admin/settings`
2. Click "New Setting" → create `test_key` in group "Test Group"
3. Verify new "Test Group" tab appears
4. Edit `test_key` content
5. Delete `test_key`
6. Verify "Test Group" disappears (no settings left)

- [ ] **Step 3: Commit**

```bash
git commit -m "feat(settings): cleanup and verification"
```
