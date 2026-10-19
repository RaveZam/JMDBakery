-- Moves every role check in RLS from user_metadata to app_metadata.
--
-- user_metadata is editable by the signed-in user (auth.updateUser), so a
-- policy that trusts it lets any agent make themselves an admin. app_metadata
-- can only be written with the service role. The role was copied over in
-- 20261019000000_copy_role_to_app_metadata.sql.
--
-- A JWT only picks up app_metadata.role when it is issued, so signed-in users
-- must sign out and back in (or wait for the token to refresh) after this.

-- Admin policies that read the editable claim.
alter policy "admins_full_access" on public.ending_inventory
  using (((auth.jwt() -> 'app_metadata') ->> 'role') = 'admin');

alter policy "admins_full_access" on public.products
  using (((auth.jwt() -> 'app_metadata') ->> 'role') = 'admin')
  with check (((auth.jwt() -> 'app_metadata') ->> 'role') = 'admin');

alter policy "admins_full_access" on public.province_price_modifiers
  using (((auth.jwt() -> 'app_metadata') ->> 'role') = 'admin')
  with check (((auth.jwt() -> 'app_metadata') ->> 'role') = 'admin');

alter policy "admins_full_access" on public.route_sessions
  using (((auth.jwt() -> 'app_metadata') ->> 'role') = 'admin')
  with check (((auth.jwt() -> 'app_metadata') ->> 'role') = 'admin');

alter policy "admins_full_access" on public.sales
  using (((auth.jwt() -> 'app_metadata') ->> 'role') = 'admin')
  with check (((auth.jwt() -> 'app_metadata') ->> 'role') = 'admin');

alter policy "admins_full_access" on public.session_inventory
  using (((auth.jwt() -> 'app_metadata') ->> 'role') = 'admin')
  with check (((auth.jwt() -> 'app_metadata') ->> 'role') = 'admin');

alter policy "admins_full_access" on public.session_stores
  using (((auth.jwt() -> 'app_metadata') ->> 'role') = 'admin')
  with check (((auth.jwt() -> 'app_metadata') ->> 'role') = 'admin');

alter policy "admins_full_access" on public.stores
  using (((auth.jwt() -> 'app_metadata') ->> 'role') = 'admin')
  with check (((auth.jwt() -> 'app_metadata') ->> 'role') = 'admin');

alter policy "Admin full access on store credit entries" on public.store_credit_entries
  using (((auth.jwt() -> 'app_metadata') ->> 'role') = 'admin')
  with check (((auth.jwt() -> 'app_metadata') ->> 'role') = 'admin');

-- Agents reading price modifiers.
alter policy "agents_can_select" on public.province_price_modifiers
  using (((auth.jwt() -> 'app_metadata') ->> 'role') = 'agent');

-- Product writes were "anyone who is not an agent", which an agent could
-- pass by editing their own user_metadata. Only admins may write now.
alter policy "products_insert" on public.products
  with check (((auth.jwt() -> 'app_metadata') ->> 'role') = 'admin');

alter policy "products_update" on public.products
  using (((auth.jwt() -> 'app_metadata') ->> 'role') = 'admin')
  with check (((auth.jwt() -> 'app_metadata') ->> 'role') = 'admin');

alter policy "products_delete" on public.products
  using (((auth.jwt() -> 'app_metadata') ->> 'role') = 'admin');

-- These compared auth.jwt() ->> 'role' (the Postgres role, always
-- 'authenticated') to 'admin', so they never matched. Each of these tables
-- has a working admins_full_access policy above.
drop policy "Admin full access on ending_inventory" on public.ending_inventory;
drop policy "Admin full access on products" on public.products;
drop policy "Admin full access on route_sessions" on public.route_sessions;
drop policy "Admin full access on sales" on public.sales;
drop policy "Admin full access on session_inventory" on public.session_inventory;
drop policy "Admin full access on session_stores" on public.session_stores;
drop policy "Admin full access on stores" on public.stores;
