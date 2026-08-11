import { render, screen } from "@testing-library/react";
import { ShieldCheck } from "lucide-react";
import { describe, expect, test } from "vitest";
import { KpiSection } from "../KpiSection";
import type { IntelligenceKpis } from "../../helpers/kpis";

function makeKpis(overrides: Partial<IntelligenceKpis> = {}): IntelligenceKpis {
  return {
    revenueToday: 1000,
    revenueYesterday: 800,
    revenueChangePct: 25,
    tomorrowWeekday: 3,
    predictedRevenueTomorrow: 900,
    projectedRevenueNext7Days: 6000,
    backorderRatePct: 4.2,
    backorderRisk: { tone: "healthy", label: "Healthy", icon: ShieldCheck },
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

  test("names tomorrow's weekday from its numeric index", () => {
    render(<KpiSection kpis={makeKpis({ tomorrowWeekday: 0 })} />);

    expect(screen.getByText("Your typical sales on Sunday")).toBeTruthy();
  });

  test("shows the backorder risk label and rate", () => {
    render(
      <KpiSection
        kpis={makeKpis({
          backorderRatePct: 22.5,
          backorderRisk: { tone: "critical", label: "Critical", icon: ShieldCheck },
        })}
      />,
    );

    expect(screen.getByText("Critical")).toBeTruthy();
    expect(screen.getByText("BO rate 22.5% this month")).toBeTruthy();
  });

  test("rounds the predicted and projected revenue figures", () => {
    render(
      <KpiSection
        kpis={makeKpis({ predictedRevenueTomorrow: 900.6, projectedRevenueNext7Days: 5999.4 })}
      />,
    );

    expect(screen.getByText("₱901")).toBeTruthy();
    expect(screen.getByText("₱5,999")).toBeTruthy();
  });
});
