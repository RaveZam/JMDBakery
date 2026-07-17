// Screen-composition test: the list's own job is choosing between the empty
// state and a card per session, so the data hook is mocked and the real
// EmptyHistoryList / HistorySessionCard children render.
import { render, screen } from "@testing-library/react-native";
import { HistorySessionList } from "@/src/features/history/components/HistorySessionList";
import { useHistoryList } from "@/src/features/history/hooks/useHistoryList";
import type { SessionRow } from "@/src/features/history/hooks/useHistoryList";

jest.mock("expo-router", () => ({ router: { push: jest.fn() } }));
jest.mock("@/src/features/history/hooks/useHistoryList", () => ({
  useHistoryList: jest.fn(),
}));

const mockUseHistoryList = useHistoryList as jest.Mock;

function makeSession(overrides: Partial<SessionRow> = {}): SessionRow {
  return {
    id: "sess-1",
    route_name: "North Route",
    session_date: "2026-06-30T12:00:00",
    conducted_by: "agent-1234",
    conducted_by_name: "Test Agent",
    status: "completed",
    morning_inventory_finished: 1,
    created_at: "2026-06-30T00:00:00.000Z",
    ...overrides,
  };
}

test("shows the empty state when there are no sessions", () => {
  mockUseHistoryList.mockReturnValue({ history: { sessions: [] } });

  render(<HistorySessionList />);

  expect(screen.getByText("No sessions yet")).toBeOnTheScreen();
});

test("renders one card per session instead of the empty state", () => {
  mockUseHistoryList.mockReturnValue({
    history: {
      sessions: [
        makeSession(),
        makeSession({ id: "sess-2", route_name: "South Route" }),
      ],
    },
  });

  render(<HistorySessionList />);

  expect(screen.getByText("North Route")).toBeOnTheScreen();
  expect(screen.getByText("South Route")).toBeOnTheScreen();
  expect(screen.queryByText("No sessions yet.")).not.toBeOnTheScreen();
});
