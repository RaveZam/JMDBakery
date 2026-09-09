-- ending_inventory now splits its count into ending_bo and ending_balance
-- instead of one `ending` total. This RPC's return shape changes, which
-- create-or-replace can't do, so the old function is dropped first.
--
-- expected/variance are also dropped from the return: the only caller
-- (sessionsService.mapInventorySummaryRow) already recomputes both itself
-- through computeInventoryVariance and never read the RPC's copies. Keeping
-- both meant two copies of the same formula that could drift.
drop function if exists public.get_session_inventory_summary(text);

create or replace function public.get_session_inventory_summary(p_session_id text)
returns table (
  product_id uuid,
  product_name text,
  morning integer,
  sold integer,
  back_order integer,
  ending_bo integer,
  ending_balance integer
)
language sql
stable
security invoker
set search_path = ''
as $$
  with rows as (
    select product_id, snapshot_product_name as product_name,
      quantity as morning, 0 as sold, 0 as back_order, 0 as ending_bo, 0 as ending_balance
    from public.session_inventory
    where route_session_id = p_session_id

    union all

    select product_id, snapshot_product_name,
      0, 0, 0, ending_bo, ending_balance
    from public.ending_inventory
    where route_session_id = p_session_id

    union all

    select s.product_id, s.snapshot_product_name,
      0, s.quantity_sold, s.quantity_bo, 0, 0
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
    sum(ending_bo)::integer as ending_bo,
    sum(ending_balance)::integer as ending_balance
  from rows
  group by product_id
  order by min(product_name);
$$;
