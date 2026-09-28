import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { clearSessionCookie } from "@/lib/auth/current-user";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin/listings", label: "Очередь", match: "/admin/listings" },
  { href: "/admin/reports", label: "Жалобы", match: "/admin/reports" },
] as const;

async function logoutAction() {
  "use server";
  await clearSessionCookie();
  redirect("/");
}

export function AdminShell({
  children,
  current,
  displayName,
}: {
  children: ReactNode;
  current: "listings" | "reports";
  displayName: string;
}) {
  return (
    <div className="min-h-svh bg-[var(--color-bg)]">
      <header className="sticky top-0 z-10 h-16 border-b border-border bg-[var(--color-surface)]">
        <div className="mx-auto flex h-full w-full max-w-[1120px] items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-6">
            <div>
              <p className="text-[12px] font-medium tracking-[0.08em] text-[var(--color-text-muted)] uppercase">
                Beauty Hub
              </p>
              <p className="text-[15px] font-semibold">Админ</p>
            </div>
            <nav className="flex gap-5" aria-label="Админ">
              {NAV.map((item) => {
                const active =
                  current === "listings"
                    ? item.match === "/admin/listings"
                    : item.match === "/admin/reports";
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "border-b-2 py-1 text-[15px] transition",
                      active
                        ? "border-primary font-semibold text-primary"
                        : "border-transparent text-[var(--color-text-muted)] hover:text-foreground",
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="flex items-center gap-3 text-[14px]">
            <span className="hidden text-[var(--color-text-muted)] sm:inline">
              {displayName}
            </span>
            <form action={logoutAction}>
              <button
                type="submit"
                className="text-[14px] font-medium text-[var(--color-text-muted)] underline-offset-2 hover:text-foreground hover:underline"
              >
                Выйти
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-[1120px] px-4 py-6 md:px-6 md:py-8">
        {children}
      </main>
    </div>
  );
}
