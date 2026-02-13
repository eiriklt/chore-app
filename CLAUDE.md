# Office Chore Manager

A client-side React SPA for coordinating shared chores among team members. Users create, assign, schedule (with recurrence), and track completion of chores on a visual calendar. All data persists in browser localStorage — no backend.

## Tech Stack

- **React 19** + **TypeScript 5.9** + **Vite 7.3**
- **react-big-calendar** — calendar UI component
- **date-fns** — date manipulation (used throughout, no moment/dayjs)
- **CSS** — plain CSS, no utility framework or CSS-in-JS
- **ESLint** — flat config format (`eslint.config.js`)

## Project Structure

```
src/
├── types.ts              # All shared interfaces (Chore, TeamMember, CalendarEvent, Recurrence)
├── App.tsx               # Root component — owns modal state, wires everything together
├── App.css               # All application styles
├── main.tsx              # React entry point
├── hooks/
│   ├── useChores.ts      # Primary state hook — all CRUD for chores & members
│   └── useLocalStorage.ts # Generic localStorage persistence hook
├── components/
│   ├── Calendar.tsx       # react-big-calendar wrapper with event styling
│   ├── ChoreModal.tsx     # Create/edit chore form with recurrence controls
│   ├── Sidebar.tsx        # Layout shell for sidebar panel
│   └── TeamManager.tsx    # Team member CRUD + calendar filtering
└── utils/
    └── recurrence.ts      # Expands a Chore into CalendarEvent[] for a date range
```

## Commands

| Command           | Purpose                             |
|-------------------|-------------------------------------|
| `npm run dev`     | Start Vite dev server with HMR      |
| `npm run build`   | Type-check (`tsc -b`) + production build |
| `npm run lint`    | ESLint across all files              |
| `npm run preview` | Serve production build locally       |

## Key Data Types

All defined in `src/types.ts`. The four core interfaces:
- **Chore** — title, description, assigneeId, date, recurrence, completed dates
- **TeamMember** — id, name, color
- **Recurrence** — type (none/daily/weekly/monthly), interval, weekdays, endDate
- **CalendarEvent** — derived from Chore for react-big-calendar consumption

## Data Flow

1. `useChores` hook (`src/hooks/useChores.ts:6`) manages all state via `useLocalStorage`
2. Chores are stored as raw objects; `expandChoreToEvents` (`src/utils/recurrence.ts:15`) converts them to calendar events on demand within a date range
3. `Calendar.tsx:32` calls `getEvents()` via `useMemo` to compute visible events
4. Completion tracked per-occurrence via `chore.completed[]` array of date strings

## Important Conventions

- **No backend/API** — all persistence is localStorage only
- **No routing** — single-page app, modals for navigation
- **IDs** — generated via `crypto.randomUUID()`
- **Date format** — `'yyyy-MM-dd'` strings throughout (ISO date, no time)
- **Named exports** for all components and hooks; default export only for `App`

## Workflow

- **Always create a new git branch** before starting work on a new feature or bug fix
- Work on all changes in that branch for the remainder of the session

## Additional Documentation

Check these when working on related areas:

- [Architectural Patterns](.claude/docs/architectural_patterns.md) — state management, component patterns, data flow conventions
