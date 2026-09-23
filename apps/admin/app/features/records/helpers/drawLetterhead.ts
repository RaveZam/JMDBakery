import type jsPDF from "jspdf";

const BUSINESS_NAME = "JMD Bakery";
const BUSINESS_ADDRESS = "Plaridel, Santiago City";
const BUSINESS_PHONE = "0927 717 6223";
const BUSINESS_EMAIL = "jmdbakery@gmail.com";

// Draws the logo and business details at the top of the page, with a
// divider line under it to separate the letterhead from the table.
export function drawLetterhead(doc: jsPDF, logoDataUrl: string): void {
  doc.addImage(logoDataUrl, "PNG", 14, 10, 18, 18);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text(BUSINESS_NAME, 36, 17);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(BUSINESS_ADDRESS, 36, 23);
  doc.text(`${BUSINESS_PHONE}   ${BUSINESS_EMAIL}`, 36, 28);

  doc.setDrawColor(200);
  doc.line(14, 33, doc.internal.pageSize.getWidth() - 14, 33);
}
