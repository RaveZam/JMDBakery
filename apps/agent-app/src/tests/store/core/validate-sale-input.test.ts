import { validateSaleInput } from "./validate-sale-input";

test("zero qty and zero BO qty is invalid", () => {
  expect(validateSaleInput({ qty: 0, boQty: 0, boReason: "" })).toEqual({
    valid: false,
    needsReason: false,
  });
});

test("positive sale qty alone is valid", () => {
  expect(validateSaleInput({ qty: 5, boQty: 0, boReason: "" })).toEqual({
    valid: true,
    needsReason: false,
  });
});

test("positive BO qty without a reason needs a reason and is invalid", () => {
  expect(validateSaleInput({ qty: 0, boQty: 2, boReason: "" })).toEqual({
    valid: false,
    needsReason: true,
  });
});

test("positive BO qty with a reason is valid", () => {
  expect(
    validateSaleInput({ qty: 0, boQty: 2, boReason: "Damaged" }),
  ).toEqual({ valid: true, needsReason: false });
});

test("sale qty and BO qty together are valid once reason is set", () => {
  expect(
    validateSaleInput({ qty: 5, boQty: 2, boReason: "Lost" }),
  ).toEqual({ valid: true, needsReason: false });
});
