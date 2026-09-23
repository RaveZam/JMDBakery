import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { SalesRecord } from "@/app/server/salesData/getBaseData";
import { drawLetterhead } from "./drawLetterhead";

const HEADER = [
  "Date",
  "Agent",
  "Store",
  "Province",
  "Product",
  "Payment",
  "Sold",
  "Bad Order",
  "Unit Price",
  "Total",
];

// Builds a PDF with the bakery letterhead on top and the records as a table
// below it. `logoDataUrl` is passed in rather than fetched here, since
// loading an image is I/O and this stays a plain build step.
export function recordsToPDF(
  records: SalesRecord[],
  logoDataUrl: string,
): jsPDF {
  const doc = new jsPDF({ orientation: "landscape" });
  drawLetterhead(doc, logoDataUrl);

  const rows = records.map((record) => [
    record.date,
    record.agent,
    record.store,
    record.province,
    record.product,
    record.paymentType === "credit" ? "Credit" : "Cash",
    String(record.soldQty),
    String(record.boQty),
    String(record.unitPrice),
    String(record.total),
  ]);

  autoTable(doc, {
    head: [HEADER],
    body: rows,
    startY: 38,
    styles: { fontSize: 8 },
  });

  return doc;
}
