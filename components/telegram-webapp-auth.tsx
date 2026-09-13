"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { OpenInTelegram } from "@/components/open-in-telegram";
import { isTelegramMiniApp } from "@/components/telegram-webapp-script";
import { safeNext } from "@/lib/auth/safe-next";

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
  const safe = safeNext(next);

  useEffect(() => {
    if (!inMiniApp) {
      return;
    }

    const webApp = window.Telegram?.WebApp;
    const initData = webApp?.initData;
    if (!initData) {
      const timer = window.setTimeout(() => setStatus("error"), 800);
      return () => window.clearTimeout(timer);
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
      <OpenInTelegram
        next={safe}
        startParam={startParam}
        error={
          status === "error"
            ? "Не получилось войти автоматически. Откройте Beauty Hub кнопкой в боте."
            : undefined
        }
      />
      <Link href="/" className="text-[15px] text-[var(--color-text-muted)]">
        На главную сайта
      </Link>
    </div>
  );
}
