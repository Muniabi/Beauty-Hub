"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { TelegramLoginWidget } from "@/components/telegram-login-widget";
import { isTelegramMiniApp } from "@/components/telegram-webapp-script";

function subscribe() {
  return () => {};
}

export function LoginEntry({
  next,
  initialError = false,
}: {
  next: string;
  initialError?: boolean;
}) {
  const router = useRouter();
  const inMiniApp = useSyncExternalStore(
    subscribe,
    isTelegramMiniApp,
    () => false,
  );

  useEffect(() => {
    if (!inMiniApp) {
      return;
    }
    const url = new URL("/telegram", window.location.origin);
    if (next && next !== "/") {
      url.searchParams.set("next", next);
    }
    router.replace(`${url.pathname}${url.search}`);
  }, [inMiniApp, next, router]);

  if (inMiniApp) {
    return (
      <p className="text-[15px] leading-[22px] text-[var(--color-text-muted)]">
        Открываем Beauty Hub…
      </p>
    );
  }

  return (
    <>
      <h1 className="text-[20px] leading-[26px] font-semibold">
        Войти через Telegram
      </h1>
      <p className="mt-2 text-[13px] leading-[18px] text-[var(--color-text-muted)]">
        Чтобы написать автору объявления
      </p>
      <div className="mt-8">
        <TelegramLoginWidget next={next} initialError={initialError} />
      </div>
      <p className="mt-8 text-[13px] leading-[18px] text-[var(--color-text-muted)]">
        Входя, вы принимаете{" "}
        <Link href="/legal/terms" className="text-primary">
          условия
        </Link>{" "}
        и{" "}
        <Link href="/legal/privacy" className="text-primary">
          политику конфиденциальности
        </Link>
        .
      </p>
    </>
  );
}
