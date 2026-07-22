-- Deleting a route cascades to deleting its provinces (agent_provinces), but
-- stores.province_id_fkey had no ON DELETE action, so the delete was blocked
-- whenever a store still referenced that province. Store rows should survive
-- province/route deletion with province_id cleared instead.
ALTER TABLE public.stores
  ALTER COLUMN province_id DROP NOT NULL;

ALTER TABLE public.stores
  DROP CONSTRAINT stores_province_id_fkey;

ALTER TABLE public.stores
  ADD CONSTRAINT stores_province_id_fkey
  FOREIGN KEY (province_id) REFERENCES public.agent_provinces(id)
  ON DELETE SET NULL;
