export type ProvinceRow = { id: string; name: string; route_id: string };

export type StoreRow = {
  id: string;
  name: string;
  // The province the store was registered in, which is not necessarily one of
  // this agent's — reads go through province_stores. Null once the registering
  // agent's province is gone.
  province_id: string | null;
  province: string;
  city: string;
  barangay: string;
  contact_number: string;
  contact_name: string;
  created_by: string | null;
  created_by_name: string | null;
};

/**
 * A store as the screens use it. `isOwn` is not in the database — only the app
 * knows which agent is holding the phone — so `store-services` decides it once
 * on the way out of the data layer.
 */
export type Store = StoreRow & { isOwn: boolean };
