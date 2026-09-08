import type { ReactNode } from "react";
import Link from "next/link";
import { Home, PlusCircle, Search, UserRound } from "lucide-react";

import { cn } from "@/lib/utils";

const TABS = [
  { href: "/", label: "Главная", icon: Home },
  { href: "/search", label: "Поиск", icon: Search },
  { href: "/create", label: "Создать", icon: PlusCircle },
  { href: "/profile", label: "Профиль", icon: UserRound },
] as const;

export function AppShell({
  children,
  current,
}: {
  children: ReactNode;
  current: (typeof TABS)[number]["href"];
}) {
  return (
    <div className="min-h-svh bg-background pb-[calc(4rem+env(safe-area-inset-bottom)+var(--tg-safe-area-inset-bottom,0px))] md:pb-0">
      <header className="sticky top-0 z-10 flex h-[52px] items-center border-b border-border bg-card px-4 md:h-16">
        <div className="mx-auto flex w-full max-w-[1120px] items-center justify-between">
          <Link href="/" className="font-semibold text-foreground">
            Beauty Hub
          </Link>
          <nav className="hidden gap-6 md:flex" aria-label="Основное">
            {TABS.map((tab) => (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  "text-[15px] leading-5",
                  current === tab.href
                    ? "font-semibold text-primary"
                    : "text-[var(--color-text-muted)]",
                )}
              >
                {tab.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <div className="mx-auto w-full max-w-[1120px] px-4 py-6 md:px-6">{children}</div>
      <nav
        className="fixed inset-x-0 bottom-0 z-10 flex h-14 border-t border-border bg-card pb-[calc(env(safe-area-inset-bottom)+var(--tg-safe-area-inset-bottom,0px))] md:hidden"
        aria-label="Табы"
      >
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const active = current === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-1 text-[11px] leading-[14px]",
                active ? "text-primary" : "text-[var(--color-text-muted)]",
              )}
            >
              <Icon className="size-6" strokeWidth={1.75} />
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
