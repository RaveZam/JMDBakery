import { render, screen } from "@testing-library/react";
import { ShieldCheck } from "lucide-react";
import { describe, expect, test } from "vitest";
import { KpiSection } from "../KpiSection";
import type { IntelligenceKpis } from "../../../types";

function makeKpis(overrides: Partial<IntelligenceKpis> = {}): IntelligenceKpis {
  return {
    revenueToday: 1000,
    revenueYesterday: 800,
    revenueChangePct: 25,
    revenueThisMonth: 25000,
    badOrderRatePct: 4.2,
    badOrderRisk: { tone: "healthy", label: "Healthy", icon: ShieldCheck },
    totalBadOrderQty: 30,
    totalBadOrderAmount: 450,
    ...overrides,
  };
}

describe("KpiSection", () => {
  test("shows a + sign and the up-trend framing when revenue increased", () => {
    render(<KpiSection kpis={makeKpis({ revenueChangePct: 25 })} />);

    expect(screen.getByText("+25.0%")).toBeTruthy();
  });

  test("shows no + sign when revenue decreased", () => {
    render(<KpiSection kpis={makeKpis({ revenueChangePct: -10 })} />);

    expect(screen.getByText("-10.0%")).toBeTruthy();
    expect(screen.queryByText("+-10.0%")).toBeNull();
  });

  test("shows today's and yesterday's revenue under the trend", () => {
    render(<KpiSection kpis={makeKpis()} />);

    expect(screen.getByText("Today ₱1,000 vs Yesterday ₱800")).toBeTruthy();
  });

  test("shows the bad order risk label and rate", () => {
    render(
      <KpiSection
        kpis={makeKpis({
          badOrderRatePct: 16,
          badOrderRisk: {
            tone: "critical",
            label: "Risky",
            icon: ShieldCheck,
          },
        })}
      />,
    );

    expect(screen.getByText("Risky")).toBeTruthy();
    expect(screen.getByText("Bad order rate 16.0% this month")).toBeTruthy();
  });

  test("shows the month's revenue", () => {
    render(<KpiSection kpis={makeKpis({ revenueThisMonth: 25000 })} />);

    expect(screen.getByText("₱25,000")).toBeTruthy();
  });

  test("shows the bad order amount and piece count for the month", () => {
    render(
      <KpiSection
        kpis={makeKpis({ totalBadOrderAmount: 1250, totalBadOrderQty: 1200 })}
      />,
    );

    expect(screen.getByText("₱1,250")).toBeTruthy();
    expect(screen.getByText("1,200 pcs")).toBeTruthy();
  });
});
