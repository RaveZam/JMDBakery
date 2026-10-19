// runOutboxSync against a real SQLite outbox, with Supabase and the network
// check faked. The fake Supabase records every call so tests can check what
// would have been sent, and can be told to fail for a given table.
import { createSchema, resetDb, getOutbox } from "@/src/test-utils/db-test-helpers";
import { getDb } from "@/src/lib/db";
import { isWifiConnected } from "@/src/lib/network";
import { supabase } from "@/src/lib/supabase";
import { runOutboxSync } from "@/src/lib/sync/outbox";

jest.mock("@/src/lib/network", () => ({ isWifiConnected: jest.fn() }));

jest.mock("@/src/lib/supabase", () => ({
  supabase: { auth: { getSession: jest.fn() }, from: jest.fn() },
}));

const mockIsWifiConnected = jest.mocked(isWifiConnected);
const mockGetSession = jest.mocked(supabase.auth.getSession);
const mockFrom = jest.mocked(supabase.from);

type SentCall = {
  table: string;
  operation: "upsert" | "update" | "delete";
  payload?: unknown;
  id?: string;
};

let sentCalls: SentCall[];
let failingTables: Set<string>;

/** Answers like Supabase does: `{ error }`, with an error for failing tables. */
function resultFor(table: string) {
  return { error: failingTables.has(table) ? new Error(`${table} rejected`) : null };
}

/** A stand-in for `supabase.from(table)` that records what gets sent. */
function fakeTable(table: string) {
  return {
    upsert: async (payload: unknown) => {
      sentCalls.push({ table, operation: "upsert", payload });
      return resultFor(table);
    },
    update: (payload: unknown) => ({
      eq: async (_column: string, id: string) => {
        sentCalls.push({ table, operation: "update", payload, id });
        return resultFor(table);
      },
    }),
    delete: () => ({
      eq: async (_column: string, id: string) => {
        sentCalls.push({ table, operation: "delete", id });
        return resultFor(table);
      },
    }),
  };
}

function insertOutboxRow(row: {
  id: string;
  entityType: string;
  entityId: string;
  operation: "create" | "update" | "delete";
  payload?: object;
  createdAt?: string;
  syncedAt?: string | null;
}): void {
  getDb().runSync(
    `INSERT INTO outbox (id, entity_type, entity_id, operation, payload, created_at, synced_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      row.id,
      row.entityType,
      row.entityId,
      row.operation,
      JSON.stringify(row.payload ?? {}),
      row.createdAt ?? "2026-06-30T00:00:00.000Z",
      row.syncedAt ?? null,
    ],
  );
}

function syncedAtOf(outboxId: string): string | null {
  return getOutbox().find((row) => row.id === outboxId)?.synced_at ?? null;
}

beforeAll(async () => {
  await createSchema();
});

beforeEach(() => {
  resetDb();
  sentCalls = [];
  failingTables = new Set();
  mockIsWifiConnected.mockResolvedValue(true);
  mockGetSession.mockResolvedValue({
    data: { session: { user: { id: "user-1" } } },
    error: null,
  } as never);
  mockFrom.mockImplementation(((table: string) => fakeTable(table)) as never);
  // runOutboxSync logs every step; keep test output readable.
  jest.spyOn(console, "log").mockImplementation(() => {});
  jest.spyOn(console, "warn").mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe("when it should not try to send", () => {
  test("skips without wifi and leaves rows pending", async () => {
    mockIsWifiConnected.mockResolvedValue(false);
    insertOutboxRow({ id: "ob-1", entityType: "route", entityId: "r-1", operation: "create" });

    const result = await runOutboxSync();

    expect(result).toEqual({ synced: 0, failed: 0 });
    expect(sentCalls).toEqual([]);
    expect(syncedAtOf("ob-1")).toBeNull();
  });

  test("skips when nobody is signed in and leaves rows pending", async () => {
    mockGetSession.mockResolvedValue({ data: { session: null }, error: null } as never);
    insertOutboxRow({ id: "ob-1", entityType: "route", entityId: "r-1", operation: "create" });

    const result = await runOutboxSync();

    expect(result).toEqual({ synced: 0, failed: 0 });
    expect(sentCalls).toEqual([]);
    expect(syncedAtOf("ob-1")).toBeNull();
  });

  test("does nothing when the outbox is empty", async () => {
    expect(await runOutboxSync()).toEqual({ synced: 0, failed: 0 });
    expect(sentCalls).toEqual([]);
  });
});

describe("sending each operation", () => {
  test("a create is upserted into the matching table", async () => {
    insertOutboxRow({
      id: "ob-1",
      entityType: "route",
      entityId: "r-1",
      operation: "create",
      payload: { id: "r-1", name: "North Route" },
    });

    await runOutboxSync();

    expect(sentCalls).toEqual([
      { table: "agent_routes", operation: "upsert", payload: { id: "r-1", name: "North Route" } },
    ]);
  });

  test("an update is sent for that row's id only", async () => {
    insertOutboxRow({
      id: "ob-1",
      entityType: "store",
      entityId: "s-1",
      operation: "update",
      payload: { name: "Renamed Store" },
    });

    await runOutboxSync();

    expect(sentCalls).toEqual([
      { table: "stores", operation: "update", payload: { name: "Renamed Store" }, id: "s-1" },
    ]);
  });

  test("a delete is sent for that row's id only", async () => {
    insertOutboxRow({ id: "ob-1", entityType: "sale", entityId: "sale-1", operation: "delete" });

    await runOutboxSync();

    expect(sentCalls).toEqual([{ table: "sales", operation: "delete", id: "sale-1" }]);
  });
});

describe("marking rows as done", () => {
  test("a sent row gets a synced_at and is counted", async () => {
    insertOutboxRow({ id: "ob-1", entityType: "route", entityId: "r-1", operation: "create" });

    const result = await runOutboxSync();

    expect(result).toEqual({ synced: 1, failed: 0 });
    expect(syncedAtOf("ob-1")).not.toBeNull();
  });

  test("rows already synced are not sent again", async () => {
    insertOutboxRow({
      id: "ob-1",
      entityType: "route",
      entityId: "r-1",
      operation: "create",
      syncedAt: "2026-06-30T01:00:00.000Z",
    });

    const result = await runOutboxSync();

    expect(result).toEqual({ synced: 0, failed: 0 });
    expect(sentCalls).toEqual([]);
  });

  test("running twice does not send the same row twice", async () => {
    insertOutboxRow({ id: "ob-1", entityType: "route", entityId: "r-1", operation: "create" });

    await runOutboxSync();
    const secondRun = await runOutboxSync();

    expect(secondRun).toEqual({ synced: 0, failed: 0 });
    expect(sentCalls).toHaveLength(1);
  });

  test("rows are sent oldest first, so a create lands before its update", async () => {
    // Inserted newest-first on purpose, to prove the order comes from created_at.
    insertOutboxRow({
      id: "ob-update",
      entityType: "route",
      entityId: "r-1",
      operation: "update",
      createdAt: "2026-06-30T00:00:02.000Z",
    });
    insertOutboxRow({
      id: "ob-create",
      entityType: "route",
      entityId: "r-1",
      operation: "create",
      createdAt: "2026-06-30T00:00:01.000Z",
    });

    await runOutboxSync();

    expect(sentCalls.map((call) => call.operation)).toEqual(["upsert", "update"]);
  });
});

describe("when Supabase rejects a row", () => {
  test("the failed row stays pending so the next run retries it", async () => {
    failingTables.add("sales");
    insertOutboxRow({ id: "ob-1", entityType: "sale", entityId: "sale-1", operation: "create" });

    const result = await runOutboxSync();

    expect(result).toEqual({ synced: 0, failed: 1 });
    expect(syncedAtOf("ob-1")).toBeNull();
  });

  test("one failure does not stop the other rows from sending", async () => {
    failingTables.add("sales");
    insertOutboxRow({
      id: "ob-route",
      entityType: "route",
      entityId: "r-1",
      operation: "create",
      createdAt: "2026-06-30T00:00:01.000Z",
    });
    insertOutboxRow({
      id: "ob-sale",
      entityType: "sale",
      entityId: "sale-1",
      operation: "create",
      createdAt: "2026-06-30T00:00:02.000Z",
    });
    insertOutboxRow({
      id: "ob-store",
      entityType: "store",
      entityId: "s-1",
      operation: "create",
      createdAt: "2026-06-30T00:00:03.000Z",
    });

    const result = await runOutboxSync();

    expect(result).toEqual({ synced: 2, failed: 1 });
    expect(syncedAtOf("ob-route")).not.toBeNull();
    expect(syncedAtOf("ob-sale")).toBeNull();
    expect(syncedAtOf("ob-store")).not.toBeNull();
  });

  test("a row that failed before goes through once Supabase accepts it", async () => {
    failingTables.add("sales");
    insertOutboxRow({ id: "ob-1", entityType: "sale", entityId: "sale-1", operation: "create" });
    await runOutboxSync();

    failingTables.clear();
    const retry = await runOutboxSync();

    expect(retry).toEqual({ synced: 1, failed: 0 });
    expect(syncedAtOf("ob-1")).not.toBeNull();
  });
});

// Known bug: outbox.ts says an unknown entity_type is left pending, but
// dispatchRow just returns, so the row is marked synced and never sent.
// test.failing passes while the bug is there. Once it's fixed, Jest will
// say this test unexpectedly passed; change it to a normal `test` then.
test.failing("a row with an unknown entity_type is left pending", async () => {
  insertOutboxRow({ id: "ob-1", entityType: "not_a_real_type", entityId: "x-1", operation: "create" });

  await runOutboxSync();

  expect(syncedAtOf("ob-1")).toBeNull();
});
