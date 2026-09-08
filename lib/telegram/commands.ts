import { miniAppUrl } from "@/lib/telegram/api";
import { parseTelegramStartParam } from "@/lib/auth/start-param";

export const OPEN_BEAUTY_HUB = "✨ Открыть Beauty Hub";
export const OPEN_PROFILE = "👤 Открыть профиль";
export const OPEN_NOTIFICATIONS = "🔔 Открыть настройки";

export const START_TEXT = [
  "Добро пожаловать в <b>Beauty Hub</b> 👋",
  "",
  "<b>Beauty Hub</b> — пространство для мастеров, салонов и организаторов Ростова-на-Дону.",
  "",
  "Здесь можно:",
  "• найти рабочее место или кабинет;",
  "• найти интересные мероприятия и мастер-классы;",
  "• найти мастера или работу;",
  "• разместить собственное объявление.",
  "",
  "Открывайте Beauty Hub прямо в Telegram — каталог, поиск, объявления и профиль доступны внутри приложения.",
  "",
  "Начните с кнопки ниже 👇",
].join("\n");

export const HELP_TEXT = [
  "<b>Как пользоваться Beauty Hub?</b>",
  "",
  "🔎 <b>Найти</b>",
  "Ищите помещения, мероприятия и вакансии по каталогу.",
  "",
  "➕ <b>Создать</b>",
  "Разместите своё объявление и отправьте его на модерацию.",
  "",
  "👤 <b>Профиль</b>",
  "Управляйте профилем и своими объявлениями.",
  "",
  "🔔 <b>Уведомления</b>",
  "При желании получайте уведомления от Beauty Hub.",
  "",
  "💬 <b>Связь</b>",
  "После входа можно связаться с автором опубликованного объявления.",
].join("\n");

export const NOTIFICATIONS_TEXT = [
  "Настройки уведомлений находятся в профиле <b>Beauty Hub</b>.",
  "",
  "Вы можете включить или отключить уведомления там в любое время.",
].join("\n");

export const PROFILE_TEXT = "Откройте свой профиль в <b>Beauty Hub</b>.";

export const PROFILE_UNIDENTIFIED_TEXT =
  "Откройте Beauty Hub, чтобы посмотреть свой профиль.";

export const CANCEL_TEXT = "Сейчас нет активного действия.";

export const UNKNOWN_TEXT =
  "Откройте <b>Beauty Hub</b> через кнопку ниже — поиск и объявления удобнее в приложении.";

export type BotCommandName =
  | "start"
  | "help"
  | "profile"
  | "notifications"
  | "cancel"
  | "unknown";

export type BotCommand = {
  command: BotCommandName;
  payload: string;
};

export type BotReply = {
  text: string;
  parseMode: "HTML";
  buttonText: string | null;
  webAppUrl: string | null;
};

export function parseBotCommand(text: string | undefined): BotCommand | null {
  if (!text) {
    return null;
  }
  const match = text.trim().match(/^\/([A-Za-z]+)(?:@[A-Za-z0-9_]+)?(?:\s+(.+))?$/);
  if (!match) {
    return { command: "unknown", payload: "" };
  }
  const name = match[1]?.toLowerCase() ?? "";
  const payload = match[2]?.trim() ?? "";
  if (
    name === "start" ||
    name === "help" ||
    name === "profile" ||
    name === "notifications" ||
    name === "cancel"
  ) {
    return { command: name, payload };
  }
  return { command: "unknown", payload };
}

export function botReplyFor(
  command: BotCommand,
  context: { telegramUserId?: number } = {},
): BotReply {
  const identified =
    typeof context.telegramUserId === "number" && context.telegramUserId > 0;

  switch (command.command) {
    case "start": {
      const next = parseTelegramStartParam(command.payload);
      return {
        text: START_TEXT,
        parseMode: "HTML",
        buttonText: OPEN_BEAUTY_HUB,
        webAppUrl: miniAppUrl(next === "/" ? undefined : next),
      };
    }
    case "help":
      return {
        text: HELP_TEXT,
        parseMode: "HTML",
        buttonText: OPEN_BEAUTY_HUB,
        webAppUrl: miniAppUrl(),
      };
    case "profile":
      if (!identified) {
        return {
          text: PROFILE_UNIDENTIFIED_TEXT,
          parseMode: "HTML",
          buttonText: OPEN_BEAUTY_HUB,
          webAppUrl: miniAppUrl(),
        };
      }
      return {
        text: PROFILE_TEXT,
        parseMode: "HTML",
        buttonText: OPEN_PROFILE,
        webAppUrl: miniAppUrl("/profile"),
      };
    case "notifications":
      return {
        text: NOTIFICATIONS_TEXT,
        parseMode: "HTML",
        buttonText: OPEN_NOTIFICATIONS,
        webAppUrl: miniAppUrl("/profile"),
      };
    case "cancel":
      return {
        text: CANCEL_TEXT,
        parseMode: "HTML",
        buttonText: null,
        webAppUrl: null,
      };
    default:
      return {
        text: UNKNOWN_TEXT,
        parseMode: "HTML",
        buttonText: OPEN_BEAUTY_HUB,
        webAppUrl: miniAppUrl(),
      };
  }
}
