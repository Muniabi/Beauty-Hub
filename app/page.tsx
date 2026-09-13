import Link from "next/link";
import { Briefcase, Building2, CalendarDays, ChevronRight, Plus } from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { ListingCardGrid } from "@/components/listing-card";
import { Button } from "@/components/ui/button";
import { getSessionUser } from "@/lib/auth/current-user";
import { listHomeNew } from "@/lib/listings/queries";
import { cn } from "@/lib/utils";

const TILES = [
  {
    type: "space" as const,
    href: "/search?type=space",
    label: "Кабинеты",
    hint: "Рабочее место или кресло",
    icon: Building2,
  },
  {
    type: "event" as const,
    href: "/search?type=event",
    label: "Мероприятия",
    hint: "Мастер-классы и обучение",
    icon: CalendarDays,
  },
  {
    type: "vacancy" as const,
    href: "/search?type=vacancy",
    label: "Вакансии",
    hint: "Найти мастера или работу",
    icon: Briefcase,
  },
];

const NEW_TITLES = {
  space: "Новые кабинеты",
  event: "Ближайшие мероприятия",
  vacancy: "Свежие вакансии",
};

export default async function HomePage() {
  const [user, fresh] = await Promise.all([
    getSessionUser(),
    listHomeNew(),
  ]);
  const createHref = user?.profileCompleted
    ? "/create"
    : user
      ? "/onboarding/role?next=/create"
      : "/login?next=/create";

  return (
    <AppShell current="/">
      <div className="md:flex md:items-start md:justify-between md:gap-12">
        <section className="max-w-xl animate-fade-up">
          <p className="text-[13px] font-medium tracking-[0.04em] text-[var(--color-text-muted)] uppercase">
            Ростов-на-Дону
          </p>
          <h1 className="mt-3 max-w-xl text-[28px] leading-[34px] font-bold tracking-[-0.02em] md:text-[36px] md:leading-[42px]">
            Кабинеты, мастер-классы и вакансии для мастеров Ростова
          </h1>
          <p className="mt-3 text-[15px] leading-[22px] text-[var(--color-text-muted)]">
            Без чатов, в которых всё тонет
          </p>
        </section>

        <nav
          aria-label="Категории"
          className="mt-6 flex w-full flex-col gap-3 md:mt-1 md:w-[320px] md:shrink-0"
        >
          {TILES.map((tile, index) => {
            const Icon = tile.icon;
            return (
              <Link
                key={tile.type}
                href={tile.href}
                style={{ animationDelay: `${80 + index * 70}ms` }}
                className={cn(
                  "group animate-fade-up flex min-h-[72px] items-center gap-3 rounded-[10px] border border-border bg-card px-3",
                  "transition duration-200 ease-out",
                  "hover:-translate-y-0.5 hover:border-[var(--color-border-strong)] hover:shadow-sm",
                  "active:scale-[0.99]",
                  "focus-visible:ring-2 focus-visible:ring-primary",
                )}
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-[8px] bg-[var(--color-accent-subtle)] text-primary transition duration-200 group-hover:scale-105">
                  <Icon className="size-5" strokeWidth={1.75} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[16px] leading-[22px] font-semibold">
                    {tile.label}
                  </span>
                  <span className="block text-[13px] leading-[18px] text-[var(--color-text-muted)]">
                    {tile.hint}
                  </span>
                </span>
                <ChevronRight
                  className="size-5 shrink-0 text-[var(--color-text-muted)] transition duration-200 group-hover:translate-x-0.5 group-hover:text-primary"
                  strokeWidth={1.75}
                />
              </Link>
            );
          })}
        </nav>
      </div>

      {fresh ? (
        <section className="mt-10 animate-fade-up" style={{ animationDelay: "280ms" }}>
          <div className="mb-4 flex items-end justify-between">
            <h2 className="text-[20px] leading-[26px] font-semibold">
              {NEW_TITLES[fresh.type]}
            </h2>
            <Link
              href={`/search?type=${fresh.type}`}
              className="text-[15px] font-semibold text-primary transition hover:opacity-80"
            >
              Все
            </Link>
          </div>
          <ListingCardGrid items={fresh.items} />
        </section>
      ) : (
        <section
          className="mt-10 max-w-xl animate-fade-up rounded-[10px] border border-border bg-card p-5 md:p-6"
          style={{ animationDelay: "280ms" }}
        >
          <div className="flex size-11 items-center justify-center rounded-[8px] bg-[var(--color-accent-subtle)] text-primary">
            <Plus className="size-5" strokeWidth={1.75} />
          </div>
          <p className="mt-4 text-[15px] leading-[22px]">
            Пока собираем объявления Ростова. Если сдаёте кабинет или проводите
            мастер-класс — добавьте карточку.
          </p>
          <div className="mt-5">
            <Button asChild>
              <Link href={createHref}>Добавить карточку</Link>
            </Button>
          </div>
        </section>
      )}
    </AppShell>
  );
}
