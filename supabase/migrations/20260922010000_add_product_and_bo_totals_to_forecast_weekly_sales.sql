-- Adds product and bad order totals to get_forecast_weekly_sales, alongside
-- the existing revenue column, so the Intelligence forecast chart can show
-- unit volume and bad order impact per week, not just revenue.
--
-- total_sales is repurposed to count units sold (sales.quantity_sold);
-- total_sales_amount now carries what total_sales used to mean (revenue).
-- total_bo sums sales.quantity_bo; total_bo_amount values those units at
-- snapshot_price (the price the bad order goods would have sold for -- bad
-- orders never generate revenue, so this is not part of total_sales_amount).
--
-- The store_credit_entries branch is payments collected on old credit, not
-- product movement, so it contributes 0 to total_sales, total_bo, and
-- total_bo_amount.
--
-- The return type changes, which create or replace cannot do, so the old
-- function is dropped first.
drop function if exists public.get_forecast_weekly_sales();

create function public.get_forecast_weekly_sales()
returns table (
  period date,
  total_sales integer,
  total_sales_amount double precision,
  total_bo integer,
  total_bo_amount double precision
)
language sql
stable
security invoker
set search_path = ''
as $$
  with money as (
    select
      (
        date_trunc('month', rs.session_date)::date
        + (7 * least(3, (extract(day from rs.session_date)::int - 1) / 7))
      ) as period,
      coalesce(s.quantity_sold, 0) as units_sold,
      coalesce(s.total, 0)::double precision as sales_amount,
      coalesce(s.quantity_bo, 0) as bo_units,
      (coalesce(s.snapshot_price, 0) * coalesce(s.quantity_bo, 0))::double precision as bo_amount
    from public.sales s
    join public.session_stores ss on ss.id = s.session_store_id
    join public.route_sessions rs on rs.id = ss.route_session_id
    where rs.deleted_at is null
      and s.payment_type is distinct from 'credit'
      and rs.session_date >= (
        date_trunc('month', public.forecast_manila_today()) - interval '5 months'
      )::date
      and rs.session_date <= public.forecast_manila_today()

    union all

    select
      (
        date_trunc('month', sce.created_at::date)::date
        + (7 * least(3, (extract(day from sce.created_at::date)::int - 1) / 7))
      ) as period,
      0 as units_sold,
      coalesce(sce.amount, 0)::double precision as sales_amount,
      0 as bo_units,
      0::double precision as bo_amount
    from public.store_credit_entries sce
    where sce.entry_type = 'payment'
      and sce.created_at::date >= (
        date_trunc('month', public.forecast_manila_today()) - interval '5 months'
      )::date
      and sce.created_at::date <= public.forecast_manila_today()
  )
  select
    period,
    sum(units_sold)::integer as total_sales,
    sum(sales_amount)::double precision as total_sales_amount,
    sum(bo_units)::integer as total_bo,
    sum(bo_amount)::double precision as total_bo_amount
  from money
  group by period
  order by period;
$$;
