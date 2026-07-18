import { describe, expect, test } from "vitest";
import { computeTopAgents } from "../helpers/computeTopAgents";

describe("computeTopAgents", () => {
  test("merges an agent's rows into a single revenue total", () => {
    const data = [
      { agent: "Ana", total: 100 },
      { agent: "Ben", total: 50 },
      { agent: "Ana", total: 25 },
    ];

    expect(computeTopAgents(data)).toEqual([
      { agent: "Ana", revenue: 125 },
      { agent: "Ben", revenue: 50 },
    ]);
  });

  test("orders agents by revenue, highest first", () => {
    const data = [
      { agent: "Low", total: 1 },
      { agent: "High", total: 300 },
      { agent: "Mid", total: 50 },
    ];

    expect(computeTopAgents(data).map((a) => a.agent)).toEqual([
      "High",
      "Mid",
      "Low",
    ]);
  });

  test("keeps only the top five agents", () => {
    const data = Array.from({ length: 8 }, (_, i) => ({
      agent: `Agent ${i}`,
      total: i * 10,
    }));

    const top = computeTopAgents(data);

    expect(top).toHaveLength(5);
    expect(top[0].agent).toBe("Agent 7");
    expect(top[4].agent).toBe("Agent 3");
  });

  test("returns an empty list when there are no sales", () => {
    expect(computeTopAgents([])).toEqual([]);
  });

  test("still counts an agent whose sales net out to zero", () => {
    const data = [{ agent: "Ana", total: 0 }];

    expect(computeTopAgents(data)).toEqual([{ agent: "Ana", revenue: 0 }]);
  });
});
