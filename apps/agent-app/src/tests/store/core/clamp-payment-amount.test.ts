import { clampPaymentAmount } from "@/src/features/store/core/clamp-payment-amount";

test("an amount under the balance is kept as typed", () => {
  expect(clampPaymentAmount("150", 500)).toEqual({ text: "150", amount: 150 });
});

test("an amount equal to the balance is kept", () => {
  expect(clampPaymentAmount("500", 500)).toEqual({ text: "500", amount: 500 });
});

test("an amount over the balance snaps down to the balance", () => {
  expect(clampPaymentAmount("900", 500)).toEqual({ text: "500", amount: 500 });
});

test("empty input is an empty field and pays nothing", () => {
  expect(clampPaymentAmount("", 500)).toEqual({ text: "", amount: 0 });
});

test("non-digit characters are dropped", () => {
  expect(clampPaymentAmount("₱1,2a0", 500)).toEqual({ text: "120", amount: 120 });
});

test("input with no digits at all is treated as empty", () => {
  expect(clampPaymentAmount("abc", 500)).toEqual({ text: "", amount: 0 });
});

test("decimals are not allowed, so the dot is dropped", () => {
  // Whole pesos only: "12.50" loses its dot and becomes 1250, then caps.
  expect(clampPaymentAmount("12.50", 5000)).toEqual({ text: "1250", amount: 1250 });
});

test("leading zeros are cleaned up", () => {
  expect(clampPaymentAmount("007", 500)).toEqual({ text: "7", amount: 7 });
});

test("a zero balance caps every amount at 0", () => {
  expect(clampPaymentAmount("100", 0)).toEqual({ text: "0", amount: 0 });
});

test("a negative balance is treated as 0, never a negative payment", () => {
  expect(clampPaymentAmount("100", -50)).toEqual({ text: "0", amount: 0 });
});
