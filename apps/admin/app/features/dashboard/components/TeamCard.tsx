import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { statusVariant } from "../helpers/statusVariant";
import type { TeamMember } from "../types/dashboard-types";

function Avatar({ fallback }: { fallback: string }) {
  return (
    <div className="grid h-9 w-9 place-items-center rounded-full bg-emerald-100 text-xs font-semibold text-emerald-800">
      {fallback}
    </div>
  );
}

export function TeamCard({ members }: { members: TeamMember[] }) {
  return (
    <Card className="shadow-soft">
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base">Team Collaboration</CardTitle>
        <button className="rounded-full border px-3 py-1 text-xs text-muted-foreground hover:bg-muted">
          + Add Member
        </button>
      </CardHeader>
      <CardContent className="space-y-3">
        {members.map((m) => (
          <div key={m.name} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Avatar fallback={m.avatarFallback} />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{m.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {m.subtitle}
                </p>
              </div>
            </div>
            <Badge variant={statusVariant(m.status)}>{m.status}</Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
