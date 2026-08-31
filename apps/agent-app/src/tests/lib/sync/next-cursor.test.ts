import { nextCursor } from "@/src/lib/sync/next-cursor";

describe("nextCursor", () => {
  it("returns null for an empty page so the stored cursor stays put", () => {
    expect(nextCursor([])).toBeNull();
  });

  it("parks 5 seconds behind the newest row in the page", () => {
    const cursor = nextCursor([
      { updated_at: "2026-08-20T10:00:00.000Z" },
      { updated_at: "2026-08-20T10:00:02.000Z" },
      { updated_at: "2026-08-20T10:00:01.000Z" },
    ]);

    expect(cursor).toBe("2026-08-20T09:59:57.000Z");
  });

  it("never returns a cursor at or past the newest row it saw", () => {
    const newest = "2026-08-20T10:00:02.000Z";
    const cursor = nextCursor([{ updated_at: newest }]);

    expect(cursor! < newest).toBe(true);
  });

  it("keeps a row that was stamped early but committed late inside the window", () => {
    // Pull sees a row stamped 10:00:02. A slower transaction stamped 10:00:00
    // is still uncommitted and invisible right now.
    const cursor = nextCursor([{ updated_at: "2026-08-20T10:00:02.000Z" }])!;

    // Once it commits, the next pull's `gte cursor` still covers it.
    expect("2026-08-20T10:00:00.000Z" >= cursor).toBe(true);
  });
});
