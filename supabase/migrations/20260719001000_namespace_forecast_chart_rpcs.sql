-- Corrects the names introduced in 20260719000000_add_forecast_chart_rpcs.
--
-- A get_daily_sales(p_year integer) already existed, so the no-arg
-- get_daily_sales() added there did not replace it -- it created an overload,
-- and any call to get_daily_sales() became ambiguous ("function is not
-- unique"). Namespacing the forecast RPCs removes the collision and makes it
-- obvious which chart they belong to.
--
-- The pre-existing get_daily_sales(p_year integer) is deliberately left alone.

drop function if exists public.get_daily_sales();
drop function if exists public.get_weekly_sales();
drop function if exists public.get_monthly_sales();

create or replace function public.get_forecast_daily_sales()
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

create or replace function public.get_forecast_weekly_sales()
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

create or replace function public.get_forecast_monthly_sales()
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
