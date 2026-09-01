import { createSchema, resetDb } from "@/src/test-utils/db-test-helpers";
import { getDb } from "@/src/lib/db";
import { countPendingOutbox } from "@/src/lib/sync/pending-outbox-count";

function insertOutboxRow(id: string, syncedAt: string | null): void {
  getDb().runSync(
    `INSERT INTO outbox (id, entity_type, entity_id, operation, payload, created_at, synced_at)
     VALUES (?, 'sale', ?, 'create', '{}', '2026-06-30T00:00:00.000Z', ?)`,
    [id, `entity-${id}`, syncedAt],
  );
}

beforeAll(async () => { await createSchema(); });
beforeEach(() => { resetDb(); });

test("returns 0 when the outbox is empty", () => {
  expect(countPendingOutbox()).toBe(0);
});

test("counts only rows that have not been pushed", () => {
  insertOutboxRow("a", null);
  insertOutboxRow("b", null);
  insertOutboxRow("c", "2026-06-30T01:00:00.000Z");

  expect(countPendingOutbox()).toBe(2);
});
