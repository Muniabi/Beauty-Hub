import { z } from "zod";

import {
  AUTH_RATE_LIMIT_MAX,
  AUTH_RATE_LIMIT_WINDOW_MS,
} from "@/lib/auth/constants";
import { consumeRateLimit } from "@/lib/auth/rate-limit";
import { telegramAuthRedirect } from "@/lib/auth/redirect";
import { resolveTelegramNext } from "@/lib/auth/start-param";
import { verifyTelegramWebAppInitData } from "@/lib/auth/telegram-webapp";
import { upsertTelegramUser } from "@/lib/auth/upsert-user";
import { setSessionCookie } from "@/lib/auth/current-user";
import { getTelegramBotToken, isAllowedOrigin } from "@/lib/env";

const payloadSchema = z.object({
  initData: z.string().min(1).max(16384),
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
    console.error("telegram_webapp origin_rejected");
    return Response.json(
      { error: { code: "FORBIDDEN", message: "Недопустимый origin" } },
      { status: 403 },
    );
  }

  if (
    !consumeRateLimit({
      key: `auth:webapp:${clientIp(request)}`,
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

  let botToken: string;
  try {
    botToken = getTelegramBotToken();
  } catch {
    console.error("telegram_webapp missing_bot_token");
    return Response.json(
      { error: { code: "SERVER", message: "Не получилось войти. Попробуйте ещё раз." } },
      { status: 500 },
    );
  }

  const verified = verifyTelegramWebAppInitData({
    initData: parsed.data.initData,
    botToken,
  });

  if (!verified.ok) {
    console.error("telegram_webapp verify_failed", verified.reason);
    return Response.json(
      { error: { code: "UNAUTHORIZED", message: "Не получилось войти. Попробуйте ещё раз." } },
      { status: 401 },
    );
  }

  const next = resolveTelegramNext({
    startParam: verified.startParam,
    next: parsed.data.next,
  });

  try {
    const result = await upsertTelegramUser(verified.identity);
    await setSessionCookie(result.userId, { thirdParty: true });
    return Response.json({
      profile_completed: result.profileCompleted,
      is_new: result.isNew,
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
    console.error("telegram_webapp upsert_failed");
    return Response.json(
      { error: { code: "SERVER", message: "Не получилось войти. Попробуйте ещё раз." } },
      { status: 500 },
    );
  }
}

export const runtime = "nodejs";
