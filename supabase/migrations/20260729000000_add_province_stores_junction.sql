-- A store used to belong to exactly one province via stores.province_id, so a
-- store registered by one agent could never appear on another agent's route.
-- Agents work overlapping territory and want to pick up a store a colleague
-- already registered ("Echague" on two routes is the same town), which is two
-- parents for one store — something a single FK column cannot express.
--
-- province_stores carries that membership. stores.province_id stays as the
-- province the store was *created* in: it is what attributes the store to its
-- original agent, and it is already nullable with ON DELETE SET NULL
-- (20260722000000), so it was never load-bearing for reads.
--
-- Reads move to the junction. Every existing store is backfilled to a link from
-- its current province_id, so nothing changes for anyone until they explicitly
-- add someone else's store.

create table if not exists public.province_stores (
  id          text primary key,
  province_id text not null references public.agent_provinces(id) on delete cascade,
  store_id    text not null references public.stores(id) on delete cascade,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (province_id, store_id)
);

create index if not exists province_stores_province_id_idx
  on public.province_stores(province_id);
create index if not exists province_stores_store_id_idx
  on public.province_stores(store_id);

drop trigger if exists set_updated_at on public.province_stores;
create trigger set_updated_at
  before update on public.province_stores
  for each row execute function public.set_updated_at();

alter table public.province_stores enable row level security;

-- Membership is a property of the province, so permission follows the province's
-- route owner. Note this is deliberately *not* gated on who owns the store:
-- adopting a colleague's store is the whole point.
create policy "Agents can select links of own routes"
  on public.province_stores for select
  using (
    exists (
      select 1 from public.agent_provinces p
      join public.agent_routes r on r.id = p.route_id
      where p.id = province_stores.province_id and r.owner_id = (select auth.uid())
    )
  );

create policy "Agents can insert links of own routes"
  on public.province_stores for insert
  with check (
    exists (
      select 1 from public.agent_provinces p
      join public.agent_routes r on r.id = p.route_id
      where p.id = province_stores.province_id and r.owner_id = (select auth.uid())
    )
  );

create policy "Agents can delete links of own routes"
  on public.province_stores for delete
  using (
    exists (
      select 1 from public.agent_provinces p
      join public.agent_routes r on r.id = p.route_id
      where p.id = province_stores.province_id and r.owner_id = (select auth.uid())
    )
  );

-- Deliberately no admin policy. The convention on older tables gates admin
-- access on auth.jwt() -> 'user_metadata' ->> 'role', but user_metadata is
-- editable by the end user, so such a policy lets any agent self-escalate.
-- Nothing in the admin app reads this table; add a policy on a non-editable
-- claim if that changes.

-- Every store that currently sits in a province keeps that membership.
insert into public.province_stores (id, province_id, store_id)
select gen_random_uuid()::text, s.province_id, s.id
from public.stores s
where s.province_id is not null
on conflict (province_id, store_id) do nothing;

-- Who registered the store, so another agent's list can label it "From <name>".
-- Denormalizing the name matches route_sessions.conducted_by_name: the agent app
-- is offline-first and cannot join auth.users to render a row.
alter table public.stores
  add column if not exists created_by uuid references auth.users(id) on delete set null;
alter table public.stores
  add column if not exists created_by_name text;

-- Stamped server-side rather than sent by the client: the agent app pushes
-- stores through a generic outbox upsert, and attribution that decides what
-- another agent may delete should not be client-supplied anyway.
create or replace function public.set_store_creator()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if new.created_by is null then
    new.created_by := auth.uid();
  end if;
  if new.created_by_name is null and new.created_by is not null then
    select coalesce(
             u.raw_user_meta_data ->> 'name',
             u.raw_user_meta_data ->> 'full_name',
             u.email
           )
      into new.created_by_name
      from auth.users u
     where u.id = new.created_by;
  end if;
  return new;
end;
$$;

drop trigger if exists set_store_creator on public.stores;
create trigger set_store_creator
  before insert on public.stores
  for each row execute function public.set_store_creator();

-- Existing stores predate the column; their creator is the owner of the route
-- the store was registered under.
update public.stores s
set created_by = r.owner_id
from public.agent_provinces p
join public.agent_routes r on r.id = p.route_id
where p.id = s.province_id and s.created_by is null;

update public.stores s
set created_by_name = coalesce(
  u.raw_user_meta_data ->> 'name',
  u.raw_user_meta_data ->> 'full_name',
  u.email
)
from auth.users u
where u.id = s.created_by and s.created_by_name is null;
