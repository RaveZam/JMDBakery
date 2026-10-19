import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { BoRateTable } from "../BoRateTable";
import type { BoRateRow } from "../../../helpers/computeBoRateByKey";

describe("BoRateTable", () => {
  test("shows an empty-state message when there are no rows", () => {
    render(
      <BoRateTable
        title="Product bad order rate"
        caption="caption"
        rows={[]}
      />,
    );

    expect(screen.getByText("No data for this period.")).toBeTruthy();
  });

  test("renders each row's key, units, and rate", () => {
    const rows: BoRateRow[] = [
      { key: "Pandesal", sold: 80, bo: 20, boAmount: 200, boRatePct: 20 },
      { key: "Ensaymada", sold: 95, bo: 5, boAmount: 50, boRatePct: 5 },
    ];

    render(
      <BoRateTable
        title="Product bad order rate"
        caption="caption"
        rows={rows}
      />,
    );

    expect(screen.getByText("Pandesal")).toBeTruthy();
    expect(screen.getByText("20.0%")).toBeTruthy();
    expect(screen.getByText(/20 bad of 100 units/)).toBeTruthy();
    expect(screen.getByText("Ensaymada")).toBeTruthy();
    expect(screen.getByText("5.0%")).toBeTruthy();
  });

  test("labels a row at or above the risky threshold as Risky", () => {
    const rows: BoRateRow[] = [
      { key: "Worst", sold: 50, bo: 50, boAmount: 500, boRatePct: 50 },
    ];

    render(<BoRateTable title="t" caption="c" rows={rows} />);

    expect(screen.getByText("Risky")).toBeTruthy();
  });

  test("labels a healthy row as Healthy", () => {
    const rows: BoRateRow[] = [
      { key: "Best", sold: 99, bo: 1, boAmount: 10, boRatePct: 1 },
    ];

    render(<BoRateTable title="t" caption="c" rows={rows} />);

    expect(screen.getByText("Healthy")).toBeTruthy();
  });

  test("renders the title and caption", () => {
    render(<BoRateTable title="My title" caption="My caption" rows={[]} />);

    expect(screen.getByText("My title")).toBeTruthy();
    expect(screen.getByText("My caption")).toBeTruthy();
  });

  test("shows how many pesos the bad orders cost", () => {
    const rows: BoRateRow[] = [
      { key: "Pandesal", sold: 80, bo: 20, boAmount: 1500, boRatePct: 20 },
    ];

    render(<BoRateTable title="t" caption="c" rows={rows} />);

    expect(screen.getByText(/₱1,500 lost/)).toBeTruthy();
  });

  test("flips the order, and flips back, when the flip button is pressed", () => {
    const rows: BoRateRow[] = [
      { key: "Worst", sold: 50, bo: 50, boAmount: 500, boRatePct: 50 },
      { key: "Best", sold: 99, bo: 1, boAmount: 10, boRatePct: 1 },
    ];

    render(<BoRateTable title="t" caption="c" rows={rows} />);
    const firstRowName = () => screen.getAllByRole("listitem")[0].textContent;

    expect(firstRowName()).toContain("Worst");
    fireEvent.click(screen.getByLabelText("Flip order"));
    expect(firstRowName()).toContain("Best");
    fireEvent.click(screen.getByLabelText("Flip order"));
    expect(firstRowName()).toContain("Worst");
  });

  test("shows only five rows, taken from the flipped end when flipped", () => {
    const rows: BoRateRow[] = Array.from({ length: 7 }, (_, index) => ({
      key: `Product ${index}`,
      sold: 100,
      bo: 7 - index,
      boAmount: 0,
      boRatePct: 7 - index,
    }));

    render(<BoRateTable title="t" caption="c" rows={rows} />);
    expect(screen.getAllByRole("listitem")).toHaveLength(5);

    fireEvent.click(screen.getByLabelText("Flip order"));
    expect(screen.getAllByRole("listitem")[0].textContent).toContain(
      "Product 6",
    );
  });
});
