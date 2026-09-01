import { manilaTimestamp } from "@/src/shared/helpers/manilaTimestamp";

// Every assertion pins a real instant so the expected Manila wall clock is
// something we can work out by hand: Manila is UTC+8 and never has DST.
function atUtc(iso: string): number {
  return Date.parse(iso);
}

describe("manilaTimestamp", () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  it("returns the Manila wall clock for the current instant", () => {
    // 02:18 UTC is 10:18 in Manila on the same day.
    jest.useFakeTimers().setSystemTime(atUtc("2026-09-01T02:18:30.500Z"));

    expect(manilaTimestamp()).toBe("2026-09-01T10:18:30.500");
  });

  it("rolls into the next Manila day when UTC is still on the previous one", () => {
    // 23:30 UTC on Aug 31 is already 07:30 on Sep 1 in Manila.
    jest.useFakeTimers().setSystemTime(atUtc("2026-08-31T23:30:00.000Z"));

    expect(manilaTimestamp()).toBe("2026-09-01T07:30:00.000");
  });

  it("keeps midnight Manila on the correct day", () => {
    jest.useFakeTimers().setSystemTime(atUtc("2026-08-31T16:00:00.000Z"));

    expect(manilaTimestamp()).toBe("2026-09-01T00:00:00.000");
  });

  it("does not carry a timezone suffix", () => {
    jest.useFakeTimers().setSystemTime(atUtc("2026-09-01T02:18:30.500Z"));

    expect(manilaTimestamp()).not.toMatch(/[Zz+]/);
  });
});

describe("manilaTimestamp across device timezones", () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  it("gives the same answer whatever timezone the device is set to", () => {
    jest.useFakeTimers().setSystemTime(atUtc("2026-09-01T02:18:30.500Z"));
    const fromManilaDevice = manilaTimestamp();

    // The old helper shifted the instant and then serialised it, so a device
    // on another timezone produced a different answer. This one must not.
    const originalTimezone = process.env.TZ;
    process.env.TZ = "America/Los_Angeles";
    try {
      expect(manilaTimestamp()).toBe(fromManilaDevice);
    } finally {
      process.env.TZ = originalTimezone;
    }
  });
});
