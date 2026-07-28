-- The agent app now prices a session purely from session_inventory.snapshot_price,
-- with no fallback to the live products row. Rows written before that column
-- existed would price at 0, so seed them from the product's current price.
-- Rows whose product has since been deleted stay null.
update public.session_inventory si
set snapshot_price = p.product_price
from public.products p
where p.id = si.product_id
  and si.snapshot_price is null;
