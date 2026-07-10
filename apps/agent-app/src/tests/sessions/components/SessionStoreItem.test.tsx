import { render, screen, fireEvent } from "@testing-library/react-native";
import { SessionStoreItem } from "@/src/features/sessions/components/session-route-screen-components/SessionStoreItem";
import type { SessionStore } from "@/src/features/sessions/types/session-types";

function makeStore(overrides: Partial<SessionStore> = {}): SessionStore {
  return {
    id: "ss-1",
    route_session_id: "session-1",
    store_id: "store-1",
    store_name: "Aling Nena's Store",
    store_province: null,
    store_city: null,
    store_barangay: null,
    store_contact_name: null,
    province_name: null,
    visited: 0,
    created_at: "2026-06-30T00:00:00.000Z",
    ...overrides,
  };
}

test("pending store shows its stop number and a Pending badge", () => {
  render(<SessionStoreItem store={makeStore()} index={2} onPress={() => {}} />);

  expect(screen.getByText("Aling Nena's Store")).toBeOnTheScreen();
  expect(screen.getByText("3")).toBeOnTheScreen(); // index is 0-based
  expect(screen.getByText("Pending")).toBeOnTheScreen();
  expect(screen.queryByText("Visited")).not.toBeOnTheScreen();
});

test("visited store shows the Visited badge instead of a stop number", () => {
  render(
    <SessionStoreItem
      store={makeStore({ visited: 1 })}
      index={2}
      onPress={() => {}}
    />,
  );

  expect(screen.getByText("Visited")).toBeOnTheScreen();
  expect(screen.queryByText("3")).not.toBeOnTheScreen();
  expect(screen.queryByText("Pending")).not.toBeOnTheScreen();
});

test("shows location and contact rows only when the store has them", () => {
  render(
    <SessionStoreItem
      store={makeStore({
        store_barangay: "San Jose",
        store_city: "Malolos",
        store_contact_name: "Nena Cruz",
      })}
      index={0}
      onPress={() => {}}
    />,
  );

  expect(screen.getByText("San Jose, Malolos")).toBeOnTheScreen();
  expect(screen.getByText("Nena Cruz")).toBeOnTheScreen();
});

test("joins location cleanly when only the city is known", () => {
  render(
    <SessionStoreItem
      store={makeStore({ store_city: "Malolos" })}
      index={0}
      onPress={() => {}}
    />,
  );

  expect(screen.getByText("Malolos")).toBeOnTheScreen();
});

test("pressing the card fires onPress", () => {
  const onPress = jest.fn();
  render(<SessionStoreItem store={makeStore()} index={0} onPress={onPress} />);

  fireEvent.press(screen.getByText("Aling Nena's Store"));

  expect(onPress).toHaveBeenCalledTimes(1);
});
