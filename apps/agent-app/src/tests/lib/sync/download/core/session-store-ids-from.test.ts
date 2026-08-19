import { sessionStoreIdsFrom } from "@/src/lib/sync/download/core/session-store-ids-from";
import type { RemoteStoreCreditRow } from "@/src/lib/sync/download/core/to-local-credit-entry";

function entry(overrides: Partial<RemoteStoreCreditRow>): RemoteStoreCreditRow {
  return {
    id: "entry-1",
    store_id: "store-1",
    session_store_id: "session-store-1",
    entry_type: "credit",
    amount: 100,
    note: null,
    recorded_by: "agent-1",
    recorded_by_name: null,
    created_at: "2026-08-01T08:00:00+00:00",
    deleted_at: null,
    updated_at: "2026-08-01T08:00:00+00:00",
    ...overrides,
  };
}

test("returns nothing for an empty batch", () => {
  expect(sessionStoreIdsFrom([])).toEqual([]);
});

test("collects the session store id of each live entry", () => {
  const rows = [
    entry({ id: "a", session_store_id: "session-store-1" }),
    entry({ id: "b", session_store_id: "session-store-2" }),
  ];

  expect(sessionStoreIdsFrom(rows)).toEqual([
    "session-store-1",
    "session-store-2",
  ]);
});

test("skips deleted entries, whose sales are about to be dropped locally", () => {
  const rows = [
    entry({ id: "a", session_store_id: "session-store-1" }),
    entry({
      id: "b",
      session_store_id: "session-store-2",
      deleted_at: "2026-08-02T00:00:00+00:00",
    }),
  ];

  expect(sessionStoreIdsFrom(rows)).toEqual(["session-store-1"]);
});

test("skips entries recorded outside a session", () => {
  const rows = [
    entry({ id: "a", session_store_id: null }),
    entry({ id: "b", session_store_id: "session-store-2" }),
  ];

  expect(sessionStoreIdsFrom(rows)).toEqual(["session-store-2"]);
});
