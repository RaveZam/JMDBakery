export type RemoteStoreRow = {
  id: string;
  store_name: string;
  province_id: string | null;
  province: string | null;
  city: string | null;
  barangay: string | null;
  contact_number: string | null;
  contact_name: string | null;
  created_by: string | null;
  created_by_name: string | null;
};

/**
 * Reshapes a pulled `stores` row into what StoresDao.upsertStore expects.
 * The address and contact columns are nullable on the server but stored as
 * empty strings locally, so the screens never have to null-check them.
 */
export function toLocalStore(row: RemoteStoreRow) {
  return {
    id: row.id,
    provinceId: row.province_id,
    name: row.store_name,
    province: row.province ?? "",
    city: row.city ?? "",
    barangay: row.barangay ?? "",
    contactName: row.contact_name ?? "",
    contactPhone: row.contact_number ?? "",
    createdBy: row.created_by,
    createdByName: row.created_by_name,
  };
}
