-- session_inventory recorded the product name at load time but not the price,
-- so pricing during a session was always a live lookup against products. Once a
-- deleted product actually disappears from an agent's device that lookup misses
-- and the agent sees ₱0 for stock they physically hold.
--
-- Nullable, with no backfill: rows written before this migration genuinely have
-- no snapshot, and the app falls back to 0 for them exactly as it does today.
alter table public.session_inventory
  add column if not exists snapshot_price numeric;
