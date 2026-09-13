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
    <div className="min-h-svh bg-transparent pb-[calc(4rem+env(safe-area-inset-bottom)+var(--tg-safe-area-inset-bottom,0px))] md:pb-0">
      <header className="sticky top-0 z-10 border-b border-border/80 bg-[color-mix(in_srgb,var(--color-surface)_88%,transparent)] px-4 backdrop-blur-md md:h-16">
        <div className="mx-auto flex h-[52px] w-full max-w-[1120px] items-center justify-between md:h-16">
          <Link href="/" className="flex items-center gap-2.5 text-foreground">
            <span className="flex size-8 items-center justify-center rounded-full bg-[var(--color-accent-subtle)] text-[11px] font-semibold tracking-[0.14em] text-primary">
              BH
            </span>
            <span className="font-display text-[22px] leading-none font-semibold tracking-[-0.03em]">
              Beauty Hub
            </span>
          </Link>
          <nav className="hidden gap-7 md:flex" aria-label="Основное">
            {TABS.map((tab) => (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  "text-[15px] leading-5 transition",
                  current === tab.href
                    ? "font-semibold text-primary"
                    : "text-[var(--color-text-muted)] hover:text-foreground",
                )}
              >
                {tab.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <div className="mx-auto w-full max-w-[1120px] px-4 py-6 md:px-6 md:py-8">{children}</div>
      <nav
        className="fixed inset-x-0 bottom-0 z-10 flex h-14 border-t border-border bg-[color-mix(in_srgb,var(--color-surface)_94%,transparent)] pb-[calc(env(safe-area-inset-bottom)+var(--tg-safe-area-inset-bottom,0px))] backdrop-blur-md md:hidden"
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
