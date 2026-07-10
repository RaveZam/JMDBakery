-- Adds soft-delete support to route_sessions.
--
-- Agents can delete ongoing/cancelled sessions from the mobile app. The local
-- SQLite row is hard-deleted (cascades to children), but the outbox pushes an
-- update with deleted_at set instead of a hard delete, so admins can still see
-- what was deleted and the download sync can exclude it going forward.

ALTER TABLE public.route_sessions
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz;
