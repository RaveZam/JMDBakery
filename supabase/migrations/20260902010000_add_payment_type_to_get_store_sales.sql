-- Returns payment_type with each logged item so the admin sessions page can
-- mark an order as cash or credit, the way the mobile history screen does.
-- One visit can mix both, so the flag has to come per sale row.
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
  payment_type text,
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
    payment_type,
    total
  from public.sales
  where session_store_id = p_session_store_id
  order by created_at asc;
$$;
