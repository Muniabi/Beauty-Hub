import { LISTING_TYPE_LABELS } from "@/lib/listings/constants";
import type { ListingType } from "@/lib/domain";

export function TypeBadge({ type }: { type: ListingType }) {
  return (
    <span className="inline-flex rounded-md bg-[var(--color-accent-subtle)] px-2 py-0.5 text-[12px] font-semibold tracking-[0.02em] text-primary">
      {LISTING_TYPE_LABELS[type]}
    </span>
  );
}
