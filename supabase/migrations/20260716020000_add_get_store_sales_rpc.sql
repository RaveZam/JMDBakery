-- Wraps the store sales lookup (used by useStoreSales when a store row is
-- expanded) in an RPC so it goes through one server-side function like the
-- rest of the sessions data access, instead of a raw .from() select.
create or replace function public.get_store_sales(p_session_store_id text)
returns table (
  id text,
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
    snapshot_product_name,
    snapshot_price,
    quantity_sold,
    quantity_bo,
    bo_reason,
    total
  from public.sales
  where session_store_id = p_session_store_id;
$$;
