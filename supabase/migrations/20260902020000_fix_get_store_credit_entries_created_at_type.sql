-- store_credit_entries.created_at holds a Manila wall clock with no timezone
-- (e.g. "2026-09-02T22:00:00.500"), the same format every created_at in the
-- app uses. The admin site reads those digits as-is (lib/manilaTimestamp.ts).
--
-- get_store_credit_entries declared its created_at OUT column as timestamptz,
-- which forces Postgres to cast the naive value: it gets read in one zone and
-- serialized in another, so an evening entry lands on the next calendar day.
-- That's why the Credit panel's ledger showed a payment made the evening of
-- Sep 2 as "Sep 3", while the payments views — which select created_at
-- straight off the table — show the right day.
--
-- Return it as a plain timestamp so the digits pass through untouched.
-- Return type changes, so the function is dropped and recreated.
drop function if exists public.get_store_credit_entries(text);

create function public.get_store_credit_entries(p_store_id text)
returns table (
  id text,
  entry_type text,
  amount numeric,
  note text,
  recorded_by_name text,
  created_at timestamp
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
    sce.created_at
  from public.store_credit_entries sce
  where sce.store_id = p_store_id
  order by sce.created_at desc;
$$;
