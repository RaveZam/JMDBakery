-- Admin Stores page top-products panel now also shows pieces sold per
-- product, not just revenue. Return type changed, so the old function must
-- be dropped first (create or replace can't change OUT parameter types).
drop function if exists public.get_store_top_products(text);

create function public.get_store_top_products(p_store_id text)
returns table (
  product_name text,
  revenue numeric,
  quantity_sold bigint
)
language sql
stable
security invoker
set search_path = ''
as $$
  select
    s.snapshot_product_name as product_name,
    sum(s.total) as revenue,
    sum(s.quantity_sold) as quantity_sold
  from public.sales s
  join public.session_stores ss on ss.id = s.session_store_id
  where ss.store_id = p_store_id
    and s.created_at >= now() - interval '30 days'
  group by s.snapshot_product_name
  order by revenue desc
  limit 5;
$$;
