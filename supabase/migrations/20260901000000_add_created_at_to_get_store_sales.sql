-- Returns created_at alongside each logged item so the sessions page can show
-- the time a sale was rung up, and orders the rows oldest-first so an expanded
-- store reads in the sequence the agent actually logged it. The previous
-- version had no ORDER BY at all, so row order was whatever Postgres returned.
--
-- The return type changes, which create or replace cannot do, so the old
-- function is dropped first.
drop function if exists public.get_store_sales(text);

create function public.get_store_sales(p_session_store_id text)
returns table (
  id text,
  created_at timestamptz,
  snapshot_product_name text,
  snapshot_price numeric,
  quantity_sold integer,
  quantity_bo integer,
  bo_reason text,
  total numeric
)
language sql
stable
security invoker
set search_path = ''
as $$
  select
    id,
    created_at,
    snapshot_product_name,
    snapshot_price,
    quantity_sold,
    quantity_bo,
    bo_reason,
    total
  from public.sales
  where session_store_id = p_session_store_id
  order by created_at asc;
$$;
