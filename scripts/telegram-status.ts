import { telegramCall } from "@/lib/telegram/api";
import { getAppUrl, telegramBotUsername } from "@/lib/env";

type WebhookInfo = {
  url?: string;
  has_custom_certificate?: boolean;
  pending_update_count?: number;
  last_error_message?: string;
  ip_address?: string;
};

type MenuButton = {
  type?: string;
  text?: string;
  web_app?: { url?: string };
};

type Me = {
  username?: string;
  has_main_web_app?: boolean;
};

async function main() {
  const origin = getAppUrl();
  const me = (await telegramCall("getMe", {})) as Me;
  const webhook = (await telegramCall("getWebhookInfo", {})) as WebhookInfo;
  const menu = (await telegramCall("getChatMenuButton", {})) as MenuButton;

  console.log(`env_app_url=${origin}`);
  console.log(`env_bot_username=${telegramBotUsername()}`);
  console.log(`telegram_bot_username=${me.username ?? ""}`);
  console.log(`telegram_has_main_web_app=${me.has_main_web_app === true}`);
  console.log(`telegram_webhook_url=${webhook.url ?? ""}`);
  console.log(`telegram_webhook_last_error=${webhook.last_error_message ?? ""}`);
  console.log(`telegram_menu_type=${menu.type ?? ""}`);
  console.log(`telegram_menu_text=${menu.text ?? ""}`);
  console.log(`telegram_menu_url=${menu.web_app?.url ?? ""}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
