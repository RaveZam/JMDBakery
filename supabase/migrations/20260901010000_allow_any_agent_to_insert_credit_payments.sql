-- A repayment can be collected by one agent and still belong to the agent who
-- first logged the store's credit. recordStorePayment copies recorded_by from
-- the oldest credit entry (see pick-credit-encoder), so the collector pushes a
-- row whose recorded_by is someone else. The old INSERT check,
-- `recorded_by = auth.uid()`, rejected that and the outbox retried it forever.
--
-- Payments are now allowed for any signed-in agent regardless of recorded_by.
-- Credit rows still have to be self-attributed. Who actually collected the cash
-- is in tendered_by.

drop policy "Agents can insert their own store credit entries"
  on public.store_credit_entries;

create policy "Agents can insert credit entries"
on public.store_credit_entries
for insert
to authenticated
with check (
  entry_type = 'payment'
  or recorded_by = auth.uid()
);
