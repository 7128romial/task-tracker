# מעקב משימות · Task Tracker

A polished, right-to-left Hebrew task tracker for a single student managing assignments, exams, lecture recordings, projects, and readings. Three synchronized views (table / kanban / timeline), localStorage persistence with versioned migrations and rotating backups, rich metadata (createdAt, updatedAt, completedAt, full status history), and JSON import/export — all in strict TypeScript.

> אפליקציה חד-משתמשית לניהול משימות בעברית, שלוש תצוגות שמסונכרנות (טבלה / לוח / ציר זמן), שמירה מקומית עם גיבויים מסתובבים ומטא־דאטה עשיר.

## Quick start

```bash
npm install
npm run dev          # http://localhost:5173
npm run build        # type-check (tsc) + bundle (vite)
npm run preview      # serve the production build
```

## Keyboard shortcuts

| Key              | Action                 |
| ---------------- | ---------------------- |
| `N`              | New task               |
| `/`              | Focus search           |
| `1` / `2` / `3`  | Table / Kanban / Timeline |
| `Cmd/Ctrl + Enter` | Save form            |
| `Esc`            | Close modal            |

## Storage

All data lives in `localStorage` under these keys:

- `taskTracker.v1` — current state, shape `{ version: 1, tasks: Task[] }`
- `taskTracker.backup.1` / `.2` / `.3` — auto-rotated snapshots, newest first, taken before every write

### Export / Import

The footer offers **Export JSON** (downloads `tasks-backup-YYYY-MM-DD.json`) and **Import JSON** (validates shape, confirms count, then replaces state).

### Schema migrations

`src/utils/storage.ts` exposes a `migrate()` function that narrows unknown blobs and throws on unknown versions. When bumping the schema, add a `migrateV{n-1}toVn` branch; `loadState()` funnels every read through `migrate()`.

## Architecture

- **Store** (`src/stores/taskStore.ts`) — Zustand. The **only** place where metadata (`updatedAt`, `completedAt`, `statusHistory`) is computed. Components call `addTask`, `updateTask`, `cycleStatus`, etc. Persistence is a `subscribe` listener so every mutation is saved.
- **Types + constants** — `src/types/task.ts`, `src/constants/task.ts`. No inline magic strings for statuses, priorities, or types.
- **Localization** — every user-facing string lives in `src/locales/he.ts`.
- **Views** — `src/components/views/{TableView,KanbanView,TimelineView}.tsx`, each purely rendering the filtered task list.

## Design

- Warm paper cream background (`#F5F1EA`), deep forest green accent (`#2E5247`), soft priority/status swatches.
- **Heebo** for body + UI, **Fraunces italic** for display headings.
- CSS variables in `src/index.css` map to Tailwind tokens in `tailwind.config.ts`, so theme tuning happens in one place.

## Responsiveness

- Mobile (≤ 767px): 2-col stats, single-column Kanban fallback, task form renders as a bottom sheet, simplified table columns (course & priority hidden, expandable row).
- Tablet (768–1023px): 2-col stats, 3-col Kanban.
- Desktop (≥ 1024px): 4-col stats, full Kanban drag-and-drop.

Drag-and-drop is automatically disabled on touch devices (`hover: none, pointer: coarse`); tap a card to change status through the form instead.

## Out of scope (intentional)

Dark mode, recurring tasks, notifications, backend sync, time-tracking dashboards, multi-user support.
