import {
  resolveAuthRedirect,
  GRACE_WINDOW_DAYS,
  type AuthGateInput,
} from "@/src/features/auth/core/resolveAuthRedirect";

const NOW = new Date("2026-06-30T08:00:00.000Z");

function daysBefore(days: number): string {
  return new Date(NOW.getTime() - days * 24 * 60 * 60 * 1000).toISOString();
}

/** A signed-in agent online on a normal screen — each test overrides what it's about. */
function gate(overrides: Partial<AuthGateInput> = {}): AuthGateInput {
  return {
    hasSession: true,
    onAuthRoute: false,
    online: true,
    lastVerifiedAt: daysBefore(0),
    now: NOW,
    ...overrides,
  };
}

describe("with a live session", () => {
  test("leaves the agent where they are", () => {
    expect(resolveAuthRedirect(gate())).toBeNull();
  });

  test("pulls them off the sign-in screen", () => {
    expect(resolveAuthRedirect(gate({ onAuthRoute: true }))).toBe("/");
  });
});

describe("no session, but we can reach the network", () => {
  // Connectivity means we got a real answer: they are signed out. Stored trust
  // doesn't apply, however recent it is.
  test("sends them to sign in even with fresh trust", () => {
    expect(
      resolveAuthRedirect(
        gate({ hasSession: false, lastVerifiedAt: daysBefore(0) }),
      ),
    ).toBe("/auth/sign-in");
  });

  test("leaves them on the sign-in screen rather than looping", () => {
    expect(
      resolveAuthRedirect(gate({ hasSession: false, onAuthRoute: true })),
    ).toBeNull();
  });
});

const offline = { hasSession: false, online: false };

describe("no session and no network", () => {
  // The bug this was written for: a fresh install with wifi off used to sail
  // past the guard onto the route screen.
  test("a device that has never signed in goes to sign in", () => {
    expect(
      resolveAuthRedirect(gate({ ...offline, lastVerifiedAt: null })),
    ).toBe("/auth/sign-in");
  });

  // The case the grace window exists for: token expired mid-route, no wifi to
  // refresh it. Locking them out here would cost them the day's work.
  test("a recently verified device carries on", () => {
    expect(
      resolveAuthRedirect(gate({ ...offline, lastVerifiedAt: daysBefore(1) })),
    ).toBeNull();
  });

  test("a device trusted past the window goes to sign in", () => {
    expect(
      resolveAuthRedirect(
        gate({ ...offline, lastVerifiedAt: daysBefore(GRACE_WINDOW_DAYS + 1) }),
      ),
    ).toBe("/auth/sign-in");
  });
});

describe("edges of the grace window", () => {
  test("the window is closed exactly on the boundary", () => {
    expect(
      resolveAuthRedirect(
        gate({ ...offline, lastVerifiedAt: daysBefore(GRACE_WINDOW_DAYS) }),
      ),
    ).toBe("/auth/sign-in");
  });

  test("a moment inside the boundary still passes", () => {
    const justInside = new Date(
      NOW.getTime() - GRACE_WINDOW_DAYS * 24 * 60 * 60 * 1000 + 1000,
    ).toISOString();

    expect(
      resolveAuthRedirect(gate({ ...offline, lastVerifiedAt: justInside })),
    ).toBeNull();
  });

  // Otherwise an offline agent lands on a sign-in screen whose button is
  // disabled for lack of connectivity — nothing they can do.
  test("a trusted device is pulled off the sign-in screen too", () => {
    expect(
      resolveAuthRedirect(
        gate({ ...offline, onAuthRoute: true, lastVerifiedAt: daysBefore(1) }),
      ),
    ).toBe("/");
  });
});

describe("a lastVerifiedAt we can't take at face value", () => {
  // The device clock moved backwards. Whoever holds the phone can set the
  // clock anyway, so we don't expire the window early over it.
  test("a timestamp in the future is treated as trusted", () => {
    expect(
      resolveAuthRedirect(gate({ ...offline, lastVerifiedAt: daysBefore(-1) })),
    ).toBeNull();
  });

  test("an unparseable timestamp is not trusted", () => {
    expect(
      resolveAuthRedirect(gate({ ...offline, lastVerifiedAt: "not-a-date" })),
    ).toBe("/auth/sign-in");
  });
});
