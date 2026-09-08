import { createHmac } from "node:crypto";

import { afterAll, describe, expect, it } from "vitest";

import { telegramAuthRedirect } from "./redirect";
import {
  compactListingStartParam,
  parseTelegramStartParam,
  resolveTelegramNext,
} from "./start-param";
import { signSession, verifySession } from "./session";
import {
  computeWebAppHash,
  signWebAppInitData,
  verifyTelegramWebAppInitData,
} from "./telegram-webapp";
import { upsertTelegramUser } from "./upsert-user";
import { isMongoConfigured } from "@/lib/db/mongo";
import { findUserByTelegramId } from "@/lib/db/users";

const TOKEN = "test-webapp-bot-token-not-real";
const AUTH_DATE = 1_700_000_000;

function userJson(overrides: Record<string, unknown> = {}) {
  return JSON.stringify({
    id: 123456,
    first_name: "Anna",
    username: "anna_master",
    ...overrides,
  });
}

function initData(overrides: Record<string, string> = {}) {
  return signWebAppInitData(
    {
      auth_date: String(AUTH_DATE),
      query_id: "AAEtestquery",
      user: userJson(),
      ...overrides,
    },
    TOKEN,
  );
}

describe("telegram webapp initData", () => {
  it("accepts a published Telegram HMAC vector", () => {
    const result = verifyTelegramWebAppInitData({
      initData:
        "query_id=AAHdF6IQAAAAAN0XohDhrOrc&user=%7B%22id%22%3A279058397%2C%22first_name%22%3A%22Vladislav%22%2C%22last_name%22%3A%22Kibenko%22%2C%22username%22%3A%22vdkfrost%22%2C%22language_code%22%3A%22ru%22%2C%22is_premium%22%3Atrue%7D&auth_date=1662771648&hash=c501b71e775f74ce10e377dea85a7ea24ecd640b223ea86dfe453e0eaed2e2b2",
      botToken: "5768337691:AAH5YkoiEuPk8-FZa32hStHTqXiLPtAEhx8",
      nowSeconds: 1_662_771_648 + 60,
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.identity.id).toBe(279058397);
      expect(result.identity.username).toBe("vdkfrost");
    }
  });
  it("accepts a valid signed initData", () => {
    const result = verifyTelegramWebAppInitData({
      initData: initData(),
      botToken: TOKEN,
      nowSeconds: AUTH_DATE + 10,
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.identity.id).toBe(123456);
      expect(result.identity.first_name).toBe("Anna");
      expect(result.identity.username).toBe("anna_master");
      expect(result.identity.auth_date).toBe(AUTH_DATE);
    }
  });

  it("rejects an invalid hash", () => {
    const signed = initData();
    const tampered = signed.replace(/hash=[0-9a-f]+/i, `hash=${"0".repeat(64)}`);
    const result = verifyTelegramWebAppInitData({
      initData: tampered,
      botToken: TOKEN,
      nowSeconds: AUTH_DATE + 10,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toBe("invalid_hash");
    }
  });

  it("rejects expired auth_date", () => {
    const result = verifyTelegramWebAppInitData({
      initData: initData(),
      botToken: TOKEN,
      nowSeconds: AUTH_DATE + 60 * 60 * 24 + 5,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toBe("expired");
    }
  });

  it("rejects tampered user data", () => {
    const valid = initData();
    const params = new URLSearchParams(valid);
    params.set(
      "user",
      userJson({ id: 999999, first_name: "Attacker" }),
    );
    const result = verifyTelegramWebAppInitData({
      initData: params.toString(),
      botToken: TOKEN,
      nowSeconds: AUTH_DATE + 10,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toBe("invalid_hash");
    }
  });

  it("rejects missing required fields", () => {
    const withoutUser = signWebAppInitData(
      { auth_date: String(AUTH_DATE), query_id: "x" },
      TOKEN,
    );
    expect(
      verifyTelegramWebAppInitData({
        initData: withoutUser,
        botToken: TOKEN,
        nowSeconds: AUTH_DATE + 10,
      }),
    ).toEqual({ ok: false, reason: "missing_fields" });

    expect(
      verifyTelegramWebAppInitData({
        initData: "",
        botToken: TOKEN,
        nowSeconds: AUTH_DATE + 10,
      }),
    ).toEqual({ ok: false, reason: "missing_fields" });

    const fields = {
      auth_date: String(AUTH_DATE),
      user: userJson(),
    };
    const unsigned = new URLSearchParams(fields).toString();
    expect(
      verifyTelegramWebAppInitData({
        initData: unsigned,
        botToken: TOKEN,
        nowSeconds: AUTH_DATE + 10,
      }).ok,
    ).toBe(false);

    const badUser = signWebAppInitData(
      {
        auth_date: String(AUTH_DATE),
        user: JSON.stringify({ id: 0, first_name: "Anna" }),
      },
      TOKEN,
    );
    expect(
      verifyTelegramWebAppInitData({
        initData: badUser,
        botToken: TOKEN,
        nowSeconds: AUTH_DATE + 10,
      }),
    ).toEqual({ ok: false, reason: "invalid_user" });
  });

  it("uses WebAppData HMAC, not the Login Widget secret", () => {
    const fields = {
      auth_date: String(AUTH_DATE),
      user: userJson(),
    };
    const widgetSecret = createHmac("sha256", TOKEN).digest();
    const widgetHash = createHmac("sha256", widgetSecret)
      .update(
        Object.keys(fields)
          .sort()
          .map((key) => `${key}=${fields[key as keyof typeof fields]}`)
          .join("\n"),
      )
      .digest("hex");
    const spoofed = new URLSearchParams({ ...fields, hash: widgetHash }).toString();
    const result = verifyTelegramWebAppInitData({
      initData: spoofed,
      botToken: TOKEN,
      nowSeconds: AUTH_DATE + 10,
    });
    expect(result.ok).toBe(false);
    expect(computeWebAppHash(fields, TOKEN)).not.toBe(widgetHash);
  });

  it("reads start_param from signed initData", () => {
    const listingId = "11111111-2222-3333-4444-555555555555";
    const result = verifyTelegramWebAppInitData({
      initData: initData({
        start_param: compactListingStartParam(listingId),
      }),
      botToken: TOKEN,
      nowSeconds: AUTH_DATE + 10,
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.startParam).toBe(compactListingStartParam(listingId));
      expect(resolveTelegramNext({ startParam: result.startParam })).toBe(
        `/listings/${listingId}`,
      );
    }
  });
});

describe("telegram start param", () => {
  it("maps compact listing ids and known screens", () => {
    expect(
      parseTelegramStartParam("l_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"),
    ).toBe("/listings/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa");
    expect(parseTelegramStartParam("profile")).toBe("/profile");
    expect(parseTelegramStartParam("search")).toBe("/search");
    expect(parseTelegramStartParam("create")).toBe("/create");
    expect(parseTelegramStartParam("../etc/passwd")).toBe("/");
    expect(parseTelegramStartParam("/listings/x")).toBe("/");
  });

  it("prefers signed start_param over client next", () => {
    expect(
      resolveTelegramNext({
        startParam: "profile",
        next: "/search",
      }),
    ).toBe("/profile");
    expect(
      resolveTelegramNext({
        startParam: null,
        next: "/search",
      }),
    ).toBe("/search");
    expect(
      resolveTelegramNext({
        startParam: null,
        next: "create",
      }),
    ).toBe("/create");
  });
});

describe("telegram auth redirect and session", () => {
  it("sends incomplete profiles to onboarding and keeps next", () => {
    expect(telegramAuthRedirect(false, "/listings/abc")).toBe(
      "/onboarding/role?next=%2Flistings%2Fabc",
    );
    expect(telegramAuthRedirect(true, "/profile")).toBe("/profile");
  });

  it("creates the same session payload as E2", async () => {
    const secret = "z".repeat(32);
    const token = await signSession({ userId: "user-webapp" }, secret);
    await expect(verifySession(token, secret)).resolves.toEqual({
      userId: "user-webapp",
    });
  });
});

const mongo = isMongoConfigured();

describe.skipIf(!mongo)("telegram webapp user identity", () => {
  const createdUserIds: string[] = [];

  afterAll(async () => {
    if (!mongo) {
      return;
    }
    if (createdUserIds.length) {
      const { usersCollection } = await import("@/lib/db/mongo");
      await (await usersCollection()).deleteMany({ _id: { $in: createdUserIds } });
    }
  });

  it("reuses the existing Telegram user instead of creating a duplicate", async () => {
    const telegramUserId = 9_000_000 + Math.floor(Math.random() * 1_000_000);
    const first = await upsertTelegramUser({
      id: telegramUserId,
      first_name: "Anna",
      username: "anna_master",
      auth_date: AUTH_DATE,
    });
    createdUserIds.push(first.userId);
    const second = await upsertTelegramUser({
      id: telegramUserId,
      first_name: "Anna",
      username: "anna_master",
      auth_date: AUTH_DATE + 10,
    });
    expect(second.userId).toBe(first.userId);
    expect(second.isNew).toBe(false);
    const found = await findUserByTelegramId(telegramUserId);
    expect(found?._id).toBe(first.userId);
  });
});
