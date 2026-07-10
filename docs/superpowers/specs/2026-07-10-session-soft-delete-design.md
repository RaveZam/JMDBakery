# Session Soft Delete — Design

**Date:** 2026-07-10
**App:** `apps/agent-app` (mobile write path), `supabase` (schema), admin visibility only
**Status:** Approved for planning

## Problem

Agents have no way to remove a mistaken session (e.g. accidentally started, or an
abandoned test run) from their device. There's currently no delete concept at
all — only `status IN ('ongoing', 'completed', 'cancelled')`. We need:

- The agent's device to drop the session **instantly**, with no trace left locally.
- The admin side to still be able to see that the session existed and was
  deleted — full detail (route, sales, inventory), not just a stub — for audit.
- A deleted session must never reappear on any device after a future sync/pull.

## Decisions

- **Trigger:** agent-initiated only, from the History screen (swipe/long-press on
  a session row) — no admin-initiated delete in this scope.
- **Eligible states:** only `ongoing` or `cancelled` sessions can be deleted.
  `completed` sessions carry real sales/inventory data and are never deletable
  through this flow.
- **Local delete is a hard delete.** No local `deleted_at` column needed — the
  row and its children (`session_stores`, `sales`, `session_inventory`,
  `ending_inventory`, all `ON DELETE CASCADE`) vanish from the device
  immediately via the existing FK cascade.
- **Remote delete is a soft delete.** One nullable `deleted_at timestamptz`
  column added to Supabase `route_sessions`. Only the parent row is flagged —
  child rows are left untouched so admin can still drill into full session
  detail after it's marked deleted.

## Design

### 1. Reuse the outbox's existing `update` path — no new operation type

Rather than teaching `outbox.ts` a new soft-delete operation, the local delete
enqueues a normal **`update`** with a `deleted_at` payload:

```ts
getDb().withTransactionSync(() => {
  RouteSessionsDao.delete(sessionId); // hard delete, cascades locally
  enqueueOutbox({
    entityType: "route_session",
    entityId: sessionId,
    operation: "update",
    payload: { id: sessionId, deleted_at: new Date().toISOString() },
  });
});
```

`dispatchRow`'s `update` branch already does `.update(payload).eq("id", ...)` —
zero changes to `src/lib/sync/outbox.ts`.

### 2. New DAO method

`RouteSessionsDao.delete(id)` in `src/lib/dao/route-sessions-dao.ts`:

```sql
DELETE FROM route_sessions WHERE id = ?
```

### 3. New service, guarded by status

`deleteHistorySession(sessionId)` in
`src/features/history/services/delete-session-service.ts` (mirrors
`cancelHistorySession` in the same folder):

- Read the row first via `RouteSessionsDao.getById`.
- Throw if `row.status === 'completed'` (a typed error, same pattern as
  `OngoingSessionExistsError`).
- Otherwise run the transaction from §1.

### 4. UI entry point

`HistorySessionCard` (`src/features/history/components/HistorySessionCard.tsx`)
gains a delete action (swipe-to-delete or long-press context menu) that's only
enabled for `ongoing`/`cancelled` rows. Confirm with an `Alert` before calling
`deleteHistorySession`, then refresh `useHistoryList`'s data.

### 5. Supabase schema

New migration: `ALTER TABLE route_sessions ADD COLUMN deleted_at timestamptz;`

### 6. Download sync must exclude soft-deleted rows

`downloadSessions()` in `src/lib/sync/download.ts` currently does
`supabase.from("route_sessions").select("*")` with no filter — a deleted
session would otherwise get pulled straight back onto the device (reinstall,
second device, etc.). Add:

```ts
supabase.from("route_sessions").select("*").is("deleted_at", null)
```

### 7. Admin visibility (schema only — no UI in this scope)

No admin session UI exists yet. This design only guarantees the data is there
and queryable: `WHERE deleted_at IS NULL` for the live list, `WHERE deleted_at
IS NOT NULL` to see what was deleted, with full child data intact for either
query. Building that admin UI is separate future work.

## Files touched

- `supabase/migrations/` — new migration adding `route_sessions.deleted_at`.
- `src/lib/dao/route-sessions-dao.ts` — `delete(id)`.
- `src/lib/sync/download.ts` — `.is("deleted_at", null)` filter in `downloadSessions`.
- `src/features/history/services/delete-session-service.ts` — new file,
  `deleteHistorySession` with the completed-status guard.
- `src/features/history/components/HistorySessionCard.tsx` — delete action + confirm.
- `src/features/history/hooks/useHistoryList.ts` — refresh after delete.

## Testing

- **DAO/service (integration DB test):** deleting an ongoing/cancelled session
  removes the row and cascades children locally; deleting a completed session
  throws and leaves the row untouched; outbox gets exactly one `update` row
  with a `deleted_at` payload (not a `delete` op).
- **download sync:** a session with `deleted_at` set is excluded from the pulled set.

## Out of scope

- Admin-initiated delete.
- Admin dashboard UI for viewing/restoring deleted sessions.
- Deleting `completed` sessions (no flow exists; would need a separate,
  more deliberate admin-side path if ever needed).
