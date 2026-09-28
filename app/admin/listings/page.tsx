import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { AdminShell } from "@/components/admin/admin-shell";
import { FlashBanner } from "@/components/admin/flash-banner";
import { SegmentedFilter } from "@/components/admin/segmented-filter";
import { StatusBadge } from "@/components/admin/status-badge";
import { TypeBadge } from "@/components/admin/type-badge";
import { Button } from "@/components/ui/button";
import { requireAdminPage } from "@/lib/auth/admin-gate";
import { mediaSrc } from "@/lib/listings/format";
import {
  ADMIN_PAGE_SIZE,
  QUEUE_STATUS_FILTERS,
  QUEUE_STATUS_LABELS,
  isQueueStatusFilter,
  type QueueStatusFilter,
} from "@/lib/moderation/constants";
import { formatRelativeRu } from "@/lib/moderation/format";
import { listAdminQueue } from "@/lib/moderation/queries";

export default async function AdminQueuePage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; offset?: string; toast?: string; error?: string }>;
}) {
  const admin = await requireAdminPage("/admin/listings");
  const params = await searchParams;
  const status: QueueStatusFilter = isQueueStatusFilter(params.status ?? "")
    ? (params.status as QueueStatusFilter)
    : "pending";
  const offset = Math.max(0, Number(params.offset ?? "0") || 0);
  const { items, total } = await listAdminQueue({ status, offset });
  const hasMore = offset + items.length < total;

  return (
    <AdminShell current="listings" displayName={admin.displayName}>
      <FlashBanner toast={params.toast} error={params.error} />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-[24px] leading-[30px] font-semibold tracking-[-0.01em]">
            Очередь
          </h1>
          <p className="mt-1 text-[13px] text-[var(--color-text-muted)]">
            Сначала старые. Без массового одобрения.
          </p>
        </div>
        <SegmentedFilter
          basePath="/admin/listings"
          value={status}
          options={QUEUE_STATUS_FILTERS.map((value) => ({
            value,
            label: QUEUE_STATUS_LABELS[value],
          }))}
        />
      </div>

      {items.length === 0 ? (
        <div className="mt-16 text-center text-[15px] text-[var(--color-text-muted)]">
          {status === "pending"
            ? "Очередь пуста"
            : "Нет объявлений в этом статусе"}
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-[16px] border border-border bg-[var(--color-surface)]">
          <ul className="divide-y divide-border">
            {items.map((row) => (
              <li key={row.id}>
                <Link
                  href={`/admin/listings/${row.id}`}
                  className="flex items-center gap-3 px-3 py-3 transition hover:bg-[var(--color-surface-muted)] md:gap-4 md:px-4"
                >
                  <div className="size-[72px] shrink-0 overflow-hidden rounded-[8px] bg-[var(--color-surface-muted)]">
                    {row.imageKey ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={mediaSrc(row.imageKey)}
                        alt=""
                        className="size-full object-cover"
                      />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <TypeBadge type={row.type} />
                      {status !== "pending" ? (
                        <StatusBadge status={row.status} />
                      ) : null}
                    </div>
                    <p className="mt-1 truncate text-[16px] font-semibold">
                      {row.title || "Без названия"}
                    </p>
                    <p className="truncate text-[13px] text-[var(--color-text-muted)]">
                      {row.districtName || "Район не указан"} · {row.authorName} ·{" "}
                      {formatRelativeRu(row.createdAt)}
                    </p>
                  </div>
                  <div className="hidden shrink-0 text-right sm:block">
                    <p
                      className={
                        row.openReports > 0
                          ? "text-[13px] font-semibold text-[var(--color-warning)]"
                          : "text-[13px] text-[var(--color-text-muted)]"
                      }
                    >
                      {row.openReports > 0
                        ? `Жалобы: ${row.openReports}`
                        : "—"}
                    </p>
                  </div>
                  <ChevronRight className="size-5 shrink-0 text-[var(--color-text-muted)]" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {hasMore ? (
        <div className="mt-6 flex justify-center">
          <Button asChild variant="secondary">
            <Link
              href={`/admin/listings?status=${status}&offset=${offset + ADMIN_PAGE_SIZE}`}
            >
              Показать ещё
            </Link>
          </Button>
        </div>
      ) : null}
    </AdminShell>
  );
}
