-- Simplifies get_session_inventory_summary: replaces the three separate
-- per-table CTEs + full joins with one union-all of tagged rows and a
-- single group by. Same output shape as before.
--
-- Note: product name precedence is no longer strictly morning > ending >
-- sales -- min() now picks alphabetically across all rows for a product.
-- In practice the snapshot name is the same across tables for a given
-- product, so this only matters if a product was renamed mid-session.
create or replace function public.get_session_inventory_summary(p_session_id text)
returns table (
  product_id uuid,
  product_name text,
  morning integer,
  sold integer,
  back_order integer,
  expected integer,
  ending integer,
  variance integer
)
language sql
stable
security invoker
set search_path = ''
as $$
  with rows as (
    select product_id, snapshot_product_name as product_name,
      quantity as morning, 0 as sold, 0 as back_order, 0 as ending
    from public.session_inventory
    where route_session_id = p_session_id

    union all

    select product_id, snapshot_product_name,
      0, 0, 0, quantity
    from public.ending_inventory
    where route_session_id = p_session_id

    union all

    select s.product_id, s.snapshot_product_name,
      0, s.quantity_sold, s.quantity_bo, 0
    from public.sales s
    join public.session_stores ss on ss.id = s.session_store_id
    where ss.route_session_id = p_session_id
  )
  select
    product_id,
    min(product_name) as product_name,
    sum(morning)::integer as morning,
    sum(sold)::integer as sold,
    sum(back_order)::integer as back_order,
    (sum(morning) - sum(sold) - sum(back_order))::integer as expected,
    sum(ending)::integer as ending,
    (sum(ending) - (sum(morning) - sum(sold) - sum(back_order)))::integer as variance
  from rows
  group by product_id
  order by min(product_name);
$$;
