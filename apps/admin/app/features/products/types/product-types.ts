export type Product = {
  id: string;
  name: string;
  price: number;
};

export type ProductInput = {
  name: string;
  price: number;
};

export type CatalogSummary = {
  count: number;
  minPrice: number | null;
  maxPrice: number | null;
};

export type PriceModifier = {
  id: string;
  productId: string;
  keyword: string;
  modifier: number;
};

export type PriceModifierInput = {
  keyword: string;
  modifier: number;
};
