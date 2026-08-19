import {
  toLocalSession,
  type RemoteSessionRow,
} from "@/src/lib/sync/download/core/to-local-session";

const remoteSession: RemoteSessionRow = {
  id: "session-1",
  route_name: "Batangas Route",
  session_date: "2026-08-01",
  conducted_by: "agent-1",
  conducted_by_name: "Ramon",
  status: "ongoing",
  created_at: "2026-08-01T06:00:00+00:00",
};

test("renames the server's column names to the local ones", () => {
  const local = toLocalSession(remoteSession);

  expect(local.routeName).toBe("Batangas Route");
  expect(local.sessionDate).toBe("2026-08-01");
  expect(local.conductedBy).toBe("agent-1");
  expect(local.conductedByName).toBe("Ramon");
  expect(local.createdAt).toBe("2026-08-01T06:00:00+00:00");
});

test("keeps the status it was given, so a collapsed row stays cancelled", () => {
  const local = toLocalSession({ ...remoteSession, status: "cancelled" });

  expect(local.status).toBe("cancelled");
});

test("keeps a missing conductor name as null", () => {
  const local = toLocalSession({ ...remoteSession, conducted_by_name: null });

  expect(local.conductedByName).toBeNull();
});
