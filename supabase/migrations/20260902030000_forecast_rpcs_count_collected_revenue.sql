-- Brings the Intelligence forecast RPCs onto the same money basis as the main
-- Dashboard: revenue is cash orders plus repayments collected on old credit.
--
-- Before this, get_forecast_{daily,weekly,monthly}_sales summed every
-- sales.total in the window, credit orders included, and never looked at
-- store_credit_entries. A credit order is goods handed over without payment --
-- it is not revenue until someone collects it -- so the forecast was fed a
-- number that overstated intake on the day goods went out and ignored the day
-- the cash actually arrived. computeSalesKPI / computeSalesTimeline on the
-- Dashboard, and computeIntelligenceKpis on the client, already count it the
-- way this migration now makes these RPCs count it.
--
-- What changed in each function:
--   * the sales side now filters `payment_type is distinct from 'credit'`
--     (matches excludeCreditSales on the client: null counts as cash).
--   * a second branch adds store_credit_entries rows with entry_type =
--     'payment', bucketed by the Manila day they were collected.
--   * sales.total is unchanged -- it is snapshot_price * quantity_sold, so bad
--     order units never contributed and still do not.
--
-- store_credit_entries.created_at is a Manila wall clock with no time zone
-- (see 20260902020000). `::date` therefore already gives the Manila calendar
-- day; do NOT `at time zone` it or evening collections slide to the next day.
-- This matches getCreditPayments, which reads the same digits via
-- lib/manilaTimestamp. There is no soft delete on store_credit_entries, so
-- nothing to filter there; soft-deleted route_sessions stay excluded on the
-- sales side. Signatures and grants are unchanged -- plain create or replace.

-- Daily totals for the trailing 30 days. Feeds the 7-day forecast.
create or replace function public.get_forecast_daily_sales()
returns table (period date, total_sales double precision)
language sql
stable
security invoker
set search_path = ''
as $$
  with money as (
    select
      rs.session_date as period,
      coalesce(s.total, 0)::double precision as amount
    from public.sales s
    join public.session_stores ss on ss.id = s.session_store_id
    join public.route_sessions rs on rs.id = ss.route_session_id
    where rs.deleted_at is null
      and s.payment_type is distinct from 'credit'
      and rs.session_date > public.forecast_manila_today() - 30
      and rs.session_date <= public.forecast_manila_today()

    union all

    select
      sce.created_at::date as period,
      coalesce(sce.amount, 0)::double precision as amount
    from public.store_credit_entries sce
    where sce.entry_type = 'payment'
      and sce.created_at::date > public.forecast_manila_today() - 30
      and sce.created_at::date <= public.forecast_manila_today()
  )
  select period, sum(amount)::double precision as total_sales
  from money
  group by period
  order by period;
$$;

-- Weekly totals across the trailing 6 calendar months. Buckets are keyed by
-- day-of-month (1-7, 8-14, 15-21, 22+) so they line up with the chart's
-- "Jul W3" labels and never straddle a month boundary.
create or replace function public.get_forecast_weekly_sales()
returns table (period date, total_sales double precision)
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
      coalesce(s.total, 0)::double precision as amount
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
      coalesce(sce.amount, 0)::double precision as amount
    from public.store_credit_entries sce
    where sce.entry_type = 'payment'
      and sce.created_at::date >= (
        date_trunc('month', public.forecast_manila_today()) - interval '5 months'
      )::date
      and sce.created_at::date <= public.forecast_manila_today()
  )
  select period, sum(amount)::double precision as total_sales
  from money
  group by period
  order by period;
$$;

-- Monthly totals across the trailing 24 completed months plus the current
-- partial month (25 buckets); the client drops the partial month before the
-- Holt-Winters fit.
create or replace function public.get_forecast_monthly_sales()
returns table (period date, total_sales double precision)
language sql
stable
security invoker
set search_path = ''
as $$
  with money as (
    select
      date_trunc('month', rs.session_date)::date as period,
      coalesce(s.total, 0)::double precision as amount
    from public.sales s
    join public.session_stores ss on ss.id = s.session_store_id
    join public.route_sessions rs on rs.id = ss.route_session_id
    where rs.deleted_at is null
      and s.payment_type is distinct from 'credit'
      and rs.session_date >= (
        date_trunc('month', public.forecast_manila_today()) - interval '24 months'
      )::date
      and rs.session_date <= public.forecast_manila_today()

    union all

    select
      date_trunc('month', sce.created_at::date)::date as period,
      coalesce(sce.amount, 0)::double precision as amount
    from public.store_credit_entries sce
    where sce.entry_type = 'payment'
      and sce.created_at::date >= (
        date_trunc('month', public.forecast_manila_today()) - interval '24 months'
      )::date
      and sce.created_at::date <= public.forecast_manila_today()
  )
  select period, sum(amount)::double precision as total_sales
  from money
  group by period
  order by period;
$$;
