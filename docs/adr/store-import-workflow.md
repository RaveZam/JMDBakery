# Store import workflow

Explains how an agent imports a store already registered by another agent, using the province-store conjunction table (see ADR 0004).

## Steps

1. **Import store request**
   An agent selects an existing store (owned by another agent) to add to their own route.

2. **Look up store by `store_id`**
   The system queries the store table for the given `store_id` to confirm the record exists.

3. **Store found?**
   - **No** → treat this as a new store. Skip to *Register as new store* (step 3a) and create a fresh store record with the importing agent's `province_id`.
   - **Yes** → continue to step 4.

   3a. **Register as new store**
   Creates a brand-new store row, owned by the importing agent from the start. No conjunction entry is needed since there's no prior owner to preserve.

4. **Copy store details locally**
   The full store record is copied into the local database so the agent's app has everything it needs without a live dependency on the original agent's data.

5. **Create conjunction table entry**
   Insert a row linking:
   - `province_id` — the importing agent's own province
   - `store_id` — the original store's id

   Critically, the store's own `province_id` field is **not** changed. It still points to the original owning agent — that's how the system tracks true ownership.

6. **Valid province link?**
   Validates that the new conjunction entry doesn't create a conflicting or orphaned province mapping.
   - **No** → go to step 6a, then retry from step 5.
   - **Yes** → continue to step 7.

   6a. **Fix province mapping**
   Correct the province reference (e.g. wrong or missing `province_id`) before re-attempting the conjunction table insert. This loops back to step 5.

7. **Agent route updated**
   The store now shows up in the importing agent's route locally, addressed through the conjunction table rather than a direct foreign key on the store itself.

8. **Store visible in route**
   The importing agent can see and tender the store like any other in their route. The original agent's ownership record is untouched, so no data is duplicated or desynced server-side.

## Why this design

- **Avoids duplicate store rows.** A naive approach (copying the store and reassigning `province_id`) would produce two conflicting rows for the same physical store once synced server-side.
- **Preserves ownership.** The store's `province_id` is the single source of truth for "who owns this store." The conjunction table is purely additive — it grants visibility, not ownership.
- **Keeps the store table decoupled.** Routes → provinces → stores stay linked without forcing a redesign of the core PK relationships.
