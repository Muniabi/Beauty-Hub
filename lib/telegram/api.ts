import { getAppUrl, getTelegramBotToken } from "@/lib/env";

type TelegramApiResponse = {
  ok: boolean;
  description?: string;
  result?: unknown;
};

export class TelegramApiError extends Error {
  constructor(method: string, description?: string) {
    super(description || `Telegram API ${method} failed`);
    this.name = "TelegramApiError";
  }
}

export async function telegramCall(
  method: string,
  body: Record<string, unknown>,
): Promise<unknown> {
  const token = getTelegramBotToken();
  const response = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = (await response.json()) as TelegramApiResponse;
  if (!json.ok) {
    throw new TelegramApiError(method, json.description);
  }
  return json.result;
}

export function miniAppUrl(next?: string): string {
  const origin = getAppUrl();
  if (!next || next === "/") {
    return `${origin}/telegram`;
  }
  const url = new URL("/telegram", `${origin}/`);
  url.searchParams.set("next", next);
  return url.toString();
}

export async function sendBotReply(
  chatId: number,
  reply: {
    text: string;
    parseMode?: "HTML";
    buttonText: string | null;
    webAppUrl: string | null;
  },
): Promise<void> {
  await telegramCall("sendMessage", {
    chat_id: chatId,
    text: reply.text,
    parse_mode: reply.parseMode ?? "HTML",
    disable_web_page_preview: true,
    reply_markup: reply.webAppUrl
      ? {
          inline_keyboard: [
            [
              {
                text: reply.buttonText || "✨ Открыть Beauty Hub",
                web_app: { url: reply.webAppUrl },
              },
            ],
          ],
        }
      : undefined,
  });
}

export async function sendPrivateText(
  chatId: number,
  text: string,
  webAppUrl?: string,
): Promise<void> {
  await sendBotReply(chatId, {
    text,
    parseMode: "HTML",
    buttonText: webAppUrl ? "✨ Открыть Beauty Hub" : null,
    webAppUrl: webAppUrl ?? null,
  });
}
