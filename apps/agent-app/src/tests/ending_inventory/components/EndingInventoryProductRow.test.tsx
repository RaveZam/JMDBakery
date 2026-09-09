import { render, screen, fireEvent } from "@testing-library/react-native";
import { EndingInventoryProductRow } from "@/src/features/ending_inventory/components/ending-inventory-screen-components/EndingInventoryProductRow";
import type { EndingInventoryRow } from "@/src/features/ending_inventory/types/ending-inventory-types";

function makeItem(overrides: Partial<EndingInventoryRow> = {}): EndingInventoryRow {
  return {
    id: "end-1",
    productId: "prod-1",
    productName: "Pandesal",
    expectedBo: 2,
    expectedBalance: 14,
    endingBo: 2,
    endingBalance: 14,
    ...overrides,
  };
}

function renderRow(overrides: Partial<EndingInventoryRow> = {}) {
  const onStep = jest.fn();
  const onSet = jest.fn();
  render(
    <EndingInventoryProductRow
      item={makeItem(overrides)}
      onStep={onStep}
      onSet={onSet}
    />,
  );
  return { onStep, onSet };
}

test("shows the product name and both expected counts", () => {
  renderRow();
  expect(screen.getByText("Pandesal")).toBeTruthy();
  expect(screen.getByText("exp 2")).toBeTruthy();
  expect(screen.getByText("exp 14")).toBeTruthy();
});

// The two columns hold different numbers, so a swapped wiring would put the
// balance under BAD ORDER and go unnoticed on screen.
test("each column steps its own count", () => {
  const { onStep } = renderRow();

  fireEvent.press(screen.getByTestId("ending-inventory-bo-prod-1-increment"));
  expect(onStep).toHaveBeenCalledWith("endingBo", 1);

  fireEvent.press(
    screen.getByTestId("ending-inventory-balance-prod-1-decrement"),
  );
  expect(onStep).toHaveBeenCalledWith("endingBalance", -1);
});

test("a typed count goes to the column it was typed in", () => {
  const { onSet } = renderRow();

  fireEvent.changeText(
    screen.getByTestId("ending-inventory-balance-prod-1-input"),
    "47",
  );

  expect(onSet).toHaveBeenCalledWith("endingBalance", 47);
});

test("clearing the field reads as 0 rather than NaN", () => {
  const { onSet } = renderRow();

  fireEvent.changeText(screen.getByTestId("ending-inventory-bo-prod-1-input"), "");

  expect(onSet).toHaveBeenCalledWith("endingBo", 0);
});

test("a count off its expected value is styled apart from a matching one", () => {
  renderRow({ endingBo: 5 });

  const off = screen.getByTestId("ending-inventory-bo-prod-1-input");
  const matching = screen.getByTestId("ending-inventory-balance-prod-1-input");

  expect(JSON.stringify(off.props.style)).toContain("#B45309");
  expect(JSON.stringify(matching.props.style)).not.toContain("#B45309");
});
