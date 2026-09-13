import Link from "next/link";
import {
  Briefcase,
  Building2,
  CalendarDays,
  ChevronRight,
  MessageCircle,
  Plus,
  Search,
  Sparkles,
} from "lucide-react";

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
    hint: "Кресло, кабинет или место в салоне",
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

const STEPS = [
  {
    title: "Найдите",
    text: "Кабинет, обучение или вакансию по району Ростова.",
    icon: Search,
  },
  {
    title: "Напишите",
    text: "После входа откроется Telegram автора объявления.",
    icon: MessageCircle,
  },
  {
    title: "Договоритесь",
    text: "Условия — напрямую, без чатов, где всё тонет.",
    icon: Sparkles,
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
      <section className="overflow-hidden rounded-[20px] border border-border bg-card px-5 py-7 md:px-10 md:py-12">
        <div className="md:flex md:items-end md:justify-between md:gap-12">
          <div className="max-w-xl animate-fade-up">
            <p className="text-[13px] font-medium tracking-[0.16em] text-primary uppercase">
              Ростов-на-Дону
            </p>
            <h1 className="font-display mt-3 text-[36px] leading-[40px] font-semibold tracking-[-0.03em] md:text-[52px] md:leading-[56px]">
              Место, где мастера находят кабинеты и друг друга
            </h1>
            <p className="mt-4 max-w-md text-[16px] leading-[24px] text-[var(--color-text-muted)]">
              Кабинеты, мастер-классы и вакансии — без бесконечных переписок в
              общих чатах.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/search">Смотреть объявления</Link>
              </Button>
              <Button asChild variant="secondary">
                <Link href={createHref}>Разместить своё</Link>
              </Button>
            </div>
          </div>
        </div>

        <nav
          aria-label="Категории"
          className="mt-8 grid gap-3 md:grid-cols-3"
        >
          {TILES.map((tile, index) => {
            const Icon = tile.icon;
            return (
              <Link
                key={tile.type}
                href={tile.href}
                style={{ animationDelay: `${80 + index * 70}ms` }}
                className={cn(
                  "group animate-fade-up flex min-h-[108px] flex-col justify-between rounded-[16px] border border-border bg-[var(--color-bg)] p-4",
                  "transition duration-200 ease-out",
                  "hover:-translate-y-0.5 hover:border-[var(--color-border-strong)] hover:bg-card hover:shadow-sm",
                  "active:scale-[0.99]",
                  "focus-visible:ring-2 focus-visible:ring-primary",
                )}
              >
                <span className="flex items-start justify-between gap-3">
                  <span className="flex size-11 items-center justify-center rounded-full bg-[var(--color-accent-subtle)] text-primary transition duration-200 group-hover:scale-105">
                    <Icon className="size-5" strokeWidth={1.75} />
                  </span>
                  <ChevronRight
                    className="size-5 shrink-0 text-[var(--color-text-muted)] transition duration-200 group-hover:translate-x-0.5 group-hover:text-primary"
                    strokeWidth={1.75}
                  />
                </span>
                <span className="mt-5">
                  <span className="block font-display text-[24px] leading-[28px] font-semibold">
                    {tile.label}
                  </span>
                  <span className="mt-1 block text-[13px] leading-[18px] text-[var(--color-text-muted)]">
                    {tile.hint}
                  </span>
                </span>
              </Link>
            );
          })}
        </nav>
      </section>

      <section className="mt-8 grid gap-3 md:grid-cols-3">
        {STEPS.map((step, index) => {
          const Icon = step.icon;
          return (
            <div
              key={step.title}
              style={{ animationDelay: `${220 + index * 70}ms` }}
              className="animate-fade-up rounded-[16px] border border-border bg-card p-4"
            >
              <span className="flex size-10 items-center justify-center rounded-full bg-[var(--color-accent-subtle)] text-primary">
                <Icon className="size-5" strokeWidth={1.75} />
              </span>
              <p className="mt-3 text-[12px] font-semibold tracking-[0.12em] text-primary uppercase">
                {String(index + 1).padStart(2, "0")}
              </p>
              <h2 className="mt-1 text-[16px] font-semibold">{step.title}</h2>
              <p className="mt-1 text-[13px] leading-[18px] text-[var(--color-text-muted)]">
                {step.text}
              </p>
            </div>
          );
        })}
      </section>

      {fresh ? (
        <section className="mt-10 animate-fade-up" style={{ animationDelay: "320ms" }}>
          <div className="mb-4 flex items-end justify-between">
            <div>
              <p className="text-[13px] font-medium tracking-[0.12em] text-primary uppercase">
                Сейчас в каталоге
              </p>
              <h2 className="font-display mt-1 text-[28px] leading-[32px] font-semibold">
                {NEW_TITLES[fresh.type]}
              </h2>
            </div>
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
          className="mt-10 max-w-xl animate-fade-up rounded-[16px] border border-border bg-card p-6"
          style={{ animationDelay: "320ms" }}
        >
          <div className="flex size-12 items-center justify-center rounded-full bg-[var(--color-accent-subtle)] text-primary">
            <Plus className="size-5" strokeWidth={1.75} />
          </div>
          <h2 className="font-display mt-4 text-[28px] leading-[32px] font-semibold">
            Каталог ещё собирается
          </h2>
          <p className="mt-2 text-[15px] leading-[22px] text-[var(--color-text-muted)]">
            Если сдаёте кабинет, ищете мастера или проводите мастер-класс —
            добавьте карточку первой.
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
