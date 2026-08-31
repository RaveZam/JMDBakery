-- Two RPCs for the admin Stores page's Credit tab. Credit is all-time
-- (unlike revenue, which is windowed to 30 days) — a debt taken months ago
-- is still owed today, so neither function filters on created_at.
--
--  - get_store_credit_entries: full ledger for a single store, fetched when
--    the store detail modal's Credit tab opens.
--  - get_store_credit_totals: one row per store that has any entries, used
--    to stamp the "Owes ₱X" badge on every store card at once.
create or replace function public.get_store_credit_entries(p_store_id text)
returns table (
  id text,
  entry_type text,
  amount numeric,
  note text,
  recorded_by_name text,
  tendered_by_name text,
  created_at timestamptz
)
language sql
stable
security invoker
set search_path = ''
as $$
  select
    sce.id,
    sce.entry_type,
    sce.amount,
    sce.note,
    sce.recorded_by_name,
    sce.tendered_by_name,
    sce.created_at
  from public.store_credit_entries sce
  where sce.store_id = p_store_id
  order by sce.created_at desc;
$$;

create or replace function public.get_store_credit_totals()
returns table (
  store_id text,
  credit_taken numeric,
  paid_back numeric,
  balance numeric,
  last_payment_at timestamptz
)
language sql
stable
security invoker
set search_path = ''
as $$
  select
    sce.store_id,
    coalesce(sum(sce.amount) filter (where sce.entry_type = 'credit'), 0) as credit_taken,
    coalesce(sum(sce.amount) filter (where sce.entry_type = 'payment'), 0) as paid_back,
    coalesce(sum(sce.amount) filter (where sce.entry_type = 'credit'), 0)
      - coalesce(sum(sce.amount) filter (where sce.entry_type = 'payment'), 0) as balance,
    max(sce.created_at) filter (where sce.entry_type = 'payment') as last_payment_at
  from public.store_credit_entries sce
  group by sce.store_id;
$$;
