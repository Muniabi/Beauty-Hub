import { timingSafeEqual } from "node:crypto";

import { botReplyFor, parseBotCommand } from "@/lib/telegram/commands";
import { sendBotReply } from "@/lib/telegram/api";
import { getTelegramWebhookSecret } from "@/lib/env";

const processed = new Set<number>();
const PROCESSED_LIMIT = 500;

type TelegramUpdate = {
  update_id?: number;
  message?: {
    chat?: { id?: number; type?: string };
    from?: { id?: number };
    text?: string;
  };
};

function headerMatches(received: string | null, expected: string): boolean {
  if (!received) {
    return false;
  }
  const left = Buffer.from(received);
  const right = Buffer.from(expected);
  if (left.length !== right.length) {
    return false;
  }
  return timingSafeEqual(left, right);
}

function rememberUpdate(id: number): boolean {
  if (processed.has(id)) {
    return false;
  }
  processed.add(id);
  if (processed.size > PROCESSED_LIMIT) {
    const first = processed.values().next().value;
    if (typeof first === "number") {
      processed.delete(first);
    }
  }
  return true;
}

export async function POST(request: Request) {
  let secret: string;
  try {
    secret = getTelegramWebhookSecret();
  } catch {
    return new Response("webhook not configured", { status: 503 });
  }

  const header = request.headers.get("x-telegram-bot-api-secret-token");
  if (!headerMatches(header, secret)) {
    return new Response("unauthorized", { status: 401 });
  }

  let update: TelegramUpdate;
  try {
    update = (await request.json()) as TelegramUpdate;
  } catch {
    return new Response("bad request", { status: 400 });
  }

  if (typeof update.update_id === "number" && !rememberUpdate(update.update_id)) {
    return new Response("ok");
  }

  const message = update.message;
  if (!message || message.chat?.type !== "private" || typeof message.chat.id !== "number") {
    return new Response("ok");
  }

  const command = parseBotCommand(message.text);
  if (!command) {
    return new Response("ok");
  }

  try {
    const reply = botReplyFor(command, {
      telegramUserId: message.from?.id,
    });
    await sendBotReply(message.chat.id, reply);
  } catch (error) {
    console.error("telegram_webhook send_failed");
    console.error(error instanceof Error ? error.message : "unknown");
  }

  return new Response("ok");
}

export const runtime = "nodejs";
