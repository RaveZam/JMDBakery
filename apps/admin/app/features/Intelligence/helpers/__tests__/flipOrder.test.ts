import { describe, expect, test } from "vitest";
import { flipOrder } from "../flipOrder";

describe("flipOrder", () => {
  test("keeps the order when not flipped", () => {
    expect(flipOrder([1, 2, 3], false)).toEqual([1, 2, 3]);
  });

  test("reverses the order when flipped, without changing the input", () => {
    const rows = [1, 2, 3];

    expect(flipOrder(rows, true)).toEqual([3, 2, 1]);
    expect(rows).toEqual([1, 2, 3]);
  });
});
