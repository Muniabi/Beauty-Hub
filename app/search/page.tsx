import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { CatalogResults } from "@/components/catalog-results";
import { cn } from "@/lib/utils";
import { LISTING_TYPE_LABELS } from "@/lib/listings/constants";
import { searchPublicListings } from "@/lib/listings/queries";
import type { ListingType } from "@/lib/domain";

const TYPES: ListingType[] = ["space", "event", "vacancy"];

const SECTION_TITLES: Record<ListingType, string> = {
  space: "Кабинеты",
  event: "Мероприятия",
  vacancy: "Вакансии",
};

const EMPTY_SEED: Record<ListingType, string> = {
  space: "Пока нет кабинетов в Ростове. Если сдаёте — добавьте карточку.",
  event: "Пока нет мероприятий в Ростове. Если проводите мастер-класс — добавьте карточку.",
  vacancy: "Пока нет вакансий в Ростове. Если ищете мастера или работу — добавьте карточку.",
};

function asType(value: string | undefined): ListingType {
  return TYPES.includes(value as ListingType) ? (value as ListingType) : "space";
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; q?: string }>;
}) {
  const params = await searchParams;
  const type = asType(params.type);
  const q = params.q?.trim() ?? "";
  const { items, total } = await searchPublicListings({ type, q });
  const emptySeed = total === 0 && !q;
  const zeroResults = total === 0 && Boolean(q);
  const titles = SECTION_TITLES[type];

  return (
    <AppShell current="/search">
      <h1 className="text-[20px] leading-[26px] font-semibold">{titles}</h1>
      <form className="mt-4 flex flex-col gap-3">
        <div className="grid grid-cols-3 gap-2">
          {TYPES.map((item) => (
            <Link
              key={item}
              href={`/search?type=${item}`}
              className={cn(
                "inline-flex h-10 items-center justify-center rounded-[10px] border px-2 text-center text-[13px] font-medium md:text-[15px]",
                type === item
                  ? "border-primary bg-[var(--color-accent-subtle)] text-primary"
                  : "border-border bg-card",
              )}
            >
              {LISTING_TYPE_LABELS[item]}
            </Link>
          ))}
        </div>
        <input type="hidden" name="type" value={type} />
        <input
          name="q"
          defaultValue={q}
          placeholder="Название"
          className="h-12 rounded-[10px] border border-border bg-card px-3 text-[15px] md:h-11"
        />
        <p className="text-[13px] text-[var(--color-text-muted)]">Сначала новые</p>
      </form>

      <div className="mt-6">
        {emptySeed ? (
          <p className="text-[15px] leading-[22px]">
            {EMPTY_SEED[type]}
          </p>
        ) : null}
        {zeroResults ? (
          <p className="text-[15px] leading-[22px]">
            Ничего не нашли. Сбросьте фильтры или включите уведомления в Telegram —
            напишем, когда появится.
          </p>
        ) : null}
        {items.length > 0 ? (
          <CatalogResults
            key={`${type}:${q}`}
            type={type}
            q={q}
            initialItems={items}
            total={total}
          />
        ) : null}
      </div>
    </AppShell>
  );
}
