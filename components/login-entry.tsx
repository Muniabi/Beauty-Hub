"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { OpenInTelegram } from "@/components/open-in-telegram";
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
      <OpenInTelegram
        next={next}
        error={
          initialError
            ? "Не получилось войти автоматически. Откройте Beauty Hub через бота."
            : undefined
        }
      />
      <p className="mt-8 text-[13px] leading-[18px] text-[var(--color-text-muted)]">
        Открывая приложение, вы принимаете{" "}
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
