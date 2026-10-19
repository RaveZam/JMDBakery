"use client";

import { FileDown } from "lucide-react";
import { requireUser } from "@/app/server/auth/requireUser";
import type { SalesRecord } from "@/app/server/salesData/getBaseData";
import { Button } from "@/components/ui/button";
import { useRecordsFilters } from "../context/RecordsFiltersContext";
import { recordsToPDF } from "../helpers/recordsToPDF";
import { loadLogoDataUrl } from "../helpers/loadLogoDataUrl";

// Builds the PDF in memory and hands it to the browser as a download. The
// records are already loaded on the client; the only server call is the
// account check.
async function downloadRecordsPDF(records: SalesRecord[]): Promise<void> {
  await requireUser();
  const logoDataUrl = await loadLogoDataUrl();
  const doc = recordsToPDF(records, logoDataUrl);
  doc.save(`records-${new Date().toISOString().slice(0, 10)}.pdf`);
}

export function RecordsExportButton() {
  const { records } = useRecordsFilters();

  return (
    <Button
      variant="outline"
      className="h-10 shrink-0 rounded-xl"
      onClick={() => downloadRecordsPDF(records)}
    >
      <FileDown />
      Export PDF
    </Button>
  );
}
