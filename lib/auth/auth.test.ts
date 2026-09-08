import { describe, expect, it } from "vitest";

import { isPublicRole } from "./constants";
import { isOnboardingFinished, isProfileCompleted } from "./profile-completed";
import { safeNext, withNext } from "./safe-next";
import { computeTelegramHash, verifyTelegramLogin } from "./telegram";
import { consumeRateLimit, resetRateLimitsForTests } from "./rate-limit";
import { signSession, verifySession } from "./session";
import { isAllowedOrigin } from "@/lib/env";

const TOKEN = "test-bot-token-not-real";

function payload(overrides: Record<string, unknown> = {}) {
  const fields = {
    id: 123456,
    first_name: "Anna",
    username: "anna_master",
    auth_date: 1_700_000_000,
    ...overrides,
  } as {
    id: number;
    first_name: string;
    last_name?: string;
    username?: string;
    photo_url?: string;
    auth_date: number;
  };
  return {
    ...fields,
    hash: computeTelegramHash(fields, TOKEN),
  };
}

describe("safeNext", () => {
  it("keeps internal listing path", () => {
    expect(safeNext("/listings/123")).toBe("/listings/123");
    expect(safeNext("%2Flistings%2F123")).toBe("/listings/123");
  });

  it("rejects external and protocol-relative next", () => {
    expect(safeNext("https://evil.example")).toBe("/");
    expect(safeNext("//evil.example")).toBe("/");
    expect(safeNext("/\\evil.example")).toBe("/");
    expect(safeNext("http://evil.example")).toBe("/");
  });

  it("defaults empty to home", () => {
    expect(safeNext(null)).toBe("/");
    expect(safeNext("")).toBe("/");
  });

  it("preserves next on onboarding links", () => {
    expect(withNext("/onboarding/role", "/listings/abc")).toBe(
      "/onboarding/role?next=%2Flistings%2Fabc",
    );
  });
});

describe("telegram login", () => {
  it("accepts a valid signed payload", () => {
    const result = verifyTelegramLogin({
      payload: payload(),
      botToken: TOKEN,
      nowSeconds: 1_700_000_010,
    });
    expect(result.ok).toBe(true);
  });

  it("rejects an invalid hash", () => {
    const result = verifyTelegramLogin({
      payload: { ...payload(), hash: "0".repeat(64) },
      botToken: TOKEN,
      nowSeconds: 1_700_000_010,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toBe("invalid_hash");
    }
  });

  it("rejects expired auth_date", () => {
    const result = verifyTelegramLogin({
      payload: payload(),
      botToken: TOKEN,
      nowSeconds: 1_700_000_000 + 60 * 60 * 24 + 5,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toBe("expired");
    }
  });

  it("rejects replayed auth_date", () => {
    const result = verifyTelegramLogin({
      payload: payload(),
      botToken: TOKEN,
      nowSeconds: 1_700_000_010,
      lastAuthDate: 1_700_000_000,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toBe("replayed");
    }
  });
});

describe("profile completion and roles", () => {
  it("treats a new user without role as incomplete", () => {
    expect(
      isProfileCompleted({
        role: null,
        displayName: "Anna",
        contactTelegram: "anna_master",
      }),
    ).toBe(false);
  });

  it("does not finish onboarding until the notify step is done", () => {
    expect(
      isOnboardingFinished({
        role: "master",
        displayName: "Anna",
        contactTelegram: "anna",
        onboardingCompleted: false,
      }),
    ).toBe(false);
  });

  it("finishes onboarding after notify when required fields exist", () => {
    expect(
      isOnboardingFinished({
        role: "organizer",
        displayName: "Ivan",
        contactTelegram: "ivan",
        onboardingCompleted: true,
      }),
    ).toBe(true);
  });

  it("does not treat admin as a public role", () => {
    expect(isPublicRole("admin")).toBe(false);
    expect(isPublicRole("master")).toBe(true);
    expect(isPublicRole("space_owner")).toBe(true);
    expect(isPublicRole("organizer")).toBe(true);
  });
});

describe("notifications default", () => {
  it("are off unless explicitly enabled", () => {
    const defaults = {
      notifySpace: false,
      notifyEvent: false,
      notifyVacancy: false,
    };
    expect(defaults).toEqual({
      notifySpace: false,
      notifyEvent: false,
      notifyVacancy: false,
    });
  });
});

describe("session", () => {
  it("round-trips a signed cookie payload", async () => {
    const secret = "x".repeat(32);
    const token = await signSession({ userId: "user-1" }, secret);
    await expect(verifySession(token, secret)).resolves.toEqual({
      userId: "user-1",
    });
    await expect(verifySession(token, "y".repeat(32))).resolves.toBeNull();
  });
});

describe("allowed origin", () => {
  it("accepts the configured app origin", () => {
    const previous = process.env.NEXT_PUBLIC_APP_URL;
    process.env.NEXT_PUBLIC_APP_URL = "https://example-tunnel.lhr.life";
    expect(isAllowedOrigin("https://example-tunnel.lhr.life")).toBe(true);
    expect(isAllowedOrigin("https://evil.example")).toBe(false);
    process.env.NEXT_PUBLIC_APP_URL = previous;
  });
});

describe("auth rate limit", () => {
  it("blocks a burst from the same key", () => {
    resetRateLimitsForTests();
    const now = 1_000;
    expect(
      consumeRateLimit({ key: "ip", limit: 2, windowMs: 1000, now }),
    ).toBe(true);
    expect(
      consumeRateLimit({ key: "ip", limit: 2, windowMs: 1000, now }),
    ).toBe(true);
    expect(
      consumeRateLimit({ key: "ip", limit: 2, windowMs: 1000, now }),
    ).toBe(false);
  });
});
