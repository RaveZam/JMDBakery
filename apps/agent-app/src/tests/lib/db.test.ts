import { createSchema, resetDb } from "@/src/test-utils/db-test-helpers";
import { getDb } from "@/src/lib/db";
import { generateUUID } from "@/src/lib/uuid";

function insertSession(status: string): string {
  const id = generateUUID();
  getDb().runSync(
    `INSERT INTO route_sessions (id, route_name, session_date, conducted_by, status, created_at)
     VALUES (?, 'R', '2026-07-06', 'user-1', ?, '2026-07-06T00:00:00Z')`,
    [id, status],
  );
  return id;
}

beforeAll(async () => {
  await createSchema();
});
beforeEach(() => {
  resetDb();
});

test("allows the 'cancelled' status value", () => {
  const id = insertSession("cancelled");
  const row = getDb().getFirstSync<{ status: string }>(
    "SELECT status FROM route_sessions WHERE id = ?",
    [id],
  );
  expect(row?.status).toBe("cancelled");
});

test("rejects a second ongoing session via the unique index", () => {
  insertSession("ongoing");
  expect(() => insertSession("ongoing")).toThrow();
});

test("allows a new ongoing session once the previous is cancelled", () => {
  const first = insertSession("ongoing");
  getDb().runSync("UPDATE route_sessions SET status = 'cancelled' WHERE id = ?", [
    first,
  ]);
  expect(() => insertSession("ongoing")).not.toThrow();
});
