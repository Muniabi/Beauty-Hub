function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing environment variable ${name}`);
  }
  return value;
}

export function getSessionSecret(): string {
  const secret = required("SESSION_SECRET");
  if (secret.length < 32) {
    throw new Error("SESSION_SECRET must be at least 32 characters");
  }
  return secret;
}

export function getTelegramBotToken(): string {
  return required("TELEGRAM_BOT_TOKEN");
}

export function getAppUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
    "http://localhost:3000"
  );
}

export function isSecureCookie(): boolean {
  return process.env.NODE_ENV === "production";
}

export function telegramBotUsername(): string {
  return process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME?.replace(/^@/, "") ?? "";
}

export function getTelegramWebhookSecret(): string {
  return required("TELEGRAM_WEBHOOK_SECRET");
}

const DEV_TUNNEL_HOSTS = [
  ".lhr.life",
  ".trycloudflare.com",
  ".ngrok-free.app",
  ".ngrok.app",
  ".loca.lt",
];

function isDevTunnelOrigin(origin: string): boolean {
  if (process.env.NODE_ENV === "production") {
    return false;
  }
  try {
    const host = new URL(origin).hostname;
    return DEV_TUNNEL_HOSTS.some((suffix) => host.endsWith(suffix));
  } catch {
    return false;
  }
}

export function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) {
    return false;
  }
  try {
    const incoming = new URL(origin).origin;
    if (incoming === new URL(getAppUrl()).origin) {
      return true;
    }
    return isDevTunnelOrigin(origin);
  } catch {
    return false;
  }
}
