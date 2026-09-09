export type EndingInventoryRow = {
  id?: string;
  productId: string;
  productName: string;
  expectedBo: number;
  expectedBalance: number;
  endingBo: number;
  endingBalance: number;
};
