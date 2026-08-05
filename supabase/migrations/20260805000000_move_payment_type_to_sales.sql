-- Payment type moves down from the visit to the order.
--
-- session_stores.payment_type assumed a stop settles one way, but a store can
-- take some goods on credit and pay cash for the rest. Holding the choice per
-- visit meant the last toggle won: logging a cash order after credit ones
-- rewrote the whole visit, and the debt for the earlier orders disappeared.
--
-- The debt for a visit is now the sum of its sales where payment_type =
-- 'credit', so a mixed stop owes only its credit half. store_credit_entries is
-- unchanged: still one row per visit, keyed by session_store_id.
--
-- Add, backfill and drop are one migration on purpose. Between the add and the
-- drop there are two columns answering "how was this settled", and a reader who
-- picks the old one gets the wrong number on any mixed visit. Leaving that
-- window open across two deploys is the failure this avoids.

-- Default 'cash' so every sale recorded before this column keeps its current
-- meaning.
alter table public.sales
  add column if not exists payment_type text not null default 'cash'
    check (payment_type in ('cash', 'credit'));

comment on column public.sales.payment_type is
  'How this order was settled: cash (paid on the spot) or credit (owed by the store). One visit can mix both; the debt is the sum of its credit rows, recorded in store_credit_entries.';

-- Carry the old answer over before dropping it. The default above marked every
-- existing sale 'cash', so a visit settled on credit back when the visit held
-- the flag now has no credit sale lines under it. Its debt survives as a
-- store_credit_entries row, but the moment an agent edits one of those orders
-- the debt is re-derived from the sales — and would come out as zero, silently
-- wiping what the store owes. Marking those lines credit makes the derivation
-- agree with the entry that's already on the books.
update public.sales s
set payment_type = 'credit'
from public.session_stores ss
where s.session_store_id = ss.id
  and ss.payment_type = 'credit';

-- Deploy order matters: an agent still running the previous build enqueues
-- session_store updates carrying payment_type, and after this drop those pushes
-- fail and the outbox retries them forever. Ship the app build that stops
-- writing the column before applying this migration.
alter table public.session_stores
  drop column if exists payment_type;
