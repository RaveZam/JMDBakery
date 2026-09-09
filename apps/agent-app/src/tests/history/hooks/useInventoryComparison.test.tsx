import { renderHook, act } from "@testing-library/react-native";
import { useInventoryComparison } from "@/src/features/history/hooks/useInventoryComparison";

const mockContext = jest.fn();
jest.mock("@/src/features/history/context/HistorySessionContext", () => ({
  useHistorySessionContext: () => mockContext(),
}));

/**
 * Two products loaded and sold. "Pandesal" was counted exactly as the sales say;
 * "Ensaymada" is 5 short on its balance, so only it needs attention.
 */
function seedSession() {
  mockContext.mockReturnValue({
    inventory: [
      { productId: "p1", productName: "Pandesal", qty: 100 },
      { productId: "p2", productName: "Ensaymada", qty: 50 },
    ],
    endingInventory: [
      { productId: "p1", productName: "Pandesal", endingBo: 2, endingBalance: 18 },
      { productId: "p2", productName: "Ensaymada", endingBo: 0, endingBalance: 5 },
    ],
    salesByStore: {
      store1: [
        { productId: "p1", qty: 80, boQty: 2 },
        { productId: "p2", qty: 40, boQty: 0 },
      ],
    },
  });
}

beforeEach(() => {
  mockContext.mockReset();
  seedSession();
});

test("counts only the products whose counts disagree with the sales", () => {
  const { result } = renderHook(() => useInventoryComparison());

  expect(result.current.comparison.attentionCount).toBe(1);
  expect(result.current.comparison.rows).toHaveLength(2);
});

test("the attention filter narrows the rows to the ones that disagree", () => {
  const { result } = renderHook(() => useInventoryComparison());

  act(() => result.current.comparison.setShowOnlyAttention(true));

  expect(result.current.comparison.rows.map((row) => row.productId)).toEqual(["p2"]);
  // The count stays whole-session, so the tab's label doesn't shrink as it filters.
  expect(result.current.comparison.attentionCount).toBe(1);
});

test("rows start collapsed and toggle one at a time", () => {
  const { result } = renderHook(() => useInventoryComparison());

  expect(result.current.comparison.isExpanded("p1")).toBe(false);

  act(() => result.current.comparison.toggleRow("p1"));
  expect(result.current.comparison.isExpanded("p1")).toBe(true);
  expect(result.current.comparison.isExpanded("p2")).toBe(false);

  act(() => result.current.comparison.toggleRow("p1"));
  expect(result.current.comparison.isExpanded("p1")).toBe(false);
});

test("a session with no morning stock reports nothing loaded", () => {
  mockContext.mockReturnValue({
    inventory: [],
    endingInventory: [],
    salesByStore: {},
  });

  const { result } = renderHook(() => useInventoryComparison());

  expect(result.current.comparison.hasStock).toBe(false);
  expect(result.current.comparison.rows).toEqual([]);
});
