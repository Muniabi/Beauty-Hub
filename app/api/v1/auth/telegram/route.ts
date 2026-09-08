import { z } from "zod";

import {
  AUTH_RATE_LIMIT_MAX,
  AUTH_RATE_LIMIT_WINDOW_MS,
} from "@/lib/auth/constants";
import { consumeRateLimit } from "@/lib/auth/rate-limit";
import { safeNext } from "@/lib/auth/safe-next";
import { verifyTelegramLogin } from "@/lib/auth/telegram";
import { getLastAuthDate, upsertTelegramUser } from "@/lib/auth/upsert-user";
import { telegramAuthRedirect } from "@/lib/auth/redirect";
import { setSessionCookie } from "@/lib/auth/current-user";
import { getTelegramBotToken, isAllowedOrigin } from "@/lib/env";

const payloadSchema = z.object({
  id: z.coerce.number().int().positive(),
  first_name: z.string().min(1).max(128),
  last_name: z.string().max(128).optional(),
  username: z.string().max(64).optional(),
  photo_url: z.string().max(500).optional(),
  auth_date: z.coerce.number().int(),
  hash: z.string().min(32).max(128),
  next: z.string().max(500).optional(),
});

function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }
  return request.headers.get("x-real-ip") ?? "unknown";
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && !isAllowedOrigin(origin)) {
    return Response.json(
      { error: { code: "FORBIDDEN", message: "Недопустимый origin" } },
      { status: 403 },
    );
  }

  if (
    !consumeRateLimit({
      key: `auth:${clientIp(request)}`,
      limit: AUTH_RATE_LIMIT_MAX,
      windowMs: AUTH_RATE_LIMIT_WINDOW_MS,
    })
  ) {
    return Response.json(
      { error: { code: "RATE_LIMIT", message: "Слишком много запросов. Подождите." } },
      { status: 429 },
    );
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return Response.json(
      { error: { code: "VALIDATION", message: "Некорректный запрос" } },
      { status: 400 },
    );
  }

  const parsed = payloadSchema.safeParse(json);
  if (!parsed.success) {
    return Response.json(
      { error: { code: "VALIDATION", message: "Некорректные данные входа" } },
      { status: 400 },
    );
  }

  const { next: rawNext, ...telegramFields } = parsed.data;
  const next = safeNext(rawNext);

  let lastAuthDate: number | null = null;
  try {
    lastAuthDate = await getLastAuthDate(BigInt(telegramFields.id));
  } catch {
    console.error("telegram_login lookup_failed");
    return Response.json(
      { error: { code: "SERVER", message: "Не получилось войти. Попробуйте ещё раз." } },
      { status: 500 },
    );
  }

  let botToken: string;
  try {
    botToken = getTelegramBotToken();
  } catch {
    console.error("telegram_login missing_bot_token");
    return Response.json(
      { error: { code: "SERVER", message: "Не получилось войти. Попробуйте ещё раз." } },
      { status: 500 },
    );
  }

  const verified = verifyTelegramLogin({
    payload: telegramFields,
    botToken,
    lastAuthDate,
  });

  if (!verified.ok) {
    return Response.json(
      { error: { code: "UNAUTHORIZED", message: "Не получилось войти. Попробуйте ещё раз." } },
      { status: 401 },
    );
  }

  try {
    const result = await upsertTelegramUser(verified.payload);
    await setSessionCookie(result.userId);
    return Response.json({
      profile_completed: result.profileCompleted,
      next,
      redirect: telegramAuthRedirect(result.profileCompleted, next),
    });
  } catch (error) {
    if (error instanceof Error && error.message === "BLOCKED") {
      return Response.json(
        { error: { code: "FORBIDDEN", message: "Аккаунт заблокирован" } },
        { status: 403 },
      );
    }
    console.error("telegram_login upsert_failed");
    return Response.json(
      { error: { code: "SERVER", message: "Не получилось войти. Попробуйте ещё раз." } },
      { status: 500 },
    );
  }
}

export const runtime = "nodejs";
