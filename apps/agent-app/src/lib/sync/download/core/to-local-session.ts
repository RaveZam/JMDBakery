export type RemoteSessionRow = {
  id: string;
  route_name: string;
  session_date: string;
  conducted_by: string;
  conducted_by_name: string | null;
  status: string;
  created_at: string;
};

/** Reshapes a pulled `route_sessions` row for RouteSessionsDao.upsertSession. */
export function toLocalSession(row: RemoteSessionRow) {
  return {
    id: row.id,
    routeName: row.route_name,
    sessionDate: row.session_date,
    conductedBy: row.conducted_by,
    conductedByName: row.conducted_by_name,
    status: row.status,
    createdAt: row.created_at,
  };
}
