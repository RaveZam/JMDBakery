ALTER TABLE public.session_stores
  ADD CONSTRAINT session_stores_province_id_fkey
  FOREIGN KEY (province_id) REFERENCES public.agent_provinces(id);
