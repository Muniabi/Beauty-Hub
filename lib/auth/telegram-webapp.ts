import { createHmac, timingSafeEqual } from "node:crypto";

import { TELEGRAM_AUTH_MAX_AGE_SECONDS } from "@/lib/auth/constants";
import type { TelegramIdentity } from "@/lib/auth/telegram";

export type TelegramWebAppVerifyFailure =
  | "invalid_hash"
  | "expired"
  | "missing_fields"
  | "invalid_user";

export type TelegramWebAppVerifyResult =
  | {
      ok: true;
      identity: TelegramIdentity;
      startParam: string | null;
    }
  | { ok: false; reason: TelegramWebAppVerifyFailure };

const MAX_INIT_DATA_LENGTH = 16384;

function hashesEqual(a: string, b: string): boolean {
  const left = Buffer.from(a, "utf8");
  const right = Buffer.from(b, "utf8");
  if (left.length !== right.length) {
    return false;
  }
  return timingSafeEqual(left, right);
}

export function webAppSecretKey(botToken: string): Buffer {
  return createHmac("sha256", "WebAppData").update(botToken).digest();
}

function parseInitData(raw: string): Record<string, string> {
  const fields: Record<string, string> = {};
  for (const part of raw.split("&")) {
    if (!part) {
      continue;
    }
    const eq = part.indexOf("=");
    if (eq === -1) {
      continue;
    }
    const key = decodeURIComponent(part.slice(0, eq));
    const value = decodeURIComponent(part.slice(eq + 1));
    fields[key] = value;
  }
  return fields;
}

function dataCheckString(
  fields: Record<string, string>,
  exclude: readonly string[],
): string {
  return Object.keys(fields)
    .filter((key) => !exclude.includes(key))
    .sort()
    .map((key) => `${key}=${fields[key]}`)
    .join("\n");
}

export function computeWebAppHash(
  fields: Record<string, string>,
  botToken: string,
  exclude: readonly string[] = ["hash", "signature"],
): string {
  return createHmac("sha256", webAppSecretKey(botToken))
    .update(dataCheckString(fields, exclude))
    .digest("hex");
}

function hashMatches(
  fields: Record<string, string>,
  hash: string,
  botToken: string,
): boolean {
  const variants = [
    computeWebAppHash(fields, botToken, ["hash", "signature"]),
    computeWebAppHash(fields, botToken, ["hash"]),
  ];
  return variants.some((expected) => hashesEqual(expected, hash));
}

export function signWebAppInitData(
  fields: Record<string, string>,
  botToken: string,
): string {
  const hash = computeWebAppHash(fields, botToken);
  const params = new URLSearchParams({ ...fields, hash });
  return params.toString();
}

type WebAppUserFields = {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
};

function parseUser(raw: string): WebAppUserFields | null {
  try {
    const parsed = JSON.parse(raw) as {
      id?: unknown;
      first_name?: unknown;
      last_name?: unknown;
      username?: unknown;
      photo_url?: unknown;
    };
    if (
      typeof parsed.id !== "number" ||
      !Number.isInteger(parsed.id) ||
      parsed.id <= 0 ||
      typeof parsed.first_name !== "string" ||
      parsed.first_name.length === 0 ||
      parsed.first_name.length > 128
    ) {
      return null;
    }
    return {
      id: parsed.id,
      first_name: parsed.first_name,
      ...(typeof parsed.last_name === "string" && parsed.last_name
        ? { last_name: parsed.last_name.slice(0, 128) }
        : {}),
      ...(typeof parsed.username === "string" && parsed.username
        ? { username: parsed.username.slice(0, 64) }
        : {}),
      ...(typeof parsed.photo_url === "string" && parsed.photo_url
        ? { photo_url: parsed.photo_url.slice(0, 500) }
        : {}),
    };
  } catch {
    return null;
  }
}

export function verifyTelegramWebAppInitData(input: {
  initData: string;
  botToken: string;
  nowSeconds?: number;
  maxAgeSeconds?: number;
}): TelegramWebAppVerifyResult {
  const raw = input.initData.trim();
  if (!raw || raw.length > MAX_INIT_DATA_LENGTH) {
    return { ok: false, reason: "missing_fields" };
  }

  const params = parseInitData(raw);
  const hash = params.hash;
  if (!hash) {
    return { ok: false, reason: "missing_fields" };
  }

  const fields = { ...params };
  delete fields.hash;

  if (!hashMatches(fields, hash, input.botToken)) {
    return { ok: false, reason: "invalid_hash" };
  }

  const authDateRaw = fields.auth_date;
  const userRaw = fields.user;
  if (!authDateRaw || !userRaw) {
    return { ok: false, reason: "missing_fields" };
  }

  const authDate = Number(authDateRaw);
  if (!Number.isFinite(authDate) || !Number.isInteger(authDate)) {
    return { ok: false, reason: "missing_fields" };
  }

  const now = input.nowSeconds ?? Math.floor(Date.now() / 1000);
  const maxAge = input.maxAgeSeconds ?? TELEGRAM_AUTH_MAX_AGE_SECONDS;
  if (now - authDate > maxAge || authDate > now + 60) {
    return { ok: false, reason: "expired" };
  }

  const user = parseUser(userRaw);
  if (!user) {
    return { ok: false, reason: "invalid_user" };
  }

  const startParam = fields.start_param?.trim() || null;

  return {
    ok: true,
    identity: {
      ...user,
      auth_date: authDate,
    },
    startParam,
  };
}
