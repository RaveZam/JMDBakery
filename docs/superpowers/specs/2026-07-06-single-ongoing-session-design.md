# Single Ongoing Session — Design

**Date:** 2026-07-06
**App:** `apps/agent-app`
**Status:** Approved for planning

## Problem

After an app restart, the store page shows the wrong inventory — e.g. a session
started with "10 ube cheese pandesal" displays "50 of everything" instead.

### Root cause

`startSession` (`src/features/sessions/services/sessionLocalService.ts`) inserts a
new `route_sessions` row with `status='ongoing'` **every time it runs, with no
check for an existing ongoing session**. Each started route accumulates another
ongoing row, so a stale test session with 50 of every product remains `ongoing`
alongside the newly started session.

On cold start, `useAppReady` (`src/shared/hooks/useAppReady.ts:13`) calls
`RouteSessionsDao.getOngoing()`, which runs
`SELECT * FROM route_sessions WHERE status='ongoing'` via `getFirstSync` — **no
`ORDER BY`, no `LIMIT`**. With multiple ongoing rows it returns an arbitrary one
and restores the user into the stale session, showing its inventory.

Before restart the flow works because the user navigates in carrying the correct
`sessionId` param; after restart that param is regenerated from whichever session
`getOngoing()` happens to pick. The fix is to make "the ongoing session"
unambiguous: **at most one ongoing session at a time.**

## Decisions

- Cancelling a session sets a **new `status='cancelled'`** value, distinct from
  `completed`, so abandoned sessions are distinguishable in history/reports.
- Starting a new route while one is ongoing is a **hard block**: refuse to start
  and tell the user to cancel the existing session first. Cancelling is done on
  the ongoing session screen, not from the start prompt.

## Design

### 1. Prevent duplicates at the source

In `startSession`, before inserting, call `RouteSessionsDao.getOngoing()`. If one
exists, do not insert — throw a typed/recognizable error (e.g.
`OngoingSessionExistsError` or a sentinel) so the caller can show the block
message rather than a generic failure.

`useStartSession` catches this case and shows an alert:
> "You already have an ongoing session. Cancel it before starting a new one."

No resume/cancel action offered from this prompt (hard block).

### 2. Cancel flow

- `RouteSessionsDao.cancel(id)` — `UPDATE route_sessions SET status='cancelled'
  WHERE id = ?`.
- Service `cancelSession(sessionId)` in `sessionLocalService.ts`, mirroring
  `completeSession`: wrap in `withTransactionSync`, call `cancel`, read the row,
  `enqueueOutbox({ entityType: 'route_session', operation: 'create', payload:
  row })` so the cancelled state syncs.
- `useSession` gains a `cancelRoute` action alongside `endRoute`; after cancel,
  navigate back to `/main/routes`.
- `SessionRouteScreen` surfaces a "Cancel session" action (with a confirmation
  Alert, since it discards the session).

### 3. DB-level guardrail

Add a partial unique index in `initDb()` (`src/lib/db.ts`) so the invariant
cannot be violated even by a future bug:

```sql
CREATE UNIQUE INDEX IF NOT EXISTS idx_route_sessions_one_ongoing
  ON route_sessions (status) WHERE status = 'ongoing';
```

SQLite supports partial indexes. The index creation runs after the cleanup step
(below) so it does not fail on existing duplicate rows.

### 4. Deterministic `getOngoing()`

Defense-in-depth: `SELECT * FROM route_sessions WHERE status='ongoing'
ORDER BY created_at DESC LIMIT 1`. Even if the invariant is somehow violated,
the most recent session wins.

### 5. One-time cleanup of existing duplicates

Before creating the unique index, collapse existing duplicate ongoing rows so the
index can be created and the correct session is restored. In `initDb()`, prior to
the index creation:

```sql
UPDATE route_sessions SET status = 'cancelled'
WHERE status = 'ongoing'
  AND id NOT IN (
    SELECT id FROM route_sessions WHERE status = 'ongoing'
    ORDER BY created_at DESC LIMIT 1
  );
```

This keeps the newest ongoing session and cancels the rest. Idempotent — a no-op
once at most one ongoing row remains. (These cancellations are local-only cleanup
and are not enqueued to the outbox, since the stale rows were test data that was
never the true active session.)

## Files touched

- `src/lib/db.ts` — cleanup UPDATE + partial unique index in `initDb()`.
- `src/lib/dao/route-sessions-dao.ts` — `cancel(id)`; deterministic `getOngoing()`.
- `src/features/sessions/services/sessionLocalService.ts` — ongoing guard in
  `startSession`; new `cancelSession`.
- `src/features/sessions/hooks/useStartSession.ts` — catch block message.
- `src/features/sessions/hooks/useSession.ts` — `cancelRoute` action.
- `src/features/sessions/screens/SessionRouteScreen.tsx` — cancel button + confirm.

## Testing

- **core / DAO (integration DB test):** starting a second session while one is
  ongoing is rejected; `getOngoing` returns the newest; `cancel` frees the slot
  so a new session can start; unique index rejects a second ongoing insert.
- **cleanup:** given N ongoing rows, `initDb` leaves exactly one (the newest)
  ongoing, rest cancelled.
- **hook/UI:** `useStartSession` surfaces the block message when guard trips.

## Out of scope

- Deriving `sessionId` from `sessionStoreId` on the store page (considered; not
  needed once a single ongoing session is guaranteed).
- Admin-side reporting changes for the new `cancelled` status.
