import type { SalesRecord } from "@/app/server/getBaseData";

export function computeBORateThisMonth(data: SalesRecord[]) {
  const boTotal = data.reduce((sum, r) => r.boQty + sum, 0);
  const soldTotal = data.reduce((sum, r) => r.soldQty + sum, 0);
  const borate = soldTotal === 0 ? 0 : (boTotal / soldTotal) * 100;

  return { borate };
}
