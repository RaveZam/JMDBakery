import { manilaDateKey } from "@/src/shared/helpers/manilaDateKey";

describe("manilaDateKey", () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  it("returns the Manila calendar day for the current instant", () => {
    jest.useFakeTimers().setSystemTime(Date.parse("2026-09-01T02:18:30.500Z"));

    expect(manilaDateKey()).toBe("2026-09-01");
  });

  it("is already on the next day when UTC has not turned over yet", () => {
    // A route started at 7:30am Manila on Sep 1 is still Aug 31 in UTC.
    jest.useFakeTimers().setSystemTime(Date.parse("2026-08-31T23:30:00.000Z"));

    expect(manilaDateKey()).toBe("2026-09-01");
  });

  it("stays on the current day right before Manila midnight", () => {
    jest.useFakeTimers().setSystemTime(Date.parse("2026-08-31T15:59:59.999Z"));

    expect(manilaDateKey()).toBe("2026-08-31");
  });
});
