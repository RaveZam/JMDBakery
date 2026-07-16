-- Merges morning inventory, ending inventory, and sales into one per-product
-- summary for a session. Previously done client-side in
-- getSessionInventory() with 3 round trips + a JS merge; moved here so it's
-- one query and the aggregation happens where the data lives.
--
-- Name precedence when a product's snapshot name differs across tables
-- (e.g. renamed mid-session) follows the old JS merge order: morning >
-- ending > sales.
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
  with morning_agg as (
    select
      product_id,
      min(snapshot_product_name) as product_name,
      sum(quantity) as qty
    from public.session_inventory
    where route_session_id = p_session_id
    group by product_id
  ),
  ending_agg as (
    select
      product_id,
      min(snapshot_product_name) as product_name,
      sum(quantity) as qty
    from public.ending_inventory
    where route_session_id = p_session_id
    group by product_id
  ),
  sales_agg as (
    select
      s.product_id,
      min(s.snapshot_product_name) as product_name,
      sum(s.quantity_sold) as sold,
      sum(s.quantity_bo) as bo
    from public.sales s
    join public.session_stores ss on ss.id = s.session_store_id
    where ss.route_session_id = p_session_id
    group by s.product_id
  ),
  products as (
    select product_id from morning_agg
    union
    select product_id from ending_agg
    union
    select product_id from sales_agg
  )
  select
    p.product_id,
    coalesce(m.product_name, e.product_name, sa.product_name) as product_name,
    coalesce(m.qty, 0)::integer as morning,
    coalesce(sa.sold, 0)::integer as sold,
    coalesce(sa.bo, 0)::integer as back_order,
    (coalesce(m.qty, 0) - coalesce(sa.sold, 0) - coalesce(sa.bo, 0))::integer as expected,
    coalesce(e.qty, 0)::integer as ending,
    (coalesce(e.qty, 0) - (coalesce(m.qty, 0) - coalesce(sa.sold, 0) - coalesce(sa.bo, 0)))::integer as variance
  from products p
  left join morning_agg m using (product_id)
  left join ending_agg e using (product_id)
  left join sales_agg sa using (product_id)
  order by product_name;
$$;
