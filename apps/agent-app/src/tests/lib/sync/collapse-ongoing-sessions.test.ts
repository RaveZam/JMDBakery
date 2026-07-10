import { collapseOngoingSessions } from "@/src/lib/sync/collapse-ongoing-sessions";

type Row = { id: string; status: string; created_at?: string | null };

test("leaves the batch untouched when there is at most one ongoing", () => {
  const rows: Row[] = [
    { id: "a", status: "ongoing", created_at: "2026-01-01" },
    { id: "b", status: "completed", created_at: "2026-01-02" },
    { id: "c", status: "cancelled", created_at: "2026-01-03" },
  ];
  expect(collapseOngoingSessions(rows)).toEqual(rows);
});

test("keeps only the newest ongoing and demotes the rest to cancelled", () => {
  const rows: Row[] = [
    { id: "old", status: "ongoing", created_at: "2026-01-01T00:00:00Z" },
    { id: "new", status: "ongoing", created_at: "2026-03-01T00:00:00Z" },
    { id: "mid", status: "ongoing", created_at: "2026-02-01T00:00:00Z" },
    { id: "done", status: "completed", created_at: "2026-02-15T00:00:00Z" },
  ];

  const result = collapseOngoingSessions(rows);

  expect(result.find((r) => r.id === "new")?.status).toBe("ongoing");
  expect(result.find((r) => r.id === "old")?.status).toBe("cancelled");
  expect(result.find((r) => r.id === "mid")?.status).toBe("cancelled");
  // non-ongoing rows pass through untouched
  expect(result.find((r) => r.id === "done")?.status).toBe("completed");
  // exactly one ongoing remains
  expect(result.filter((r) => r.status === "ongoing")).toHaveLength(1);
});

test("breaks created_at ties deterministically by id", () => {
  const rows: Row[] = [
    { id: "a", status: "ongoing", created_at: "2026-01-01" },
    { id: "b", status: "ongoing", created_at: "2026-01-01" },
  ];
  const result = collapseOngoingSessions(rows);
  expect(result.filter((r) => r.status === "ongoing")).toHaveLength(1);
  // stable choice regardless of input order
  expect(collapseOngoingSessions([...rows].reverse())).toEqual(
    [...result].reverse(),
  );
});

test("does not mutate the input rows", () => {
  const rows: Row[] = [
    { id: "a", status: "ongoing", created_at: "2026-01-01" },
    { id: "b", status: "ongoing", created_at: "2026-02-01" },
  ];
  const snapshot = JSON.parse(JSON.stringify(rows));
  collapseOngoingSessions(rows);
  expect(rows).toEqual(snapshot);
});
