import { createHmac, createHash, timingSafeEqual } from "node:crypto";

import { TELEGRAM_AUTH_MAX_AGE_SECONDS } from "@/lib/auth/constants";

export type TelegramIdentity = {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
};

export type TelegramLoginPayload = TelegramIdentity & {
  hash: string;
};

export type TelegramVerifyFailure =
  | "invalid_hash"
  | "expired"
  | "replayed";

export type TelegramVerifyResult =
  | { ok: true; payload: TelegramLoginPayload }
  | { ok: false; reason: TelegramVerifyFailure };

function dataCheckString(payload: Omit<TelegramLoginPayload, "hash">): string {
  return Object.entries(payload)
    .filter(([, value]) => value !== undefined && value !== "")
    .map(([key, value]) => `${key}=${value}`)
    .sort(([a], [b]) => a.localeCompare(b))
    .join("\n");
}

export function computeTelegramHash(
  payload: Omit<TelegramLoginPayload, "hash">,
  botToken: string,
): string {
  const secret = createHash("sha256").update(botToken).digest();
  return createHmac("sha256", secret)
    .update(dataCheckString(payload))
    .digest("hex");
}

function hashesEqual(a: string, b: string): boolean {
  const left = Buffer.from(a, "utf8");
  const right = Buffer.from(b, "utf8");
  if (left.length !== right.length) {
    return false;
  }
  return timingSafeEqual(left, right);
}

export function verifyTelegramLogin(input: {
  payload: TelegramLoginPayload;
  botToken: string;
  nowSeconds?: number;
  lastAuthDate?: number | null;
  maxAgeSeconds?: number;
}): TelegramVerifyResult {
  const now = input.nowSeconds ?? Math.floor(Date.now() / 1000);
  const maxAge = input.maxAgeSeconds ?? TELEGRAM_AUTH_MAX_AGE_SECONDS;
  const { hash, ...fields } = input.payload;

  const expected = computeTelegramHash(fields, input.botToken);
  if (!hashesEqual(expected, hash)) {
    return { ok: false, reason: "invalid_hash" };
  }

  if (!Number.isFinite(fields.auth_date) || now - fields.auth_date > maxAge) {
    return { ok: false, reason: "expired" };
  }

  if (fields.auth_date > now + 60) {
    return { ok: false, reason: "expired" };
  }

  if (
    input.lastAuthDate != null &&
    fields.auth_date <= input.lastAuthDate
  ) {
    return { ok: false, reason: "replayed" };
  }

  return { ok: true, payload: input.payload };
}

export function telegramContactHandle(username?: string | null): string {
  if (!username) {
    return "";
  }
  return username.replace(/^@/, "");
}
