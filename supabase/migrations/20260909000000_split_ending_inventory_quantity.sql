-- The old single `quantity` was a whole-truck count, taken before bad orders
-- were counted separately, so every unit it holds belongs to the good stock.
alter table public.ending_inventory
  add column ending_bo integer not null default 0,
  add column ending_balance integer not null default 0;

update public.ending_inventory set ending_balance = quantity;

alter table public.ending_inventory drop column quantity;
