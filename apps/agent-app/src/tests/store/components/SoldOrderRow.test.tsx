import { render, screen, fireEvent } from "@testing-library/react-native";
import { SoldOrderRow } from "@/src/features/store/components/SoldOrderRow";
import type { LoggedItem } from "@/src/features/store/types/store-types";

function makeItem(overrides: Partial<LoggedItem> = {}): LoggedItem {
  return {
    saleId: "s1",
    productId: "p1",
    productName: "Pandesal",
    price: 10,
    qty: 5,
    boQty: 0,
    paymentType: "cash",
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

  // 3. Payment type marker shows on every row.
  test("shows a CREDIT marker for a credit order", () => {
    render(
      <SoldOrderRow
        item={makeItem({ paymentType: "credit" })}
        index={0}
        onPress={() => {}}
        onDelete={() => {}}
      />,
    );
    expect(screen.getByText("Credit")).toBeTruthy();
    expect(screen.queryByText("Cash")).toBeNull();
  });

  test("shows a CASH marker for a cash order", () => {
    render(
      <SoldOrderRow
        item={makeItem({ paymentType: "cash" })}
        index={0}
        onPress={() => {}}
        onDelete={() => {}}
      />,
    );
    expect(screen.getByText("Cash")).toBeTruthy();
    expect(screen.queryByText("Credit")).toBeNull();
  });

  test("shows only a red BO marker when the row is back-order only", () => {
    render(
      <SoldOrderRow
        item={makeItem({ qty: 0, boQty: 8 })}
        index={0}
        onPress={() => {}}
        onDelete={() => {}}
      />,
    );
    expect(screen.getByText("BO")).toBeTruthy();
    expect(screen.queryByText("Cash")).toBeNull();
    expect(screen.queryByText("Credit")).toBeNull();
  });

  test("shows both the payment marker and the BO marker when sold and back-ordered", () => {
    render(
      <SoldOrderRow
        item={makeItem({ qty: 5, boQty: 8, paymentType: "cash" })}
        index={0}
        onPress={() => {}}
        onDelete={() => {}}
      />,
    );
    expect(screen.getByText("Cash")).toBeTruthy();
    expect(screen.getByText("BO")).toBeTruthy();
  });

  // 4. Interaction: tapping delete calls onDelete with this row's index.
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
