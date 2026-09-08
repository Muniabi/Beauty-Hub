import Link from "next/link";

import { LISTING_STATUS_LABELS, LISTING_TYPE_LABELS } from "@/lib/listings/constants";
import { mediaSrc } from "@/lib/listings/format";
import type { ListingCardModel } from "@/lib/listings/types";
import { cn } from "@/lib/utils";

export function ListingCard({
  listing,
  compact = false,
}: {
  listing: ListingCardModel;
  compact?: boolean;
}) {
  if (compact) {
    return (
      <Link
        href={`/listings/${listing.id}`}
        className="flex gap-3 rounded-[10px] border border-border bg-card p-0 focus-visible:ring-2 focus-visible:ring-primary"
      >
        <div className="size-[72px] shrink-0 overflow-hidden rounded-[8px] bg-[var(--color-surface-muted)]">
          {listing.imageKey ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={mediaSrc(listing.imageKey)}
              alt=""
              className="size-full object-cover"
            />
          ) : null}
        </div>
        <div className="min-w-0 py-2 pr-3">
          <p className="text-[12px] font-semibold tracking-wide text-[var(--color-text-muted)]">
            {LISTING_TYPE_LABELS[listing.type]} · {LISTING_STATUS_LABELS[listing.status]}
          </p>
          <p className="truncate text-[16px] font-semibold">{listing.title || "Без названия"}</p>
          <p className="truncate text-[13px] text-[var(--color-text-muted)]">
            {listing.districtName}
          </p>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/listings/${listing.id}`}
      className="block overflow-hidden rounded-[10px] border border-border bg-card hover:border-[var(--color-border-strong)] focus-visible:ring-2 focus-visible:ring-primary"
    >
      <div className="relative aspect-[4/3] bg-[var(--color-surface-muted)]">
        {listing.imageKey ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={mediaSrc(listing.imageKey)}
            alt=""
            className="size-full object-cover"
          />
        ) : (
          <span className="absolute inset-0 flex items-center justify-center text-[12px] font-semibold tracking-wide">
            {LISTING_TYPE_LABELS[listing.type]}
          </span>
        )}
      </div>
      <div className="flex flex-col gap-2 p-3 md:p-4">
        <p className="truncate text-[13px] leading-[18px] text-[var(--color-text-muted)]">
          <span className="rounded-[6px] bg-[var(--color-surface-muted)] px-1.5 py-0.5 text-[12px] font-semibold tracking-wide text-foreground">
            {LISTING_TYPE_LABELS[listing.type]}
          </span>
          <span className="ml-2">{listing.districtName}</span>
        </p>
        <h2 className="line-clamp-2 text-[16px] leading-[22px] font-semibold">
          {listing.title}
        </h2>
        {listing.accent ? (
          <p className="text-[16px] leading-[22px] font-bold">{listing.accent}</p>
        ) : null}
        <div className="flex gap-1.5 overflow-hidden">
          {listing.specializationNames.map((name) => (
            <span
              key={name}
              className="h-[22px] shrink-0 rounded-[6px] bg-[var(--color-surface-muted)] px-1.5 text-[12px] leading-[22px] font-semibold"
            >
              {name}
            </span>
          ))}
          {listing.extraCount > 0 ? (
            <span className="text-[12px] leading-[22px] text-[var(--color-text-muted)]">
              +{listing.extraCount}
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}

export function ListingCardGrid({
  items,
  className,
}: {
  items: ListingCardModel[];
  className?: string;
}) {
  return (
    <div className={cn("grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-2", className)}>
      {items.map((listing) => (
        <ListingCard key={listing.id} listing={listing} />
      ))}
    </div>
  );
}
