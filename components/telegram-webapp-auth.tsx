"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { isTelegramMiniApp } from "@/components/telegram-webapp-script";
import { safeNext } from "@/lib/auth/safe-next";
import { telegramBotUsername } from "@/lib/public-config";

function subscribe() {
  return () => {};
}

export function TelegramWebAppAuth({
  next,
  startParam,
}: {
  next: string;
  startParam?: string;
}) {
  const router = useRouter();
  const inMiniApp = useSyncExternalStore(
    subscribe,
    isTelegramMiniApp,
    () => false,
  );
  const [status, setStatus] = useState<"working" | "error">("working");
  const bot = telegramBotUsername();
  const botHref = bot ? `https://t.me/${bot}` : undefined;
  const safe = safeNext(next);

  useEffect(() => {
    if (!inMiniApp) {
      return;
    }

    const webApp = window.Telegram?.WebApp;
    const initData = webApp?.initData;
    if (!initData) {
      return;
    }

    webApp.ready();
    webApp.expand();
    document.documentElement.classList.add("telegram-mini-app");

    let cancelled = false;
    const run = async () => {
      try {
        const response = await fetch("/api/v1/auth/telegram/webapp", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            initData,
            next: startParam || safe,
          }),
        });
        if (!response.ok) {
          if (!cancelled) {
            setStatus("error");
          }
          return;
        }
        const data = (await response.json()) as { redirect?: string };
        if (!cancelled) {
          router.replace(data.redirect || safe);
          router.refresh();
        }
      } catch {
        if (!cancelled) {
          setStatus("error");
        }
      }
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [inMiniApp, router, safe, startParam]);

  if (inMiniApp && status === "working") {
    return (
      <p className="text-[15px] leading-[22px] text-[var(--color-text-muted)]">
        Открываем Beauty Hub…
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-[20px] leading-[26px] font-semibold">
        Откройте Beauty Hub через Telegram
      </h1>
      <p className="text-[15px] leading-[22px] text-[var(--color-text-muted)]">
        Чтобы продолжить, откройте приложение из бота Beauty Hub.
      </p>
      {status === "error" ? (
        <p className="text-[15px] leading-[22px] text-[var(--color-danger)]">
          Не получилось войти. Откройте Mini App кнопкой «Открыть Beauty Hub» в
          боте — не ссылкой туннеля из браузера.
        </p>
      ) : null}
      {botHref ? (
        <Button asChild>
          <a href={botHref}>Открыть бота</a>
        </Button>
      ) : (
        <p className="text-[15px] leading-[22px] text-[var(--color-danger)]">
          Ссылка на бота пока не настроена.
        </p>
      )}
      <Link href="/" className="text-[15px] text-[var(--color-text-muted)]">
        На главную сайта
      </Link>
    </div>
  );
}
