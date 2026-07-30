import { render, screen, fireEvent } from "@testing-library/react-native";
import { AddStoreChoiceModal } from "@/src/features/routes/components/route-detail-screen-components/addstore";

function renderModal(overrides: Partial<Parameters<typeof AddStoreChoiceModal>[0]> = {}) {
  const props = {
    provinceName: "Echague",
    visible: true,
    onRegisterNew: jest.fn(),
    onAddExisting: jest.fn(),
    onClose: jest.fn(),
    ...overrides,
  };
  render(<AddStoreChoiceModal {...props} />);
  return props;
}

test("the plus button offers both ways to add a store", () => {
  renderModal();

  expect(screen.getByText("Register a new store")).toBeOnTheScreen();
  expect(screen.getByText("Add an existing store")).toBeOnTheScreen();
  expect(screen.getByText("Echague")).toBeOnTheScreen();
});

test("picking register new hands off to the registration form", () => {
  const props = renderModal();

  fireEvent.press(screen.getByTestId("add-store-register-new"));

  expect(props.onRegisterNew).toHaveBeenCalled();
  expect(props.onAddExisting).not.toHaveBeenCalled();
});

test("picking add existing hands off to the search", () => {
  const props = renderModal();

  fireEvent.press(screen.getByTestId("add-store-add-existing"));

  expect(props.onAddExisting).toHaveBeenCalled();
  expect(props.onRegisterNew).not.toHaveBeenCalled();
});

test("nothing renders while closed", () => {
  renderModal({ visible: false });

  expect(screen.queryByText("Register a new store")).not.toBeOnTheScreen();
});
