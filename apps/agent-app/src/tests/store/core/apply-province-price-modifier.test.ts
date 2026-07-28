import { applyProvincePriceModifier } from "@/src/features/store/core/apply-province-price-modifier";

test("no storeProvince leaves the price unchanged", () => {
  const modifiers = [
    { product_id: "p12", province_keyword: "tuguegarao", price_modifier: -1 },
  ];
  expect(applyProvincePriceModifier(55, "p12", null, modifiers)).toBe(55);
});

test("no matching modifier leaves the price unchanged", () => {
  const modifiers = [
    { product_id: "p12", province_keyword: "tuguegarao", price_modifier: -1 },
  ];
  expect(applyProvincePriceModifier(55, "p12", "Isabela", modifiers)).toBe(55);
});

test("matches the keyword as a case-insensitive substring of storeProvince", () => {
  const modifiers = [
    { product_id: "p12", province_keyword: "tuguegarao", price_modifier: -1 },
  ];
  expect(
    applyProvincePriceModifier(55, "p12", "Cagayan - TUGUEGARAO City", modifiers),
  ).toBe(54);
});

test("only applies a modifier scoped to the matching product_id", () => {
  const modifiers = [
    { product_id: "other", province_keyword: "tuguegarao", price_modifier: -1 },
  ];
  expect(
    applyProvincePriceModifier(55, "p12", "Cagayan - Tuguegarao City", modifiers),
  ).toBe(55);
});

test("first matching modifier wins when more than one matches", () => {
  const modifiers = [
    { product_id: "p12", province_keyword: "isabela", price_modifier: -1 },
    { product_id: "p12", province_keyword: "tugue", price_modifier: -3 },
  ];
  expect(
    applyProvincePriceModifier(55, "p12", "Isabela - Tuguegarao", modifiers),
  ).toBe(54);
});
