-- Three aggregation RPCs backing the Intelligence forecast chart, one per
-- range. Previously the chart pulled raw per-sale rows through
-- getSalesDataset and bucketed them in JS; these push the grouping into
-- Postgres so each range ships tens of rows instead of thousands.
--
-- All three return the same (period, total_sales) shape so the client can
-- share one type. `period` is always the START of the bucket, so it sorts
-- chronologically and doubles as a stable chart key.
--
-- Soft-deleted sessions are excluded here. getSalesDataset does not filter
-- deleted_at, so the forecast numbers may differ slightly from the Records
-- and Dashboard pages until that query is brought in line.

-- Buckets are keyed off Manila local time, matching nowInManila() on the
-- client, so a forecast generated near midnight UTC does not slip a day.
create or replace function public.forecast_manila_today()
returns date
language sql
stable
security invoker
set search_path = ''
as $$
  select (now() at time zone 'Asia/Manila')::date;
$$;

-- Daily totals for the trailing 30 days. Feeds the weekly (7-day) forecast,
-- which averages each weekday across this window to project the week ahead.
create or replace function public.get_daily_sales()
returns table (period date, total_sales double precision)
language sql
stable
security invoker
set search_path = ''
as $$
  select
    rs.session_date as period,
    sum(coalesce(s.total, 0))::double precision as total_sales
  from public.sales s
  join public.session_stores ss on ss.id = s.session_store_id
  join public.route_sessions rs on rs.id = ss.route_session_id
  where rs.deleted_at is null
    and rs.session_date > public.forecast_manila_today() - 30
    and rs.session_date <= public.forecast_manila_today()
  group by rs.session_date
  order by rs.session_date;
$$;

-- Weekly totals across the trailing 6 calendar months, feeding the monthly
-- forecast's trend line.
--
-- Weeks are bucketed by day-of-month (1-7, 8-14, 15-21, 22+), NOT by
-- date_trunc('week'), so the buckets line up exactly with the "Jul W3" labels
-- the chart renders and never straddle a month boundary. The final bucket of
-- a month absorbs days 29-31, so it can be up to 10 days long.
create or replace function public.get_weekly_sales()
returns table (period date, total_sales double precision)
language sql
stable
security invoker
set search_path = ''
as $$
  select
    (
      date_trunc('month', rs.session_date)::date
      + (7 * least(3, (extract(day from rs.session_date)::int - 1) / 7))
    ) as period,
    sum(coalesce(s.total, 0))::double precision as total_sales
  from public.sales s
  join public.session_stores ss on ss.id = s.session_store_id
  join public.route_sessions rs on rs.id = ss.route_session_id
  where rs.deleted_at is null
    and rs.session_date >= (
      date_trunc('month', public.forecast_manila_today()) - interval '5 months'
    )::date
    and rs.session_date <= public.forecast_manila_today()
  group by 1
  order by 1;
$$;

-- Monthly totals across the trailing 24 calendar months, feeding the yearly
-- Holt-Winters forecast. 24 rows (not 12) because the model needs two full
-- 12-month seasons to separate seasonality from trend; the chart still only
-- renders the most recent 12 as actuals.
create or replace function public.get_monthly_sales()
returns table (period date, total_sales double precision)
language sql
stable
security invoker
set search_path = ''
as $$
  select
    date_trunc('month', rs.session_date)::date as period,
    sum(coalesce(s.total, 0))::double precision as total_sales
  from public.sales s
  join public.session_stores ss on ss.id = s.session_store_id
  join public.route_sessions rs on rs.id = ss.route_session_id
  where rs.deleted_at is null
    and rs.session_date >= (
      date_trunc('month', public.forecast_manila_today()) - interval '23 months'
    )::date
    and rs.session_date <= public.forecast_manila_today()
  group by 1
  order by 1;
$$;
