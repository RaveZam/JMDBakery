import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { BoRateTable } from "../BoRateTable";
import type { BoRateRow } from "../../helpers/computeBoRateByKey";

describe("BoRateTable", () => {
  test("shows an empty-state message when there are no rows", () => {
    render(<BoRateTable title="Product bad order rate" caption="caption" rows={[]} />);

    expect(screen.getByText("No data for this period.")).toBeTruthy();
  });

  test("renders each row's key, units, and rate", () => {
    const rows: BoRateRow[] = [
      { key: "Pandesal", sold: 80, bo: 20, boRatePct: 20 },
      { key: "Ensaymada", sold: 95, bo: 5, boRatePct: 5 },
    ];

    render(<BoRateTable title="Product bad order rate" caption="caption" rows={rows} />);

    expect(screen.getByText("Pandesal")).toBeTruthy();
    expect(screen.getByText("20.0%")).toBeTruthy();
    expect(screen.getByText("20 bad of 100 units")).toBeTruthy();
    expect(screen.getByText("Ensaymada")).toBeTruthy();
    expect(screen.getByText("5.0%")).toBeTruthy();
  });

  test("labels a row at or above the critical threshold as Critical", () => {
    const rows: BoRateRow[] = [{ key: "Worst", sold: 50, bo: 50, boRatePct: 50 }];

    render(<BoRateTable title="t" caption="c" rows={rows} />);

    expect(screen.getByText("Critical")).toBeTruthy();
  });

  test("labels a healthy row as Healthy", () => {
    const rows: BoRateRow[] = [{ key: "Best", sold: 99, bo: 1, boRatePct: 1 }];

    render(<BoRateTable title="t" caption="c" rows={rows} />);

    expect(screen.getByText("Healthy")).toBeTruthy();
  });

  test("renders the title and caption", () => {
    render(<BoRateTable title="My title" caption="My caption" rows={[]} />);

    expect(screen.getByText("My title")).toBeTruthy();
    expect(screen.getByText("My caption")).toBeTruthy();
  });
});
