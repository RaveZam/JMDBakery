import type { SalesRecord } from "@/app/server/getBaseData";
import { Card } from "@/components/ui/card";
import { RecordRow } from "./RecordRow";
import { RecordsTableHeader } from "./RecordsTableHeader";
import { RecordsEmptyState } from "./RecordsEmptyState";

export function RecordsTable({ records }: { records: SalesRecord[] }) {
  if (records.length === 0) return <RecordsEmptyState />;

  return (
    <Card className="overflow-hidden border-border/70 p-0 shadow-soft dark:shadow-soft-dark">
      <div
        aria-hidden
        className="h-3 w-full bg-border/70"
        style={{
          backgroundImage:
            "radial-gradient(circle at 8px 6px, hsl(var(--background)) 3.5px, transparent 4px)",
          backgroundSize: "16px 12px",
          backgroundPosition: "top left",
        }}
      />
      <div className="max-h-[70vh] overflow-auto">
        <table className="w-full border-collapse text-sm">
          <RecordsTableHeader />
          <tbody className="font-mono tabular-nums">
            {records.map((record) => (
              <RecordRow key={record.id} record={record} />
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
