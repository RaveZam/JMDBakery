"use client";

import { FileDown } from "lucide-react";
import type { SalesRecord } from "@/app/server/salesData/getBaseData";
import { Button } from "@/components/ui/button";
import { useRecordsFilters } from "../context/RecordsFiltersContext";
import { recordsToPDF } from "../helpers/recordsToPDF";
import { loadLogoDataUrl } from "../helpers/loadLogoDataUrl";

// Builds the PDF in memory and hands it to the browser as a download — no
// server round trip, since the records are already loaded on the client.
async function downloadRecordsPDF(records: SalesRecord[]): Promise<void> {
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
