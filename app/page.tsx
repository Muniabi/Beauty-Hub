import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { ListingCardGrid } from "@/components/listing-card";
import { Button } from "@/components/ui/button";
import { getSessionUser } from "@/lib/auth/current-user";
import { listHomeNew } from "@/lib/listings/queries";

const TILES = [
  { type: "space" as const, href: "/search?type=space", label: "Кабинеты" },
  { type: "event" as const, href: "/search?type=event", label: "Мероприятия" },
  { type: "vacancy" as const, href: "/search?type=vacancy", label: "Вакансии" },
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
      <p className="text-[13px] text-[var(--color-text-muted)]">Ростов-на-Дону</p>
      <h1 className="mt-3 max-w-xl text-[28px] leading-[34px] font-bold md:text-[36px] md:leading-[42px]">
        Кабинеты, мастер-классы и вакансии для мастеров Ростова
      </h1>
      <p className="mt-3 text-[15px] leading-[22px] text-[var(--color-text-muted)]">
        Без чатов, в которых всё тонет
      </p>

      <div className="mt-6 flex flex-col gap-3 md:grid md:grid-cols-3">
        {TILES.map((tile) => (
          <Link
            key={tile.type}
            href={tile.href}
            className="flex h-[72px] items-center justify-between rounded-[10px] border border-border bg-card px-4 text-[16px] font-semibold"
          >
            {tile.label}
            <ChevronRight className="size-5 text-[var(--color-text-muted)]" strokeWidth={1.75} />
          </Link>
        ))}
      </div>

      {fresh ? (
        <section className="mt-10">
          <div className="mb-4 flex items-end justify-between">
            <h2 className="text-[20px] leading-[26px] font-semibold">
              {NEW_TITLES[fresh.type]}
            </h2>
            <Link href={`/search?type=${fresh.type}`} className="text-[15px] font-semibold text-primary">
              Все
            </Link>
          </div>
          <ListingCardGrid items={fresh.items} />
        </section>
      ) : (
        <section className="mt-10 max-w-xl">
          <p className="text-[15px] leading-[22px]">
            Пока собираем объявления Ростова. Если сдаёте кабинет или проводите
            мастер-класс — добавьте карточку.
          </p>
          <div className="mt-6">
            <Button asChild>
              <Link href={createHref}>Добавить карточку</Link>
            </Button>
          </div>
        </section>
      )}
    </AppShell>
  );
}
