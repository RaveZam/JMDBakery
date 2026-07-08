// Pure guard for the session pull. The server has no single-ongoing constraint,
// so a batch of pulled route_sessions can contain several rows with
// status === 'ongoing'. The local DB enforces one ongoing (partial unique
// index), so importing more than one would violate it. Keep only the newest
// ongoing (by created_at, tie-broken by id) and demote the rest to 'cancelled'.
// Non-ongoing rows pass through untouched. Input is never mutated.

export type PulledSession = {
  id: string;
  status: string;
  created_at?: string | null;
};

export function collapseOngoingSessions<T extends PulledSession>(
  rows: T[],
): T[] {
  const ongoing = rows.filter((r) => r.status === "ongoing");
  if (ongoing.length <= 1) return rows;

  const newest = [...ongoing].sort((a, b) => {
    const ca = a.created_at ?? "";
    const cb = b.created_at ?? "";
    if (ca !== cb) return ca < cb ? 1 : -1; // later created_at first
    return a.id < b.id ? 1 : -1; // deterministic tie-break
  })[0];

  return rows.map((r) =>
    r.status === "ongoing" && r.id !== newest.id
      ? { ...r, status: "cancelled" }
      : r,
  );
}
