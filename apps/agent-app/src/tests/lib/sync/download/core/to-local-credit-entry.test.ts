import {
  toLocalCreditEntry,
  type RemoteStoreCreditRow,
} from "@/src/lib/sync/download/core/to-local-credit-entry";

const remoteEntry: RemoteStoreCreditRow = {
  id: "entry-1",
  store_id: "store-1",
  session_store_id: "session-store-1",
  entry_type: "credit",
  amount: 250,
  note: "paid half",
  recorded_by: "agent-1",
  recorded_by_name: "Ramon",
  created_at: "2026-08-01T08:00:00+00:00",
  deleted_at: null,
  updated_at: "2026-08-02T09:00:00+00:00",
};

test("keeps the entry's own fields", () => {
  const local = toLocalCreditEntry(remoteEntry);

  expect(local.id).toBe("entry-1");
  expect(local.entry_type).toBe("credit");
  expect(local.amount).toBe(250);
  expect(local.created_at).toBe("2026-08-01T08:00:00+00:00");
});

test("drops the sync-only columns, which have no local counterpart", () => {
  const local = toLocalCreditEntry(remoteEntry);

  expect(local).not.toHaveProperty("deleted_at");
  expect(local).not.toHaveProperty("updated_at");
});
