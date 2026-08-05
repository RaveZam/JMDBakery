import { parseCreditAmount } from "@/src/features/store/core/parse-credit-amount";

test("an empty field is worth nothing", () => {
  expect(parseCreditAmount("")).toEqual({ text: "", amount: 0 });
});

test("digits become a whole-peso amount", () => {
  expect(parseCreditAmount("750")).toEqual({ text: "750", amount: 750 });
});

test("anything that isn't a digit is dropped as it's typed", () => {
  expect(parseCreditAmount("₱1,2a50.99")).toEqual({
    text: "125099",
    amount: 125099,
  });
});

test("leading zeros are normalised away", () => {
  expect(parseCreditAmount("007")).toEqual({ text: "7", amount: 7 });
});

test("a field of only junk reads as empty, not zero pesos", () => {
  expect(parseCreditAmount("abc")).toEqual({ text: "", amount: 0 });
});

test("correcting a debt upward is not capped", () => {
  // Unlike a payment, which clamps to the balance — an agent raising a credit
  // is correcting what the store owes, and nothing bounds that from above.
  expect(parseCreditAmount("999999").amount).toBe(999999);
});
