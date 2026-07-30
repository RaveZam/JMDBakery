import { supabase } from "@/src/lib/supabase";
import { isWifiConnected } from "@/src/lib/network";
import StoresDao from "@/src/lib/dao/store-dao";

export type ExistingStore = {
  id: string;
  name: string;
  /** The province that registered it — kept so adopting never rewrites it. */
  provinceId: string | null;
  province: string;
  city: string;
  barangay: string;
  contactName: string;
  contactPhone: string;
  createdBy: string | null;
  createdByName: string | null;
};

//Searches stores from supabase must have wifi.
export async function searchStoresByProvince(
  keyword: string,
  provinceId: string,
): Promise<ExistingStore[]> {
  const term = keyword.trim();
  if (!term) return [];

  if (!(await isWifiConnected())) {
    throw new Error(
      "Searching for existing stores needs an internet connection.",
    );
  }

  const { data, error } = await supabase
    .from("stores")
    .select(
      "id, store_name, province_id, province, city, barangay, contact_number, contact_name, created_by, created_by_name",
    )
    .ilike("province", `%${term}%`)
    .order("store_name")
    .limit(100);

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to search for stores.");
  }

  //Filter out stores that are already on this province
  const alreadyHere = new Set(
    StoresDao.getStoresForProvince(provinceId).map((store) => store.id),
  );

  //Filter out stores that are already on this province
  return data.filter((row) => !alreadyHere.has(row.id)).map(toExistingStore);
}

type RemoteStoreRow = {
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

function toExistingStore(row: RemoteStoreRow): ExistingStore {
  return {
    id: row.id,
    name: row.store_name,
    provinceId: row.province_id,
    province: row.province ?? "",
    city: row.city ?? "",
    barangay: row.barangay ?? "",
    contactName: row.contact_name ?? "",
    contactPhone: row.contact_number ?? "",
    createdBy: row.created_by,
    createdByName: row.created_by_name,
  };
}
