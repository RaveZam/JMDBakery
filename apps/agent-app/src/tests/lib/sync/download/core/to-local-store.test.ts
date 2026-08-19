import {
  toLocalStore,
  type RemoteStoreRow,
} from "@/src/lib/sync/download/core/to-local-store";

const remoteStore: RemoteStoreRow = {
  id: "store-1",
  store_name: "Aling Nena Sari-Sari",
  province_id: "province-1",
  province: "Batangas",
  city: "Lipa",
  barangay: "Sabang",
  contact_number: "09171234567",
  contact_name: "Nena",
  created_by: "agent-1",
  created_by_name: "Ramon",
};

test("renames the server's column names to the local ones", () => {
  const local = toLocalStore(remoteStore);

  expect(local.name).toBe("Aling Nena Sari-Sari");
  expect(local.provinceId).toBe("province-1");
  expect(local.contactPhone).toBe("09171234567");
  expect(local.contactName).toBe("Nena");
});

test("turns missing address and contact fields into empty strings", () => {
  const local = toLocalStore({
    ...remoteStore,
    province: null,
    city: null,
    barangay: null,
    contact_number: null,
    contact_name: null,
  });

  expect(local.province).toBe("");
  expect(local.city).toBe("");
  expect(local.barangay).toBe("");
  expect(local.contactPhone).toBe("");
  expect(local.contactName).toBe("");
});

test("keeps a missing creator as null rather than an empty string", () => {
  const local = toLocalStore({
    ...remoteStore,
    created_by: null,
    created_by_name: null,
  });

  expect(local.createdBy).toBeNull();
  expect(local.createdByName).toBeNull();
});
