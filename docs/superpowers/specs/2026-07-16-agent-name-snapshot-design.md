# Snapshot agent name onto `route_sessions`

**Date:** 2026-07-16
**Status:** Approved (pending spec review)

## Problem

Agent names live only in `auth.users.user_metadata.name`, reachable only via the
service-role admin API (`supabase.auth.admin.listUsers()`). The admin sales
dataset (`app/server/getBaseData.ts` → `getSalesDataset`) calls `getAgentMap()`
on **every** fetch, which lists *every* user just to label a handful of
`conducted_by` UUIDs. This:

- Forces the read path to be server-only and to ship the service-role key.
- Does unnecessary work (full user list) on each dataset load.
- Blocks the dataset from ever running client-side.

## Goal

Remove the service-role `listUsers()` dependency from the **sales read path** by
snapshotting the agent's name onto `route_sessions` at session creation —
matching the existing `snapshot_product_name` / `snapshot_price` denormalization
pattern already used on `sales`.

Out of scope: `getAgentMap` stays and is still used by `api/chat` and
`getAgents`. Only `getSalesDataset` stops using it.

## Decisions

- **Home for the name:** a `conducted_by_name` column on `route_sessions`
  (snapshot), not a public `agents` table.
- **Null handling:** a Supabase `BEFORE INSERT OR UPDATE` trigger fills the
  column from `auth.users` when NULL, so old app versions never produce
  "Unknown" during rollout.
- **App write path:** kept as belt-and-suspenders — the agent-app also writes
  the name, so the value is captured offline-first and survives the trigger ever
  being dropped. The trigger only fills when the app-provided value is NULL, so
  the two never conflict.

## Changes

### A. Supabase (remote)

1. **Column:** `ALTER TABLE route_sessions ADD COLUMN conducted_by_name text;`
2. **Trigger:** `BEFORE INSERT OR UPDATE ON route_sessions`, a `SECURITY DEFINER`
   function that, when `NEW.conducted_by_name IS NULL`, sets it to
   `(SELECT raw_user_meta_data->>'name' FROM auth.users WHERE id = NEW.conducted_by)`.
   Only fills on NULL, so an app-provided value is never overwritten.
3. **Backfill (one-time):** service-role script (precedent: repo-root
   `seed-sales.js`) builds the uuid→name map once via `listUsers()`, then
   `UPDATE route_sessions SET conducted_by_name = <name> WHERE conducted_by = <uuid>
   AND conducted_by_name IS NULL`. This is the last time the admin API touches
   the read path. Idempotent / re-runnable.

### B. agent-app (offline-first write path)

The agent's own name is already in their auth session at session creation.

1. **SQLite migration** (`src/lib/db.ts`):
   `ALTER TABLE route_sessions ADD COLUMN conducted_by_name TEXT`, following the
   existing `morning_inventory_finished` ALTER migration pattern.
2. **`src/lib/dao/route-sessions-dao.ts`:** add `conductedByName` to `insert`
   and `upsertSession` params + SQL, and add `conducted_by_name` to
   `RouteSessionRow`.
3. **`src/features/sessions/services/route-session-create-service.ts`:** accept
   `conductedByName`, pass to the DAO, and include `conducted_by_name` in the
   outbox `create` payload.
4. **`src/features/sessions/services/sessionLocalService.ts` → `startSession`:**
   source the name as
   `session.user.user_metadata?.name ?? session.user.email ?? "Unknown"`
   (mirrors admin `getAgentMap`) and pass it as `conductedByName`.
   `completeSession` / `cancelSession` already re-enqueue the full row via
   `getById` (`SELECT *`), so they carry the new column automatically.
5. **`src/lib/sync/download.ts` → `downloadSessions`:** already `select("*")`;
   pass `conductedByName: row.conducted_by_name` into `upsertSession` so pulled
   sessions retain the name locally.

### C. admin (read path)

1. **`app/server/getBaseData.ts` → `getSalesDataset`:**
   - Remove the `getAgentMap` import and its call (and the `Promise.all` wrapper).
   - Change the query select from `conducted_by` to `conducted_by_name`.
   - `agent = session.conducted_by_name ?? "Unknown"`.
   - Update the `RawSession` type (`conducted_by_name: string | null`).
   - `getSalesDataset` no longer needs the service role; it still uses the
     cookie-based server client, so the `/api/sales-dataset` route stays.

## Data flow

Agent starts session offline → name written into the SQLite row + outbox payload
→ outbox sync upserts `route_sessions.conducted_by_name` to Supabase (trigger
backstops NULL) → admin sales query selects the name directly → dashboard /
intelligence / records aggregate client-side. No `listUsers` on the read path.

## Rollout order

1. Add the remote column + trigger.
2. Ship the agent-app change (new sessions carry the name; trigger covers old
   installs).
3. Run the backfill for historical rows.
4. Flip the admin read to `conducted_by_name`.

## Edge cases

- **NULL name** (pre-backfill rows, or a stale app version) → trigger fills from
  `auth.users`; if still null, `getSalesDataset` falls back to `"Unknown"`
  (identical to today's behavior for unmapped UUIDs).
- **Name changed after the session** → snapshot stays frozen, which is correct
  for a historical sales record (same semantics as `snapshot_price`).
- **App-provided value vs. trigger** → trigger only fills on NULL, so an
  app-written name is authoritative.

## Testing

- **agent-app** (Jest + integration DB tests):
  - `route-session-create-service` test: outbox `create` payload includes
    `conducted_by_name`.
  - `sessionLocalService` test: `startSession` sources the name from the auth
    session and passes it through.
  - db migration test: the column exists after `initDb()`.
  - download test: pulled sessions retain `conducted_by_name`.
- **admin:**
  - `getSalesDataset` maps `conducted_by_name` and no longer imports
    `getAgentMap`.
- **Supabase:** trigger fills `conducted_by_name` on insert when NULL; leaves a
  provided value untouched.
