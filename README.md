# Tasks · מעקב משימות

A Grafana-inspired dark task tracker for a single Hebrew-speaking student. Data-dense, panel-based, right-to-left. Three synchronized views (table / kanban / timeline), two data panels (completion rate over 14 days, distribution by course), a command palette (⌘K), and localStorage persistence with versioned migrations and rotating backups.

Strict TypeScript throughout. No `any`. Metadata invariants (`updatedAt`, `completedAt`, `statusHistory`) enforced centrally in the store.

## Quick start

```bash
npm install
npm run dev          # http://localhost:5173
npm run build        # type-check (tsc) + production bundle
npm run preview      # serve the production build
```

## Keyboard shortcuts

| Key                | Action                     |
| ------------------ | -------------------------- |
| `N`                | New task                   |
| `/`                | Focus search               |
| `1` / `2` / `3`    | Table / Kanban / Timeline  |
| `⌘/Ctrl + K`       | Open command palette       |
| `⌘/Ctrl + Enter`   | Save form                  |
| `Esc`              | Close modal or palette     |

## Storage

All data lives in `localStorage` under:

- `taskTracker.v1` — current payload, shape `{ version: 1, tasks: Task[] }`
- `taskTracker.backup.1` / `.2` / `.3` — auto-rotated snapshots, newest first, taken before every write

### Export / Import

The footer offers **ייצוא** (downloads `tasks-backup-YYYY-MM-DD.json`) and **ייבוא** (validates shape, confirms task count, replaces state on confirm). A "נתוני דוגמה" button seeds 8 varied tasks including several with historical status changes in the last 14 days, so the completion chart has data to render.

### Schema migrations

`src/utils/storage.ts` exposes `migrate()` — narrows unknown blobs and throws on unknown versions. For future schemas, add a `migrateV{n-1}toVn` branch; `loadState()` funnels every read through `migrate()`.

## Architecture

- **Store** (`src/stores/taskStore.ts`) — Zustand. The **only** place where metadata (`updatedAt`, `completedAt`, `statusHistory`) is computed. Components call `addTask`, `updateTask`, `cycleStatus`, etc. Persistence is a `subscribe` listener that saves on every mutation.
- **Types + constants** — `src/types/task.ts`, `src/constants/task.ts`, `src/constants/colors.ts`. No inline magic strings.
- **Localization** — every user-facing string lives in `src/locales/he.ts`.
- **Views** — `src/components/views/{TableView,KanbanView,TimelineView}.tsx`, each rendering from `selectFilteredTasks`.
- **Panels** — `src/components/panels/{CompletionChart,CourseDistribution}.tsx`, derived from the store.
- **UI primitives** — shadcn-style components in `src/components/ui/`, Grafana Panel / Badge / Kbd in `src/components/`.

### Stats deltas

Each stat panel shows a `+N` / `-N` delta versus one week ago, reconstructed by walking each task's `statusHistory` backwards to a cutoff timestamp. The Done card is green-on-up; Open and In-Progress are red-on-up; Urgent is amber (change either direction is notable).

### Completion chart

Cumulative completions (green area) come from each task's last `statusHistory` entry whose status is `done`. Newly opened (orange stroke) come from `createdAt`. Both bucketed by calendar day over the last 14 days.

## Design

Grafana-inspired dark palette:

- Page `#111217`, panels `#181B1F`, elevated `#22252B`
- 1px panel borders `#2F3237`, 2px square corners
- Single warm accent: **orange `#FF780A`** (primary buttons, chart series)
- Severity palette: open gray, progress blue, done green, urgent orange, error red
- **Inter** for UI, **JetBrains Mono** for numbers / IDs / dates

Priority renders as `P0` / `P1` / `P2` in the table and kanban (engineering-tracker feel); full Hebrew labels (גבוהה / בינונית / נמוכה) in the form.

## Responsiveness

- Mobile (≤ 767px): 2-col stats, bottom panels stack, table hides ID / course / priority columns with expandable row, task form becomes bottom sheet, drag-and-drop disabled on touch (tap card to edit).
- Tablet (768–1023px): 4-col stats, bottom panels can stack depending on viewport.
- Desktop (≥ 1024px): full layout with 2-col chart grid and drag-and-drop enabled.

## Out of scope (intentional)

Light mode, recurring tasks, notifications, backend sync, time-tracking dashboards, multi-user, custom dashboard layout, pluggable widgets.
