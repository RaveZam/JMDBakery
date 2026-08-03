-- A visit is currently always implicitly paid in cash. Agents need to record
-- that a store took goods on credit instead, settled later. This column is
-- the record of that choice per visit; the actual debt is logged as a row in
-- store_credit_entries (see the next migration), keyed off this table's id
-- via session_store_id.
--
-- Default 'cash' so every visit recorded before this column existed keeps its
-- current meaning without a backfill.

alter table public.session_stores
  add column if not exists payment_type text not null default 'cash'
    check (payment_type in ('cash', 'credit'));

comment on column public.session_stores.payment_type is
  'How this visit was settled: cash (paid on the spot) or credit (owed by the store, see store_credit_entries).';
