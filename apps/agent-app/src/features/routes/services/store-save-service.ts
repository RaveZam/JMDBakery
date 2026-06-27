import { getDb } from "@/src/lib/db";
import { enqueueOutbox } from "@/src/lib/sync/outbox";
import StoresDao from "@/src/lib/dao/store-dao";

export type StoreFields = {
  name: string;
  province: string;
  city: string;
  barangay: string;
  contactName: string;
  contactPhone: string;
};

export function updateStore(
  id: string,
  provinceId: string,
  fields: StoreFields,
): void {
  const name = fields.name.trim();
  if (!name) {
    throw new Error("Store name is required.");
  }
  getDb().withTransactionSync(() => {
    StoresDao.updateStore(id, { ...fields, name });
    enqueueOutbox({
      entityType: "store",
      entityId: id,
      operation: "update",
      payload: {
        id,
        province_id: provinceId,
        name,
        province: fields.province,
        city: fields.city,
        barangay: fields.barangay,
        contact_number: fields.contactPhone,
        contact_name: fields.contactName,
      },
    });
  });
}

export function deleteStore(id: string): void {
  getDb().withTransactionSync(() => {
    StoresDao.deleteStore(id);
    enqueueOutbox({
      entityType: "store",
      entityId: id,
      operation: "delete",
      payload: { id },
    });
  });
}
