import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { BoReasonTable } from "../BoReasonTable";
import type { BoReasonRow } from "../../../helpers/computeBoReasonRanking";

describe("BoReasonTable", () => {
  test("shows an empty-state message when there are no rows", () => {
    render(<BoReasonTable rows={[]} />);

    expect(screen.getByText("No data for this period.")).toBeTruthy();
  });

  test("renders each reason's share and unit count", () => {
    const rows: BoReasonRow[] = [
      { reason: "Rotten", bo: 15, boAmount: 150, sharePct: 75 },
      { reason: "Damaged", bo: 5, boAmount: 50, sharePct: 25 },
    ];

    render(<BoReasonTable rows={rows} />);

    expect(screen.getByText("Rotten")).toBeTruthy();
    expect(screen.getByText("75.0%")).toBeTruthy();
    expect(screen.getByText(/15 units/)).toBeTruthy();
    expect(screen.getByText(/₱150 lost/)).toBeTruthy();
    expect(screen.getByText("Damaged")).toBeTruthy();
    expect(screen.getByText("25.0%")).toBeTruthy();
  });

  test("renders its fixed title and caption", () => {
    render(<BoReasonTable rows={[]} />);

    expect(screen.getByText("Bad order reasons")).toBeTruthy();
    expect(
      screen.getByText("Units lost by reason, biggest cause first"),
    ).toBeTruthy();
  });

  test("flips the order when the flip button is pressed", () => {
    const rows: BoReasonRow[] = [
      { reason: "Rotten", bo: 15, boAmount: 150, sharePct: 75 },
      { reason: "Damaged", bo: 5, boAmount: 50, sharePct: 25 },
    ];

    render(<BoReasonTable rows={rows} />);
    fireEvent.click(screen.getByLabelText("Flip order"));

    expect(screen.getAllByRole("listitem")[0].textContent).toContain("Damaged");
  });
});
