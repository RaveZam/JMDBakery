import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { ProductionRecommendationRow } from "../ProductionRecommendationRow";
import type { ProductionRecommendation } from "../../helpers/computeProductionRecommendations";

function makeRec(overrides: Partial<ProductionRecommendation> = {}): ProductionRecommendation {
  return {
    product: "Pandesal",
    totalSold: 300,
    avgSoldPerDay: 10,
    avgBadOrderPerDay: 0,
    recommended: 10,
    ...overrides,
  };
}

function renderRow(rec: ProductionRecommendation) {
  return render(
    <table>
      <tbody>
        <ProductionRecommendationRow rec={rec} />
      </tbody>
    </table>,
  );
}

describe("ProductionRecommendationRow", () => {
  test("shows the product name, totals, and recommended batch", () => {
    renderRow(makeRec({ product: "Ensaymada", totalSold: 300, avgSoldPerDay: 10, recommended: 10 }));

    expect(screen.getByText("Ensaymada")).toBeTruthy();
    expect(screen.getByText("300")).toBeTruthy();
    expect(screen.getByText("10.0")).toBeTruthy();
    expect(screen.getByText("10")).toBeTruthy();
    expect(screen.getByText("units")).toBeTruthy();
  });

  test("highlights bad orders when the average is above zero", () => {
    renderRow(makeRec({ avgBadOrderPerDay: 2.5 }));

    expect(screen.getByText("2.5")).toBeTruthy();
  });

  test("shows a plain 0.0 for bad orders when there are none", () => {
    renderRow(makeRec({ avgBadOrderPerDay: 0 }));

    const zeroCells = screen.getAllByText("0.0");
    expect(zeroCells.length).toBeGreaterThan(0);
  });
});
