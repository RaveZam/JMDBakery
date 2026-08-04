-- Agents can already read any store_credit_entries row (RLS there is
-- `qual: true`, so cross-agent debt on a shared store is visible). But
-- sales stayed scoped to `conducted_by = auth.uid()`, so an agent opening a
-- credit entry taken on another agent's visit got zero sale lines back —
-- not an error, RLS just silently filtered them out. This adds a second
-- SELECT policy (OR'd with the existing one) letting a sales row through
-- when a store_credit_entries row points at its session_store_id.
create policy "Agents can select sales behind a credit entry"
on sales
for select
using (
  exists (
    select 1
    from store_credit_entries sce
    where sce.session_store_id = sales.session_store_id
  )
);
