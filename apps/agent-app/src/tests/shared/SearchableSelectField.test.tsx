import { render, screen, fireEvent, userEvent } from "@testing-library/react-native";
import { SearchableSelectField } from "@/src/shared/components/SearchableSelectField";

function renderField(
  overrides: Partial<Parameters<typeof SearchableSelectField>[0]> = {},
) {
  const props = {
    label: "Province",
    value: "",
    options: ["Cagayan", "Cavite", "Isabela"],
    onChange: jest.fn(),
    placeholder: "e.g. Metro Manila",
    ...overrides,
  };
  render(<SearchableSelectField {...props} />);
  return props;
}

async function openDropdown(user: ReturnType<typeof userEvent.setup>) {
  await user.press(screen.getByTestId("Province-dropdown"));
}

test("typing filters the suggestions", async () => {
  const user = userEvent.setup();
  renderField();
  await openDropdown(user);

  fireEvent.changeText(screen.getByPlaceholderText("Search..."), "Cav");

  expect(screen.getByText("Cavite")).toBeOnTheScreen();
  expect(screen.queryByText("Isabela")).not.toBeOnTheScreen();
});

test("tapping a suggestion reports the pick", async () => {
  const user = userEvent.setup();
  const props = renderField();
  await openDropdown(user);

  fireEvent.changeText(screen.getByPlaceholderText("Search..."), "Cagayan");
  await user.press(screen.getByText("Cagayan"));

  expect(props.onChange).toHaveBeenCalledWith("Cagayan");
});

test("offers to use the typed text when nothing matches", async () => {
  const user = userEvent.setup();
  renderField();
  await openDropdown(user);

  fireEvent.changeText(
    screen.getByPlaceholderText("Search..."),
    "New Barangay",
  );

  expect(screen.getByText('Use "New Barangay"')).toBeOnTheScreen();
});

test("a custom value not in options still shows as selected", () => {
  renderField({ value: "Custom Town" });

  expect(screen.getByText("Custom Town")).toBeOnTheScreen();
});

test("a disabled field does not open", async () => {
  const user = userEvent.setup();
  renderField({ disabled: true });
  await openDropdown(user);

  expect(screen.queryByPlaceholderText("Search...")).not.toBeOnTheScreen();
});
