# Architectural Patterns

## State Management: Custom Hook + localStorage

The app uses a single custom hook (`useChores`) as its state layer instead of Redux/Zustand/Context. This hook encapsulates all CRUD operations and exposes a flat API.

**Pattern:** All state setters are wrapped in `useCallback` with functional updates (`setX(prev => ...)`) to ensure referential stability and avoid stale closures.

- `src/hooks/useChores.ts:10-32` — every mutation uses `useCallback` + functional updater
- `src/hooks/useLocalStorage.ts:3` — generic `useLocalStorage<T>` returns `[T, Dispatch<SetStateAction<T>>]`, matching `useState` signature

**Cascading deletes:** When a member is removed, their chores are automatically unassigned (`src/hooks/useChores.ts:38-44`).

## Component Architecture: Container / Presentational Split

**Container component:** `App.tsx` owns all state and modal logic. It passes callbacks down via props — no context providers.

**Presentational components:** `Sidebar`, `Calendar`, `TeamManager`, `ChoreModal` receive data and callbacks through props. They manage only local UI state (form inputs, view state).

**Pattern locations:**
- `App.tsx:10-20` — destructures the entire `useChores` API
- `App.tsx:64-93` — props drilling to all child components
- `Calendar.tsx:29-30` — local state for `currentDate` and `currentView`
- `ChoreModal.tsx:32-38` — local state mirrors chore fields for editing

## Modal Pattern: Conditional Render + State Object

Modals are not routed. A single modal state object controls visibility and context:

```
{ open: boolean; chore: Chore | null; initialDate?: Date; occurrenceDate?: string }
```

- `App.tsx:23-28` — modal state definition
- `App.tsx:81` — conditional render: `{modalState.open && <ChoreModal .../>}`
- `ChoreModal.tsx:40-46` — Escape key listener for dismissal
- `ChoreModal.tsx:73` — overlay click also closes

## Derived Data Pattern: Compute on Read

Chores are stored as raw objects. Calendar events are computed on-the-fly from chores within a visible date range — never stored.

- `useChores.ts:46-59` — `getEvents()` filters chores then calls `expandChoreToEvents` per chore
- `recurrence.ts:15-75` — expansion algorithm handles none/daily/weekly/monthly with iteration cap (1000)
- `Calendar.tsx:32-37` — `useMemo` recomputes events when `getEvents`, `currentDate`, or `filterMemberIds` change

## Per-Occurrence Completion Tracking

Recurring chores track completion per individual occurrence, not per series. The `completed` field is an array of `'yyyy-MM-dd'` strings.

- `types.ts:15` — `completed: string[]` on the Chore interface
- `useChores.ts:22-32` — `toggleComplete` adds/removes date strings
- `Calendar.tsx:42` — checks `chore.completed.includes(occurrenceDate)` for styling

## Color Assignment: Rotating Palette

Team member colors are assigned from a fixed 10-color palette using modular arithmetic on the current member count.

- `TeamManager.tsx:4-7` — `COLORS` array
- `TeamManager.tsx:22` — `COLORS[members.length % COLORS.length]`

## Props Interface Convention

Every component defines a `Props` interface inline in its file, not exported. Components use destructured props in the function signature.

- `Calendar.tsx:20-26`, `ChoreModal.tsx:5-14`, `Sidebar.tsx:4-11`, `TeamManager.tsx:9-15`

## Event ID Convention

Calendar events use composite IDs: `${choreId}_${dateStr}` to uniquely identify each occurrence of a recurring chore.

- `recurrence.ts:80` — `id: \`${chore.id}_${dateStr}\``
