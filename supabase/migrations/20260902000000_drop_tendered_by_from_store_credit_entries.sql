-- tendered_by / tendered_by_name (20260803000000) were meant to record the
-- rare case where the agent who collected a payment differs from
-- recorded_by. In practice recordStorePayment always split the two: it
-- copied recorded_by from the store's oldest credit entry and pushed the
-- real collector as tendered_by. That indirection already needed a looser
-- INSERT policy (20260901010000) and left the collector unable to edit or
-- delete their own payment, since every ownership check keys on
-- recorded_by.
--
-- Going back to one person per row: recorded_by is now simply the agent who
-- collected the payment. tendered_by and tendered_by_name are dropped.
--
-- Backfill first so no history is lost: where a payment was tendered by
-- someone other than its recorded_by, that person becomes the recorder.
update public.store_credit_entries
   set recorded_by = tendered_by,
       recorded_by_name = coalesce(tendered_by_name, recorded_by_name)
 where tendered_by is not null
   and tendered_by <> recorded_by;

alter table public.store_credit_entries
  drop column if exists tendered_by,
  drop column if exists tendered_by_name;

-- get_store_credit_entries returned tendered_by_name; the return type has to
-- change, so the function is dropped and recreated rather than replaced.
drop function if exists public.get_store_credit_entries(text);

create function public.get_store_credit_entries(p_store_id text)
returns table (
  id text,
  entry_type text,
  amount numeric,
  note text,
  recorded_by_name text,
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
    sce.created_at
  from public.store_credit_entries sce
  where sce.store_id = p_store_id
  order by sce.created_at desc;
$$;

-- The INSERT policy's `entry_type = 'payment' or recorded_by = auth.uid()`
-- is left as-is. Payments are self-attributed again after this change, so
-- the loose arm is no longer strictly needed, but tightening it back to
-- recorded_by = auth.uid() would reject any payment still sitting in an
-- agent's outbox that was built under the old split-attribution rule.
