import { normalizeTelegramHandle } from "@/lib/auth/profile-completed";
import { telegramContactHandle } from "@/lib/auth/telegram";

const TELEGRAM_HANDLE = /^[A-Za-z][A-Za-z0-9_]{4,31}$/;

export function telegramChatHref(handle: string): string | null {
  const clean = normalizeTelegramHandle(handle);
  if (!TELEGRAM_HANDLE.test(clean)) {
    return null;
  }
  return `https://t.me/${clean}`;
}

export function authorTelegramHandle(input: {
  contactTelegram: string;
  telegramUsername?: string | null;
}): string {
  return (
    normalizeTelegramHandle(input.contactTelegram) ||
    telegramContactHandle(input.telegramUsername)
  );
}

export function phoneHref(phone: string): string | null {
  const compact = phone.replace(/[^\d+]/g, "");
  const digits = compact.replace(/\D/g, "");
  if (digits.length < 10) {
    return null;
  }
  return `tel:${compact}`;
}
