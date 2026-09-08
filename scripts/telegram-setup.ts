import { getAppUrl, getTelegramBotToken, getTelegramWebhookSecret } from "@/lib/env";
import { telegramCall } from "@/lib/telegram/api";

async function main() {
  const token = getTelegramBotToken();
  const origin = getAppUrl();
  const secret = getTelegramWebhookSecret();
  const miniApp = `${origin}/telegram`;

  if (!origin.startsWith("https://")) {
    throw new Error(
      "NEXT_PUBLIC_APP_URL must be HTTPS for Telegram webhook and Mini App (use a tunnel in development).",
    );
  }
  if (!token) {
    throw new Error("TELEGRAM_BOT_TOKEN is required");
  }

  await telegramCall("setMyCommands", {
    commands: [
      { command: "start", description: "Открыть Beauty Hub" },
      { command: "help", description: "Как пользоваться" },
      { command: "profile", description: "Мой профиль" },
      { command: "notifications", description: "Уведомления" },
      { command: "cancel", description: "Отмена" },
    ],
    language_code: "ru",
  });

  await telegramCall("setChatMenuButton", {
    menu_button: {
      type: "web_app",
      text: "Beauty Hub",
      web_app: { url: miniApp },
    },
  });

  await telegramCall("setWebhook", {
    url: `${origin}/api/v1/telegram/webhook`,
    secret_token: secret,
    allowed_updates: ["message"],
    drop_pending_updates: false,
  });

  console.log("Telegram bot configured.");
  console.log(`Mini App URL: ${miniApp}`);
  console.log(`Webhook: ${origin}/api/v1/telegram/webhook`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
