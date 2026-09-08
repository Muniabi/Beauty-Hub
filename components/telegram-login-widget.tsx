"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { telegramBotUsername } from "@/lib/public-config";
import { safeNext } from "@/lib/auth/safe-next";

type TelegramUser = {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
};

declare global {
  interface Window {
    onTelegramAuth?: (user: TelegramUser) => void;
  }
}

export function TelegramLoginWidget({
  next,
  initialError = false,
}: {
  next: string;
  initialError?: boolean;
}) {
  const router = useRouter();
  const hostRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState(initialError);
  const bot = telegramBotUsername();
  const safe = safeNext(next);

  const startLogin = useCallback(
    async (user: TelegramUser) => {
      setError(false);
      try {
        const response = await fetch("/api/v1/auth/telegram", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify({ ...user, next: safe }),
        });
        if (!response.ok) {
          setError(true);
          return;
        }
        const data = (await response.json()) as { redirect?: string };
        router.replace(data.redirect || safe);
        router.refresh();
      } catch {
        setError(true);
      }
    },
    [router, safe],
  );

  useEffect(() => {
    window.onTelegramAuth = startLogin;
    return () => {
      delete window.onTelegramAuth;
    };
  }, [startLogin]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host || !bot) {
      return;
    }

    host.replaceChildren();
    const script = document.createElement("script");
    script.async = true;
    script.src = "https://telegram.org/js/telegram-widget.js?22";
    script.setAttribute("data-telegram-login", bot);
    script.setAttribute("data-size", "large");
    script.setAttribute("data-radius", "10");
    script.setAttribute("data-request-access", "write");
    script.setAttribute("data-onauth", "onTelegramAuth(user)");
    script.setAttribute("data-lang", "ru");
    host.append(script);
  }, [bot]);

  if (!bot) {
    return (
      <p className="text-[15px] leading-[22px] text-[var(--color-danger)]">
        Вход через Telegram пока не настроен.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {error ? (
        <p className="text-[15px] leading-[22px] text-[var(--color-danger)]">
          Не получилось войти. Попробуйте ещё раз.
        </p>
      ) : null}
      <div ref={hostRef} className="min-h-12" />
      {error ? (
        <button
          type="button"
          className="text-[15px] font-semibold text-primary"
          onClick={() => {
            setError(false);
            const host = hostRef.current;
            if (host) {
              host.replaceChildren();
              const script = document.createElement("script");
              script.async = true;
              script.src = `https://telegram.org/js/telegram-widget.js?22&r=${Date.now()}`;
              script.setAttribute("data-telegram-login", bot);
              script.setAttribute("data-size", "large");
              script.setAttribute("data-radius", "10");
              script.setAttribute("data-request-access", "write");
              script.setAttribute("data-onauth", "onTelegramAuth(user)");
              script.setAttribute("data-lang", "ru");
              host.append(script);
            }
          }}
        >
          Попробовать снова
        </button>
      ) : null}
    </div>
  );
}
