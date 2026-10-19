import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { ForecastTooltip } from "../ForecastTooltip";

function makeEntry(overrides: Record<string, unknown> = {}) {
  return {
    dataKey: "actual",
    name: "Actual",
    value: 1500,
    color: "#10b981",
    payload: { isSeam: false },
    ...overrides,
  };
}

describe("ForecastTooltip", () => {
  test("renders nothing when inactive", () => {
    const { container } = render(
      <ForecastTooltip active={false} payload={[makeEntry()]} label="Mon" />,
    );

    expect(container.firstChild).toBeNull();
  });

  test("renders nothing with an empty payload", () => {
    const { container } = render(
      <ForecastTooltip active payload={[]} label="Mon" />,
    );

    expect(container.firstChild).toBeNull();
  });

  test("shows the label and a peso-formatted value per entry", () => {
    render(
      <ForecastTooltip
        active
        payload={[makeEntry({ value: 1234.5 })]}
        label="Mon"
      />,
    );

    expect(screen.getByText("Mon")).toBeTruthy();
    expect(screen.getByText("Actual: ₱1,235")).toBeTruthy();
  });

  test("hides the duplicated forecast entry on a bridged seam point", () => {
    const seamPayload = [
      makeEntry({
        dataKey: "actual",
        name: "Actual",
        value: 500,
        payload: { isSeam: true },
      }),
      makeEntry({
        dataKey: "forecast",
        name: "Forecast",
        value: 500,
        payload: { isSeam: true },
      }),
    ];

    render(<ForecastTooltip active payload={seamPayload} label="Mon" />);

    expect(screen.getByText("Actual: ₱500")).toBeTruthy();
    expect(screen.queryByText("Forecast: ₱500")).toBeNull();
  });

  test("shows both entries on a non-seam point with actual and forecast", () => {
    const payload = [
      makeEntry({ dataKey: "actual", name: "Actual", value: 500 }),
      makeEntry({ dataKey: "forecast", name: "Forecast", value: 600 }),
    ];

    render(<ForecastTooltip active payload={payload} label="Mon" />);

    expect(screen.getByText("Actual: ₱500")).toBeTruthy();
    expect(screen.getByText("Forecast: ₱600")).toBeTruthy();
  });

  test("adds the piece count next to the peso amount on actual lines", () => {
    const payload = [
      makeEntry({
        dataKey: "salesAmount",
        name: "Sales",
        value: 1000,
        payload: { salesUnits: 1250 },
      }),
      makeEntry({
        dataKey: "boAmount",
        name: "BO",
        value: 200,
        payload: { boUnits: 8 },
      }),
    ];

    render(<ForecastTooltip active payload={payload} label="Mon" />);

    expect(screen.getByText("Sales: ₱1,000 · 1,250 pieces")).toBeTruthy();
    expect(screen.getByText("BO: ₱200 · 8 pieces")).toBeTruthy();
  });
});
