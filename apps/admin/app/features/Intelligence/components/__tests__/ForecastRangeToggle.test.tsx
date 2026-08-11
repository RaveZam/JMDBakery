import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { ForecastRangeToggle } from "../ForecastRangeToggle";

describe("ForecastRangeToggle", () => {
  test("renders all three range options", () => {
    render(<ForecastRangeToggle range="weekly" onChange={vi.fn()} />);

    expect(screen.getByText("Weekly")).toBeTruthy();
    expect(screen.getByText("Monthly")).toBeTruthy();
    expect(screen.getByText("Yearly")).toBeTruthy();
  });

  test("highlights the currently active range", () => {
    render(<ForecastRangeToggle range="monthly" onChange={vi.fn()} />);

    expect(screen.getByText("Monthly").className).toContain("text-white");
    expect(screen.getByText("Weekly").className).not.toContain("text-white");
  });

  test("calls onChange with the pressed range", () => {
    const onChange = vi.fn();
    render(<ForecastRangeToggle range="weekly" onChange={onChange} />);

    fireEvent.click(screen.getByText("Yearly"));

    expect(onChange).toHaveBeenCalledWith("yearly");
  });

  test("does not call onChange until a button is pressed", () => {
    const onChange = vi.fn();
    render(<ForecastRangeToggle range="weekly" onChange={onChange} />);

    expect(onChange).not.toHaveBeenCalled();
  });
});
