import { render, screen, fireEvent } from "@testing-library/react-native";
import { Alert } from "react-native";
import { HistorySessionCard } from "@/src/features/history/components/HistorySessionCard";
import type { SessionRow } from "@/src/features/history/hooks/useHistoryList";
import { deleteHistorySession } from "@/src/features/history/services/delete-session-service";

jest.mock("expo-router", () => ({ router: { push: jest.fn() } }));
jest.mock("@/src/features/history/services/delete-session-service", () => ({
  deleteHistorySession: jest.fn(),
}));

const alertSpy = jest.spyOn(Alert, "alert");

beforeEach(() => {
  jest.clearAllMocks();
});

function makeSession(overrides: Partial<SessionRow> = {}): SessionRow {
  return {
    id: "sess-1",
    route_name: "North Route",
    // Local-time ISO (no Z) keeps the rendered day stable in any timezone.
    session_date: "2026-06-30T12:00:00",
    conducted_by: "agent-1234",
    conducted_by_name: "Test Agent",
    status: "completed",
    morning_inventory_finished: 1,
    created_at: "2026-06-30T00:00:00.000Z",
    ...overrides,
  };
}

test("shows the route name, formatted date with agent prefix, and status", () => {
  render(<HistorySessionCard session={makeSession()} onDeleted={jest.fn()} />);

  expect(screen.getByText("North Route")).toBeOnTheScreen();
  expect(screen.getByText("Jun 30, 2026 • agent")).toBeOnTheScreen(); // first 5 chars of conducted_by
  expect(screen.getByText("completed")).toBeOnTheScreen();
});

test("shows the raw status for ongoing and cancelled sessions too", () => {
  render(
    <HistorySessionCard
      session={makeSession({ id: "s2", status: "ongoing" })}
      onDeleted={jest.fn()}
    />,
  );
  expect(screen.getByText("ongoing")).toBeOnTheScreen();

  render(
    <HistorySessionCard
      session={makeSession({ id: "s3", status: "cancelled" })}
      onDeleted={jest.fn()}
    />,
  );
  expect(screen.getByText("cancelled")).toBeOnTheScreen();
});

test("pressing the card opens the session detail with its id and route name", () => {
  const { router } = require("expo-router");
  render(<HistorySessionCard session={makeSession()} onDeleted={jest.fn()} />);

  fireEvent.press(screen.getByText("North Route"));

  expect(router.push).toHaveBeenCalledWith({
    pathname: "/main/history/[sessionId]",
    params: { sessionId: "sess-1", routeName: "North Route" },
  });
});

test("a completed session has no swipe-to-delete action", () => {
  render(<HistorySessionCard session={makeSession()} onDeleted={jest.fn()} />);

  expect(screen.queryByText("Delete")).not.toBeOnTheScreen();
});

test("swiping a deletable session and confirming deletes it and notifies the parent", () => {
  const onDeleted = jest.fn();
  render(
    <HistorySessionCard
      session={makeSession({ status: "ongoing" })}
      onDeleted={onDeleted}
    />,
  );

  fireEvent.press(screen.getByText("Delete"));

  expect(alertSpy).toHaveBeenCalled();
  const [, , buttons] = alertSpy.mock.calls[0];
  const deleteButton = buttons?.find((b) => b.text === "Delete");
  deleteButton?.onPress?.();

  expect(deleteHistorySession).toHaveBeenCalledWith("sess-1");
  expect(onDeleted).toHaveBeenCalled();
});
