"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        initData: string;
        initDataUnsafe?: { start_param?: string };
        ready: () => void;
        expand: () => void;
      };
    };
  }
}

export function TelegramWebAppReady() {
  useEffect(() => {
    const webApp = window.Telegram?.WebApp;
    if (!webApp?.initData) {
      return;
    }
    webApp.ready();
    webApp.expand();
    document.documentElement.classList.add("telegram-mini-app");
  }, []);

  return null;
}

export function isTelegramMiniApp(): boolean {
  return Boolean(window.Telegram?.WebApp?.initData);
}
