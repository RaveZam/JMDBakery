import { getDb } from "@/src/lib/db";
import { logTable } from "@/src/lib/log-table";

export const ProductsDao = {
  getAllProducts() {
    return getDb().getAllSync<{ id: string; name: string; price: number }>(
      `SELECT * FROM products`,
    );
  },

  insertProduct(id: string, name: string, price: number) {
    getDb().runSync(`INSERT INTO products (id, name, price) VALUES (?, ?, ?)`, [
      id,
      name,
      price,
    ]);
  },

  upsertProduct(id: string, name: string, price: number) {
    getDb().runSync(
      `INSERT OR REPLACE INTO products (id, name, price) VALUES (?, ?, ?)`,
      [id, name, price],
    );
  },

  logAll() {
    const rows = getDb().getAllSync<{ id: string; name: string; price: number }>(
      `SELECT * FROM products`,
    );
    logTable("products", rows as Record<string, unknown>[]);
  },
};
