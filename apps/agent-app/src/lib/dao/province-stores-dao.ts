import { getDb } from "@/src/lib/db";
import { generateUUID } from "@/src/lib/uuid";

type ProvinceStoreRow = {
  id: string;
  province_id: string;
  store_id: string;
  created_at: string;
};

const ProvinceStoresDao = {
  /** Returns the existing link's id when the store is already on the province. */
  insertLink(provinceId: string, storeId: string, createdAt: string): string {
    const existing = this.getLink(provinceId, storeId);
    if (existing) return existing.id;

    const id = generateUUID();
    getDb().runSync(
      `INSERT INTO province_stores (id, province_id, store_id, created_at)
       VALUES (?, ?, ?, ?)`,
      [id, provinceId, storeId, createdAt],
    );
    return id;
  },

  upsertLink(
    id: string,
    provinceId: string,
    storeId: string,
    createdAt: string,
  ) {
    getDb().runSync(
      `INSERT INTO province_stores (id, province_id, store_id, created_at)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(province_id, store_id) DO NOTHING`,
      [id, provinceId, storeId, createdAt],
    );
  },

  getLink(provinceId: string, storeId: string) {
    return getDb().getFirstSync<ProvinceStoreRow>(
      `SELECT * FROM province_stores WHERE province_id = ? AND store_id = ?`,
      [provinceId, storeId],
    );
  },

  getLinksForProvinces(provinceIds: string[]) {
    if (provinceIds.length === 0) return [];
    const placeholders = provinceIds.map(() => "?").join(", ");
    return getDb().getAllSync<ProvinceStoreRow>(
      `SELECT * FROM province_stores WHERE province_id IN (${placeholders})`,
      provinceIds,
    );
  },

  deleteLink(provinceId: string, storeId: string) {
    getDb().runSync(
      `DELETE FROM province_stores WHERE province_id = ? AND store_id = ?`,
      [provinceId, storeId],
    );
  },

  /** How many provinces still carry this store — 0 means nothing references it. */
  countLinksForStore(storeId: string): number {
    return (
      getDb().getFirstSync<{ count: number }>(
        `SELECT COUNT(*) as count FROM province_stores WHERE store_id = ?`,
        [storeId],
      )?.count ?? 0
    );
  },
};

export default ProvinceStoresDao;
