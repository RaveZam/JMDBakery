-- Incremental sync support for products and province_price_modifiers.
--
-- The agent app pulls these two tables on every launch/foreground and needs to
-- fetch only what changed. That requires (a) an updated_at the client can filter
-- on, kept current by a trigger, and (b) soft deletes, because a hard-deleted
-- row is invisible to a "newer than X" query and would linger forever in the
-- phone's local SQLite.

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  -- clock_timestamp(), not now(): now() is frozen at transaction start, so a
  -- row inserted and then updated in one transaction would keep an identical
  -- updated_at and the change would be invisible to a cursor-based pull.
  new.updated_at = clock_timestamp();
  return new;
end;
$$;

alter table public.products
  add column if not exists updated_at timestamptz not null default now(),
  add column if not exists deleted_at timestamptz;

alter table public.province_price_modifiers
  add column if not exists updated_at timestamptz not null default now(),
  add column if not exists deleted_at timestamptz;

drop trigger if exists set_updated_at on public.products;
create trigger set_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at on public.province_price_modifiers;
create trigger set_updated_at
  before update on public.province_price_modifiers
  for each row execute function public.set_updated_at();

-- Every incremental pull filters on updated_at.
create index if not exists products_updated_at_idx
  on public.products (updated_at);
create index if not exists province_price_modifiers_updated_at_idx
  on public.province_price_modifiers (updated_at);

-- The keyword uniqueness rule now has to ignore soft-deleted rows, otherwise
-- deleting a modifier and re-adding the same keyword raises 23505.
drop index if exists public.province_price_modifiers_product_keyword_ci_key;
create unique index province_price_modifiers_product_keyword_ci_key
  on public.province_price_modifiers (product_id, lower(province_keyword))
  where deleted_at is null;
