import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { PasswordChecklist } from "../PasswordChecklist";

function ruleItem(label: string): HTMLElement {
  return screen.getByText(label).closest("li") as HTMLElement;
}

describe("PasswordChecklist", () => {
  test("shows every rule as not yet met before anything is typed", () => {
    render(<PasswordChecklist password="" />);

    expect(screen.getAllByText("(not yet)", { exact: false })).toHaveLength(5);
    expect(ruleItem("One number").className).toContain("text-muted-foreground");
  });

  test("marks the rules a partial password meets and the ones it misses", () => {
    render(<PasswordChecklist password="bakery" />);

    expect(ruleItem("One lowercase letter").textContent).toContain("(done)");
    expect(ruleItem("One number").textContent).toContain("(not yet)");
    expect(ruleItem("One number").className).toContain("text-destructive");
  });

  test("marks every rule done for a strong password", () => {
    render(<PasswordChecklist password="Bakery#2026" />);

    expect(screen.getAllByText("(done)", { exact: false })).toHaveLength(5);
  });
});
