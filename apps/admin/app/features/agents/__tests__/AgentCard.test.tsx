import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { AgentCard } from "../components/AgentCard";
import type { AgentRow } from "../types/agent-types";

function makeAgent(overrides: Partial<AgentRow> = {}): AgentRow {
  return {
    id: "agent-1",
    email: "ana@jmd.test",
    name: "Ana Cruz",
    createdAt: "2026-03-02T08:30:00Z",
    totalSessions: 4,
    completedSessions: 3,
    totalStoresVisited: 15,
    totalStoresPlanned: 20,
    totalSold: 90,
    totalBadOrdered: 10,
    ...overrides,
  };
}

describe("AgentCard", () => {
  test("shows the agent's name and email", () => {
    render(<AgentCard agent={makeAgent()} onDelete={vi.fn()} />);

    expect(screen.getByText("Ana Cruz")).toBeTruthy();
    expect(screen.getByText("ana@jmd.test")).toBeTruthy();
  });

  test("shows the session count, stores visited and visit rate", () => {
    render(<AgentCard agent={makeAgent()} onDelete={vi.fn()} />);

    expect(screen.getByText("4")).toBeTruthy();
    expect(screen.getByText("15")).toBeTruthy();
    expect(screen.getByText("75%")).toBeTruthy();
  });

  test("shows a 0% visit rate when the agent has no planned stores", () => {
    const agent = makeAgent({ totalStoresVisited: 0, totalStoresPlanned: 0 });

    render(<AgentCard agent={agent} onDelete={vi.fn()} />);

    expect(screen.getAllByText("0%").length).toBeGreaterThan(0);
  });

  test("shows the bad order rate out of sold plus bad ordered pieces", () => {
    render(<AgentCard agent={makeAgent()} onDelete={vi.fn()} />);

    expect(screen.getByText("10%")).toBeTruthy();
  });

  test("shows a 0% BO rate when nothing was sold or bad ordered", () => {
    const agent = makeAgent({ totalSold: 0, totalBadOrdered: 0 });

    render(<AgentCard agent={agent} onDelete={vi.fn()} />);

    expect(screen.getByText("BO Rate").nextSibling?.textContent).toBe("0%");
  });

  test("calls onDelete with the agent id when delete is pressed", () => {
    const onDelete = vi.fn();
    render(<AgentCard agent={makeAgent({ id: "agent-42" })} onDelete={onDelete} />);

    fireEvent.click(screen.getByLabelText("Delete Ana Cruz"));

    expect(onDelete).toHaveBeenCalledWith("agent-42");
  });

  test("does not call onDelete until the button is pressed", () => {
    const onDelete = vi.fn();
    render(<AgentCard agent={makeAgent()} onDelete={onDelete} />);

    expect(onDelete).not.toHaveBeenCalled();
  });
});
