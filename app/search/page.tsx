import Link from "next/link";
import { Briefcase, Building2, CalendarDays, Search } from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { CatalogResults } from "@/components/catalog-results";
import { Button } from "@/components/ui/button";
import { listDistricts, listSpecializations } from "@/lib/catalogs";
import { LISTING_TYPE_LABELS } from "@/lib/listings/constants";
import { searchPublicListings } from "@/lib/listings/queries";
import { searchHref } from "@/lib/listings/search-url";
import type { ListingType } from "@/lib/domain";
import { cn } from "@/lib/utils";

const TYPES: ListingType[] = ["space", "event", "vacancy"];

const SECTION = {
  space: {
    title: "Кабинеты",
    lead: "Рабочие места, кресла и кабинеты по районам Ростова.",
    empty: "Пока нет кабинетов. Если сдаёте место — добавьте карточку.",
    icon: Building2,
  },
  event: {
    title: "Мероприятия",
    lead: "Мастер-классы и обучение, которые ещё впереди.",
    empty: "Пока нет мероприятий. Если проводите МК — добавьте карточку.",
    icon: CalendarDays,
  },
  vacancy: {
    title: "Вакансии",
    lead: "Ищу мастера или ищу работу — без общих чатов.",
    empty: "Пока нет вакансий. Если набираете команду или ищете место — добавьте карточку.",
    icon: Briefcase,
  },
} as const;

function asType(value: string | undefined): ListingType {
  return TYPES.includes(value as ListingType) ? (value as ListingType) : "space";
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{
    type?: string;
    q?: string;
    districtId?: string;
    specializationId?: string;
  }>;
}) {
  const params = await searchParams;
  const type = asType(params.type);
  const q = params.q?.trim() ?? "";
  const districtId = params.districtId || "";
  const specializationId = params.specializationId || "";
  const [districts, specializations, result] = await Promise.all([
    listDistricts(),
    listSpecializations(),
    searchPublicListings({
      type,
      q,
      districtId: districtId || undefined,
      specializationId: specializationId || undefined,
    }),
  ]);
  const { items, total } = result;
  const emptySeed = total === 0 && !q && !districtId && !specializationId;
  const zeroResults = total === 0 && !emptySeed;
  const copy = SECTION[type];
  const Icon = copy.icon;
  const filters = { type, q, districtId, specializationId };

  return (
    <AppShell current="/search">
      <div className="max-w-2xl">
        <p className="text-[13px] font-medium tracking-[0.14em] text-primary uppercase">
          Каталог Ростова
        </p>
        <h1 className="font-display mt-2 flex items-center gap-3 text-[36px] leading-[40px] font-semibold tracking-[-0.03em] md:text-[44px] md:leading-[48px]">
          <span className="hidden size-11 items-center justify-center rounded-full bg-[var(--color-accent-subtle)] text-primary sm:flex">
            <Icon className="size-5" strokeWidth={1.75} />
          </span>
          {copy.title}
        </h1>
        <p className="mt-2 text-[15px] leading-[22px] text-[var(--color-text-muted)]">
          {copy.lead}
        </p>
      </div>

      <form className="mt-6 rounded-[16px] border border-border bg-card p-4 md:p-5">
        <div className="grid grid-cols-3 gap-2">
          {TYPES.map((item) => (
            <Link
              key={item}
              href={searchHref({ ...filters, type: item })}
              className={cn(
                "inline-flex h-11 items-center justify-center rounded-[10px] border px-2 text-center text-[13px] font-semibold md:text-[15px]",
                type === item
                  ? "border-primary bg-[var(--color-accent-subtle)] text-primary"
                  : "border-border bg-[var(--color-bg)] text-[var(--color-text-muted)] hover:border-[var(--color-border-strong)] hover:text-foreground",
              )}
            >
              {LISTING_TYPE_LABELS[item]}
            </Link>
          ))}
        </div>
        <input type="hidden" name="type" value={type} />
        <label className="relative mt-4 block">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[var(--color-text-muted)]" />
          <input
            name="q"
            defaultValue={q}
            placeholder="Название, адрес или слово из описания"
            className="h-12 w-full rounded-[10px] border border-border bg-[var(--color-bg)] pr-3 pl-10 text-[15px] outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 md:h-11"
          />
        </label>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <label className="flex flex-col gap-1.5">
            <span className="text-[13px] font-medium text-[var(--color-text-muted)]">Район</span>
            <select
              name="districtId"
              defaultValue={districtId}
              className="h-12 rounded-[10px] border border-border bg-[var(--color-bg)] px-3 text-[15px] md:h-11"
            >
              <option value="">Все районы</option>
              {districts.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-[13px] font-medium text-[var(--color-text-muted)]">
              Специализация
            </span>
            <select
              name="specializationId"
              defaultValue={specializationId}
              className="h-12 rounded-[10px] border border-border bg-[var(--color-bg)] px-3 text-[15px] md:h-11"
            >
              <option value="">Все направления</option>
              {specializations.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-[13px] text-[var(--color-text-muted)]">
            {total > 0
              ? `${total} ${copy.title.toLowerCase()} · сначала новые`
              : "Сначала новые"}
          </p>
          <Button type="submit" className="min-w-28">
            Найти
          </Button>
        </div>
      </form>

      <div className="mt-6">
        {emptySeed ? (
          <div className="rounded-[16px] border border-border bg-card p-6">
            <p className="text-[16px] font-semibold">Пока пусто в этом разделе</p>
            <p className="mt-2 text-[15px] leading-[22px] text-[var(--color-text-muted)]">
              {copy.empty}
            </p>
            <Button asChild className="mt-5">
              <Link href="/create">Добавить карточку</Link>
            </Button>
          </div>
        ) : null}
        {zeroResults ? (
          <div className="rounded-[16px] border border-border bg-card p-6">
            <p className="text-[16px] font-semibold">Ничего не нашли</p>
            <p className="mt-2 text-[15px] leading-[22px] text-[var(--color-text-muted)]">
              Сбросьте фильтры или включите уведомления в профиле — напишем, когда
              появится подходящее объявление.
            </p>
            <Button asChild variant="secondary" className="mt-5">
              <Link href={searchHref({ type })}>Сбросить фильтры</Link>
            </Button>
          </div>
        ) : null}
        {items.length > 0 ? (
          <CatalogResults
            key={`${type}:${q}:${districtId}:${specializationId}`}
            type={type}
            q={q}
            districtId={districtId}
            specializationId={specializationId}
            initialItems={items}
            total={total}
          />
        ) : null}
      </div>
    </AppShell>
  );
}
