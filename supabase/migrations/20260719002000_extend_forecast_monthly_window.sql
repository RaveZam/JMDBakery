-- Widens get_forecast_monthly_sales from 24 to 25 buckets.
--
-- The yearly Holt-Winters fit needs 24 *completed* months. The previous window
-- returned 24 buckets counting the current, still-in-progress month, leaving
-- only 23 complete ones -- and fitting on a partial final month biases level
-- and trend downward a little more every day of the month.
--
-- The extra bucket is the current partial month, which the client drops before
-- fitting.
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
      date_trunc('month', public.forecast_manila_today()) - interval '24 months'
    )::date
    and rs.session_date <= public.forecast_manila_today()
  group by 1
  order by 1;
$$;
