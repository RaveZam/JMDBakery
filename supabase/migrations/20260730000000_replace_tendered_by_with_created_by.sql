-- stores.tendered_by and stores.created_by are the same fact — the agent who
-- registered the store — recorded twice. tendered_by predates the migration
-- that added created_by (20260729000000) and was never written down in a
-- migration; it exists only as a DEFAULT auth.uid() on the column.
--
-- Nothing reads tendered_by: no RLS policy, no function, no view, and no app
-- code except the analytics chat prompt's schema block, which lists it as a
-- selectable uuid the model has no user table to resolve. So it goes, and
-- created_by stays as the single attribution column.
--
-- Order matters. created_by was backfilled through
-- stores.province_id -> agent_provinces -> agent_routes.owner_id, and
-- province_id is ON DELETE SET NULL, so that path only reached the stores whose
-- origin province still exists. tendered_by has the rest. Copying it across
-- before the drop is the whole point of this migration: afterwards the value is
-- gone for good.

update public.stores
set created_by = tendered_by
where created_by is null
  and tendered_by is not null;

update public.stores s
set created_by_name = coalesce(
  u.raw_user_meta_data ->> 'name',
  u.raw_user_meta_data ->> 'full_name',
  u.email
)
from auth.users u
where u.id = s.created_by
  and s.created_by_name is null;

alter table public.stores
  drop column if exists tendered_by;
