-- Two unrelated fixes to the same soft-delete story.
--
-- 1. session_inventory / ending_inventory both carry snapshot_product_name and
--    are read through it (get_session_inventory_summary groups on the snapshot,
--    never joining products). Their product_id FKs were NO ACTION, so they —
--    not sales — were what actually blocked deleting a product: any product an
--    agent had ever loaded into a morning inventory raised a raw FK error in
--    the admin UI. Match sales: nullable, ON DELETE SET NULL.
--
-- 2. stores.updated_at has existed since the table was created but never had a
--    trigger, so it only ever held the insert time. Anything that trusts it as
--    a modification timestamp (an incremental pull, for one) silently misses
--    every edit.

alter table public.session_inventory
  alter column product_id drop not null;
alter table public.session_inventory
  drop constraint session_inventory_product_id_fkey;
alter table public.session_inventory
  add constraint session_inventory_product_id_fkey
  foreign key (product_id) references public.products(id) on delete set null;

alter table public.ending_inventory
  alter column product_id drop not null;
alter table public.ending_inventory
  drop constraint ending_inventory_product_id_fkey;
alter table public.ending_inventory
  add constraint ending_inventory_product_id_fkey
  foreign key (product_id) references public.products(id) on delete set null;

drop trigger if exists set_updated_at on public.stores;
create trigger set_updated_at
  before update on public.stores
  for each row execute function public.set_updated_at();
