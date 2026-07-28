import { latestUpdatedAt } from "@/src/lib/sync/latest-updated-at";

test("returns null for an empty batch so the cursor stays put", () => {
  expect(latestUpdatedAt([])).toBeNull();
});

test("returns the only row's timestamp", () => {
  expect(latestUpdatedAt([{ updated_at: "2026-07-27T10:00:00+00:00" }])).toBe(
    "2026-07-27T10:00:00+00:00",
  );
});

test("returns the newest timestamp regardless of row order", () => {
  const rows = [
    { updated_at: "2026-07-27T10:00:00+00:00" },
    { updated_at: "2026-07-27T12:30:00+00:00" },
    { updated_at: "2026-07-26T23:59:59+00:00" },
  ];

  expect(latestUpdatedAt(rows)).toBe("2026-07-27T12:30:00+00:00");
});
