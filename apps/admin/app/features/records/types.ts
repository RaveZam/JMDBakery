export type LedgerRecord = {
  id: string;
  sessionId: string;
  date: string;
  agent: string;
  store: string;
  province: string;
  product: string;
  soldQty: number;
  boQty: number;
  unitPrice: number;
  lineTotal: number;
};
