"use client";

import { useState } from "react";

import { getContactAction } from "@/app/actions/contact";
import { Button } from "@/components/ui/button";
import { isTelegramMiniApp } from "@/components/telegram-webapp-script";

function contactErrorText(reason: string): string {
  if (reason === "rate_limited") {
    return "Слишком много запросов. Подождите.";
  }
  if (reason === "unavailable") {
    return "Автор пока не указал Telegram.";
  }
  if (reason === "expired") {
    return "Объявление уже неактуально.";
  }
  if (reason === "own_listing") {
    return "Это ваше объявление.";
  }
  return "Не получилось открыть контакт. Попробуйте ещё раз.";
}

function openTelegramChat(href: string) {
  const webApp = window.Telegram?.WebApp;
  if (isTelegramMiniApp() && webApp?.openTelegramLink) {
    webApp.openTelegramLink(href);
    return;
  }
  window.location.assign(href);
}

function openPhone(href: string) {
  window.location.assign(href);
}

export function AuthorContactButtons({
  listingId,
  hasPhone,
}: {
  listingId: string;
  hasPhone: boolean;
}) {
  const [pending, setPending] = useState<"telegram" | "phone" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function openContact(target: "telegram" | "phone") {
    setPending(target);
    setError(null);
    try {
      const result = await getContactAction(listingId, target);
      if (!result.ok) {
        setError(contactErrorText(result.reason));
        return;
      }
      if (target === "phone") {
        if (!result.phoneHref) {
          setError("Автор не указал телефон.");
          return;
        }
        openPhone(result.phoneHref);
        return;
      }
      openTelegramChat(result.telegramHref);
    } catch {
      setError("Не получилось открыть контакт. Попробуйте ещё раз.");
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <Button
        type="button"
        className="w-full"
        disabled={pending !== null}
        onClick={() => void openContact("telegram")}
      >
        {pending === "telegram" ? "Открываем…" : "Написать в Telegram"}
      </Button>
      {hasPhone ? (
        <Button
          type="button"
          variant="secondary"
          className="w-full"
          disabled={pending !== null}
          onClick={() => void openContact("phone")}
        >
          {pending === "phone" ? "Открываем…" : "Позвонить"}
        </Button>
      ) : null}
      {error ? (
        <p className="text-[13px] text-[var(--color-danger)]">{error}</p>
      ) : null}
    </div>
  );
}
