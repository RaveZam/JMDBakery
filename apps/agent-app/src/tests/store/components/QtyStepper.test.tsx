import { render, screen, fireEvent } from "@testing-library/react-native";
import { QtyStepper } from "@/src/features/store/components/adder-panel-components/QtyStepper";

test("renders its label and current value", () => {
  render(<QtyStepper label="Bad orders" value={4} onChange={() => {}} />);

  expect(screen.getByText("Bad orders")).toBeOnTheScreen();
  expect(screen.getByDisplayValue("4")).toBeOnTheScreen();
});

test("plus increments and minus decrements", () => {
  const onChange = jest.fn();
  render(<QtyStepper value={4} onChange={onChange} />);

  fireEvent.press(screen.getByText("+"));
  expect(onChange).toHaveBeenLastCalledWith(5);

  fireEvent.press(screen.getByText("−"));
  expect(onChange).toHaveBeenLastCalledWith(3);
});

test("minus clamps at zero", () => {
  const onChange = jest.fn();
  render(<QtyStepper value={0} onChange={onChange} />);

  fireEvent.press(screen.getByText("−"));

  expect(onChange).toHaveBeenLastCalledWith(0);
});

test("typing a number updates the value", () => {
  const onChange = jest.fn();
  render(<QtyStepper value={0} onChange={onChange} />);

  fireEvent.changeText(screen.getByDisplayValue("0"), "12");

  expect(onChange).toHaveBeenLastCalledWith(12);
});

test.each([
  ["abc", 0], // non-numeric input falls back to 0
  ["-3", 0], // negatives clamp to 0
  ["", 0], // cleared field falls back to 0
])("typing %p coerces to %p", (typed, expected) => {
  const onChange = jest.fn();
  render(<QtyStepper value={4} onChange={onChange} />);

  fireEvent.changeText(screen.getByDisplayValue("4"), typed);

  expect(onChange).toHaveBeenLastCalledWith(expected);
});
