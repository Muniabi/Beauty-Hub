import { LISTING_STATUS_LABELS } from "@/lib/listings/constants";
import type { ListingStatus } from "@/lib/domain";
import { cn } from "@/lib/utils";

const STYLES: Partial<Record<ListingStatus, string>> = {
  pending: "bg-[var(--color-warning-bg)] text-[var(--color-warning)]",
  published: "bg-[var(--color-success-bg)] text-[var(--color-success)]",
  rejected: "bg-[var(--color-danger-bg)] text-[var(--color-danger)]",
  archived: "bg-[var(--color-surface-muted)] text-[var(--color-text-muted)]",
  expired: "bg-[var(--color-surface-muted)] text-[var(--color-text-muted)]",
  draft: "bg-[var(--color-surface-muted)] text-[var(--color-text-muted)]",
};

export function StatusBadge({ status }: { status: ListingStatus }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-md px-2 py-0.5 text-[12px] font-semibold tracking-[0.02em]",
        STYLES[status] ?? STYLES.draft,
      )}
    >
      {LISTING_STATUS_LABELS[status]}
    </span>
  );
}
