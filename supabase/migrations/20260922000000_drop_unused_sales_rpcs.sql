-- Drops sales/forecast RPC functions with no remaining caller in apps/.
--
-- get_forecast_monthly_sales and get_forecast_daily_sales: the Intelligence
-- forecast chart (getWeeklySales in getForecastSeries.ts) only ever called
-- get_forecast_weekly_sales -- the daily and monthly siblings added alongside
-- it were never wired to a caller. get_forecast_weekly_sales and its shared
-- helper forecast_manila_today() are untouched.
--
-- get_daily_sales, get_daily_sales_all_time, get_agent_sales_summary,
-- get_product_sales_trend, get_store_sales_trend: older aggregation RPCs
-- with no .rpc() call anywhere in the codebase.

drop function if exists public.get_forecast_monthly_sales();
drop function if exists public.get_forecast_daily_sales();
drop function if exists public.get_daily_sales(integer);
drop function if exists public.get_daily_sales_all_time();
drop function if exists public.get_agent_sales_summary(uuid, date, date);
drop function if exists public.get_product_sales_trend(uuid, date, date);
drop function if exists public.get_store_sales_trend(text, date, date);
