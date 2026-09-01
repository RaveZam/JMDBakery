import { describe, expect, test } from "vitest";
import { computeTopAgents } from "../helpers/computeTopAgents";

describe("computeTopAgents", () => {
  test("merges an agent's rows into a single revenue total", () => {
    const data = [
      { agent: "Ana", total: 100, paymentType: "cash" as const },
      { agent: "Ben", total: 50, paymentType: "cash" as const },
      { agent: "Ana", total: 25, paymentType: "cash" as const },
    ];

    expect(computeTopAgents(data, [])).toEqual([
      { agent: "Ana", revenue: 125 },
      { agent: "Ben", revenue: 50 },
    ]);
  });

  test("orders agents by revenue, highest first", () => {
    const data = [
      { agent: "Low", total: 1, paymentType: "cash" as const },
      { agent: "High", total: 300, paymentType: "cash" as const },
      { agent: "Mid", total: 50, paymentType: "cash" as const },
    ];

    expect(computeTopAgents(data, []).map((a) => a.agent)).toEqual([
      "High",
      "Mid",
      "Low",
    ]);
  });

  test("keeps only the top five agents", () => {
    const data = Array.from({ length: 8 }, (_, i) => ({
      agent: `Agent ${i}`,
      total: i * 10,
      paymentType: "cash" as const,
    }));

    const top = computeTopAgents(data, []);

    expect(top).toHaveLength(5);
    expect(top[0].agent).toBe("Agent 7");
    expect(top[4].agent).toBe("Agent 3");
  });

  test("returns an empty list when there are no sales", () => {
    expect(computeTopAgents([], [])).toEqual([]);
  });

  test("still counts an agent whose sales net out to zero", () => {
    const data = [{ agent: "Ana", total: 0, paymentType: "cash" as const }];

    expect(computeTopAgents(data, [])).toEqual([{ agent: "Ana", revenue: 0 }]);
  });

  test("leaves an agent's credit orders out of their revenue", () => {
    const data = [
      { agent: "Ana", total: 100, paymentType: "cash" as const },
      { agent: "Ana", total: 900, paymentType: "credit" as const },
    ];

    expect(computeTopAgents(data, [])).toEqual([{ agent: "Ana", revenue: 100 }]);
  });

  test("credits the agent who collected a repayment", () => {
    const data = [{ agent: "Ana", total: 100, paymentType: "cash" as const }];
    const payments = [{ collectedBy: "Ana", amount: 50 }];

    expect(computeTopAgents(data, payments)).toEqual([
      { agent: "Ana", revenue: 150 },
    ]);
  });

  test("ranks an agent who only collected repayments", () => {
    const payments = [{ collectedBy: "Ben", amount: 400 }];

    expect(computeTopAgents([], payments)).toEqual([
      { agent: "Ben", revenue: 400 },
    ]);
  });
});
