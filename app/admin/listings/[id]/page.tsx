import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin } from "lucide-react";

import { AdminShell } from "@/components/admin/admin-shell";
import { FlashBanner } from "@/components/admin/flash-banner";
import { ModerationActions } from "@/components/admin/moderation-actions";
import { StatusBadge } from "@/components/admin/status-badge";
import { TypeBadge } from "@/components/admin/type-badge";
import { ListingGallery } from "@/components/listing-gallery";
import { requireAdminPage } from "@/lib/auth/admin-gate";
import {
  EMPLOYMENT_FORMAT_LABELS,
  LISTING_TYPE_LABELS,
  VACANCY_DIRECTION_LABELS,
  WORKSPACE_KIND_LABELS,
} from "@/lib/listings/constants";
import { formatEventWhen, formatPrice } from "@/lib/listings/format";
import {
  formatAbsoluteRu,
  formatRelativeRu,
} from "@/lib/moderation/format";
import { getAdminListingDetail } from "@/lib/moderation/queries";

export default async function AdminListingItemPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; reject?: string }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const admin = await requireAdminPage(`/admin/listings/${id}`);
  const detail = await getAdminListingDetail(id);
  if (!detail) {
    notFound();
  }

  const { listing, details, author, openReports } = detail;
  const facts: { label: string; value: string }[] = [];

  if (details.type === "space") {
    if (details.areaM2) {
      facts.push({ label: "Площадь", value: `${details.areaM2} м²` });
    }
    if (details.workspaceKind) {
      facts.push({
        label: "Вид места",
        value: WORKSPACE_KIND_LABELS[details.workspaceKind],
      });
    }
  }
  if (details.type === "event") {
    if (details.addressText) {
      facts.push({ label: "Адрес", value: details.addressText });
    }
    if (details.capacity) {
      facts.push({ label: "Мест", value: String(details.capacity) });
    }
  }
  if (details.type === "vacancy" && details.employmentFormat) {
    facts.push({
      label: "Формат",
      value: details.employmentNote
        ? `${EMPLOYMENT_FORMAT_LABELS[details.employmentFormat]} · ${details.employmentNote}`
        : EMPLOYMENT_FORMAT_LABELS[details.employmentFormat],
    });
  }

  const staffHandle =
    author.telegramUsername
      ? `@${author.telegramUsername.replace(/^@/, "")}`
      : author.contactTelegram
        ? author.contactTelegram.startsWith("@")
          ? author.contactTelegram
          : `@${author.contactTelegram}`
        : null;

  return (
    <AdminShell current="listings" displayName={admin.displayName}>
      <FlashBanner error={query.error} />
      <Link
        href="/admin/listings"
        className="inline-flex items-center gap-2 text-[15px] text-[var(--color-text-muted)] hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        К очереди
      </Link>

      <div className="mt-6 grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
        <section>
          <p className="mb-3 text-[13px] text-[var(--color-text-muted)]">
            Так увидят в каталоге после публикации. Контакт гостю не показывается.
          </p>
          <ListingGallery
            imageKeys={listing.media.map((item) => item.objectKey)}
            typeLabel={LISTING_TYPE_LABELS[listing.type]}
          />
          <div className="mt-5 rounded-[20px] border border-border bg-[var(--color-surface)] p-5">
            <div className="flex flex-wrap items-center gap-2">
              <TypeBadge type={listing.type} />
              {listing.districtName ? (
                <span className="inline-flex items-center gap-1 text-[13px] text-[var(--color-text-muted)]">
                  <MapPin className="size-3.5" />
                  {listing.districtName}
                </span>
              ) : null}
            </div>
            <h1 className="font-display mt-3 text-[32px] leading-[36px] font-semibold tracking-[-0.03em]">
              {listing.title}
            </h1>
            {details.type === "space" ? (
              <p className="mt-3 text-[22px] font-bold text-primary">
                {formatPrice(details.priceAmount, details.pricePeriod)}
              </p>
            ) : null}
            {details.type === "event" ? (
              <>
                {details.startsAt ? (
                  <p className="mt-3 text-[22px] font-bold text-primary">
                    {formatEventWhen(details.startsAt)}
                  </p>
                ) : null}
                <p className="mt-1 text-[15px] font-semibold">
                  {details.priceAmount == null
                    ? "Бесплатно"
                    : formatPrice(details.priceAmount, "event_ticket")}
                </p>
              </>
            ) : null}
            {details.type === "vacancy" && details.direction ? (
              <p className="mt-3 text-[22px] font-bold text-primary">
                {VACANCY_DIRECTION_LABELS[details.direction]}
              </p>
            ) : null}
            {listing.description ? (
              <p className="mt-4 whitespace-pre-wrap text-[15px] leading-[22px] text-[var(--color-text-muted)]">
                {listing.description}
              </p>
            ) : null}
            {facts.length > 0 ? (
              <dl className="mt-4 grid grid-cols-2 gap-2">
                {facts.map((fact) => (
                  <div
                    key={fact.label}
                    className="rounded-[14px] bg-[var(--color-bg)] px-3 py-3"
                  >
                    <dt className="text-[12px] font-medium tracking-[0.08em] text-[var(--color-text-muted)] uppercase">
                      {fact.label}
                    </dt>
                    <dd className="mt-1 text-[15px] font-semibold">{fact.value}</dd>
                  </div>
                ))}
              </dl>
            ) : null}
            {listing.specializationNames.length > 0 ? (
              <div className="mt-4 flex flex-wrap gap-1.5">
                {listing.specializationNames.map((name) => (
                  <span
                    key={name}
                    className="rounded-full bg-[var(--color-accent-subtle)] px-2.5 py-1 text-[12px] font-semibold text-primary"
                  >
                    {name}
                  </span>
                ))}
              </div>
            ) : null}
            <div className="mt-5 border-t border-border pt-4">
              <p className="text-[12px] font-medium tracking-[0.1em] text-[var(--color-text-muted)] uppercase">
                Автор (публично)
              </p>
              <p className="mt-1 text-[16px] font-semibold">{author.displayName}</p>
              <p className="text-[13px] text-[var(--color-text-muted)]">
                {author.roleLabel}
              </p>
            </div>
          </div>
        </section>

        <aside className="space-y-4 lg:sticky lg:top-24">
          <div className="rounded-[20px] border border-border bg-[var(--color-surface)] p-5">
            <StatusBadge status={listing.status} />
            <p className="mt-3 text-[13px] text-[var(--color-text-muted)]">
              Подано {formatAbsoluteRu(listing.createdAt)} ·{" "}
              {formatRelativeRu(listing.createdAt)}
            </p>
            <p className="mt-1 font-mono text-[12px] text-[var(--color-text-muted)]">
              id {author.id}
            </p>
            <p className="mt-2 text-[16px] font-semibold">{author.displayName}</p>
            <p className="text-[13px] text-[var(--color-text-muted)]">
              {author.roleLabel}
            </p>

            <div className="mt-4 rounded-[10px] bg-[var(--color-surface-muted)] p-3">
              <p className="text-[12px] text-[var(--color-text-muted)]">
                Только модерация. Не копировать в публичный preview.
              </p>
              <p className="mt-1 text-[15px] font-semibold">
                {staffHandle ?? "Telegram не указан"}
              </p>
              {author.contactPhone ? (
                <p className="mt-1 text-[14px]">{author.contactPhone}</p>
              ) : null}
            </div>

            <div className="mt-4">
              <p className="text-[13px] font-medium text-[var(--color-text-muted)]">
                Жалобы
              </p>
              {openReports.length === 0 ? (
                <p className="mt-1 text-[14px]">Жалоб нет</p>
              ) : (
                <ul className="mt-2 space-y-2">
                  {openReports.map((report) => (
                    <li key={report.id}>
                      <Link
                        href={`/admin/reports/${report.id}`}
                        className="block rounded-[10px] bg-[var(--color-warning-bg)] px-3 py-2 text-[14px] text-[var(--color-warning)] hover:opacity-90"
                      >
                        {report.reasonLabel} · {formatRelativeRu(report.createdAt)}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="rounded-[20px] border border-border bg-[var(--color-surface)] p-5">
            <ModerationActions
              listingId={listing.id}
              status={listing.status}
              rejectionReason={listing.rejectionReason}
              forceRejectOpen={query.reject === "1"}
              reasonError={query.error === "reason_required"}
            />
          </div>
        </aside>
      </div>
    </AdminShell>
  );
}
