-- Store detail modal's new Sales Log: a paginated, 30-day feed of every sale
-- line for a store (or the group of store ids a duplicate-merged card folds
-- together), newest first, with the agent who logged it.
--
-- p_store_ids is an array so a card's full memberIds list can be passed, the
-- same reasoning get_store_top_products uses for a single id.
--
-- count(*) over () rides along with the page so the caller gets the total
-- row count in the same round trip instead of a second query.
create function public.get_store_sales_log(
  p_store_ids text[],
  p_limit integer,
  p_offset integer
)
returns table (
  id text,
  created_at timestamptz,
  product_name text,
  unit_price numeric,
  quantity_sold integer,
  quantity_bo integer,
  bo_reason text,
  total numeric,
  agent_name text,
  total_count bigint
)
language sql
stable
security invoker
set search_path = ''
as $$
  select
    s.id,
    s.created_at,
    s.snapshot_product_name,
    s.snapshot_price,
    s.quantity_sold,
    s.quantity_bo,
    s.bo_reason,
    s.total,
    rs.conducted_by_name,
    count(*) over () as total_count
  from public.sales s
  join public.session_stores ss on ss.id = s.session_store_id
  join public.route_sessions rs on rs.id = ss.route_session_id
  where ss.store_id = any(p_store_ids)
    and s.created_at >= now() - interval '30 days'
  order by s.created_at desc, s.id
  limit p_limit offset p_offset;
$$;
