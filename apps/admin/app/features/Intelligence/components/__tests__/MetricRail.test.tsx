import { render } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { MetricRail } from "../MetricRail";

function fillWidth(container: HTMLElement): string {
  return (container.querySelector("div > div > div") as HTMLElement).style.width;
}

describe("MetricRail", () => {
  test("fills proportionally to the given fraction", () => {
    const { container } = render(<MetricRail fraction={0.5} fillClass="bg-primary" />);

    expect(fillWidth(container)).toBe("50%");
  });

  test("clamps a fraction above 1 down to a full bar", () => {
    const { container } = render(<MetricRail fraction={2} fillClass="bg-primary" />);

    expect(fillWidth(container)).toBe("100%");
  });

  test("clamps a negative fraction up to empty", () => {
    const { container } = render(<MetricRail fraction={-1} fillClass="bg-primary" />);

    expect(fillWidth(container)).toBe("2%"); // floored to the minimum visible sliver
  });

  test("keeps a tiny nonzero fraction visible with a minimum width", () => {
    const { container } = render(<MetricRail fraction={0.001} fillClass="bg-primary" />);

    expect(fillWidth(container)).toBe("2%");
  });

  test("applies the given fill class", () => {
    const { container } = render(<MetricRail fraction={0.5} fillClass="bg-destructive" />);

    expect(container.querySelector(".bg-destructive")).toBeTruthy();
  });
});
