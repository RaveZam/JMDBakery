-- recorded_by is who typed the entry into the app. That is usually also the
-- person who physically accepted the cash, but not always: one agent can
-- collect at the store and another agent (or an admin) encode it afterwards.
-- Those are two different facts, so tendered_by records the second one.
--
-- This is not a repeat of stores.tendered_by, which 20260730071121 dropped.
-- That column was the same fact as created_by under a second name. Here the
-- two columns can legitimately hold different people.
--
-- Nullable, and null means "same person as recorded_by" — the common case, so
-- the app only writes tendered_by when the collector differs. Readers should
-- resolve it as coalesce(tendered_by, recorded_by).
--
-- tendered_by_name is denormalized the same way recorded_by_name,
-- created_by_name and conducted_by_name are: agents cannot read auth.users, so
-- the display name has to travel with the row.
--
-- RLS is untouched. Every policy on this table keys off recorded_by, and it
-- must stay that way — tendered_by is descriptive only and grants nothing.

alter table public.store_credit_entries
  add column if not exists tendered_by uuid
    references auth.users (id) on delete set null,
  add column if not exists tendered_by_name text;

comment on column public.store_credit_entries.tendered_by is
  'Who physically accepted the payment, when that differs from recorded_by. Null means recorded_by accepted it.';

comment on column public.store_credit_entries.tendered_by_name is
  'Display name for tendered_by, denormalized because agents cannot read auth.users.';
