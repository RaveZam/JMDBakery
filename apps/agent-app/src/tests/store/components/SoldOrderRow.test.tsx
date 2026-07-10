import { render, screen, fireEvent } from "@testing-library/react-native";
import { SoldOrderRow } from "@/src/features/store/components/SoldOrderRow";
import type { LoggedItem } from "@/src/features/store/hooks/useDistributionLog";

function makeItem(overrides: Partial<LoggedItem> = {}): LoggedItem {
  return {
    saleId: "s1",
    productId: "p1",
    productName: "Pandesal",
    price: 10,
    qty: 5,
    boQty: 0,
    ...overrides,
  };
}

describe("SoldOrderRow", () => {
  // 1. Does it put the data on screen?
  test("renders product name, price and computed total", () => {
    render(
      <SoldOrderRow
        item={makeItem({ productName: "Ensaymada", price: 25, qty: 4 })}
        index={0}
        onPress={() => {}}
        onDelete={() => {}}
      />,
    );

    expect(screen.getByText("Ensaymada")).toBeTruthy();
    expect(screen.getByText("₱25 / pack")).toBeTruthy();
    expect(screen.getByText("₱100")).toBeTruthy(); // 4 * 25, formatted
  });

  // 2. Conditional rendering: BO number when > 0...
  test("shows the back-order quantity when boQty > 0", () => {
    render(
      <SoldOrderRow
        item={makeItem({ boQty: 3 })}
        index={0}
        onPress={() => {}}
        onDelete={() => {}}
      />,
    );
    expect(screen.getByText("3")).toBeTruthy();
  });

  // ...and a dash when it's 0.
  test("shows a dash when boQty is 0", () => {
    render(
      <SoldOrderRow
        item={makeItem({ boQty: 0 })}
        index={0}
        onPress={() => {}}
        onDelete={() => {}}
      />,
    );
    expect(screen.getByText("—")).toBeTruthy();
  });

  // 3. Interaction: tapping delete calls onDelete with this row's index.
  test("calls onDelete with the row index when delete is pressed", () => {
    const onDelete = jest.fn(); // a "spy" — records how it was called
    render(
      <SoldOrderRow
        item={makeItem()}
        index={7}
        onPress={() => {}}
        onDelete={onDelete}
      />,
    );

    fireEvent.press(screen.getByLabelText("delete-row"));

    expect(onDelete).toHaveBeenCalledWith(7);
  });
});
