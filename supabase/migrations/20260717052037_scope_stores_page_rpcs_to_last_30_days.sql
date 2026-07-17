-- Scope get_stores_with_revenue / get_store_top_products to the trailing
-- 30 days (admin Stores page now shows "This Month" figures instead of
-- all-time totals).
create or replace function public.get_stores_with_revenue()
returns table (
  id text,
  store_name text,
  contact_number text,
  contact_name text,
  province text,
  city text,
  barangay text,
  created_at timestamptz,
  total_revenue numeric
)
language sql
stable
security invoker
set search_path = ''
as $$
  select
    st.id,
    st.store_name,
    st.contact_number,
    st.contact_name,
    st.province,
    st.city,
    st.barangay,
    st.created_at,
    coalesce(sum(s.total), 0) as total_revenue
  from public.stores st
  left join public.session_stores ss on ss.store_id = st.id
  left join public.sales s
    on s.session_store_id = ss.id
    and s.created_at >= now() - interval '30 days'
  group by st.id
  order by total_revenue desc;
$$;

create or replace function public.get_store_top_products(p_store_id text)
returns table (
  product_name text,
  revenue numeric
)
language sql
stable
security invoker
set search_path = ''
as $$
  select
    s.snapshot_product_name as product_name,
    sum(s.total) as revenue
  from public.sales s
  join public.session_stores ss on ss.id = s.session_store_id
  where ss.store_id = p_store_id
    and s.created_at >= now() - interval '30 days'
  group by s.snapshot_product_name
  order by revenue desc
  limit 5;
$$;
