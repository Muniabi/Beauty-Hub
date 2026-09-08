import Link from "next/link";
import { notFound } from "next/navigation";

import { archiveListingAction, submitListingAction } from "@/app/actions/listings";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { getSessionUser } from "@/lib/auth/current-user";
import {
  EMPLOYMENT_FORMAT_LABELS,
  LISTING_STATUS_LABELS,
  LISTING_TYPE_LABELS,
  VACANCY_DIRECTION_LABELS,
  WORKSPACE_KIND_LABELS,
} from "@/lib/listings/constants";
import { formatEventWhen, formatPrice, mediaSrc } from "@/lib/listings/format";
import { getListingForViewer } from "@/lib/listings/queries";
import type { ListingView } from "@/lib/listings/types";

function ContactCta({ listing, completed }: { listing: ListingView; completed: boolean }) {
  const next = `/listings/${listing.id}`;
  if (listing.isExpired) {
    return (
      <Button asChild variant="secondary" className="w-full">
        <Link href="/search">К поиску</Link>
      </Button>
    );
  }
  if (!completed) {
    return (
      <Button asChild className="w-full">
        <Link href={`/login?next=${encodeURIComponent(next)}`}>
          Войти, чтобы написать
        </Link>
      </Button>
    );
  }
  return (
    <Button type="button" className="w-full" disabled>
      Написать в Telegram
    </Button>
  );
}

export default async function ListingDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getSessionUser();
  const result = await getListingForViewer(id, user?.id ?? null);

  if (result.kind === "missing") {
    notFound();
  }

  const listing = result.listing;
  const expired = result.kind === "expired" || listing.isExpired;

  return (
    <AppShell current="/search">
      <article className="mx-auto max-w-3xl md:grid md:grid-cols-[1.2fr_0.9fr] md:gap-10">
        <div>
          <Link href="/search" className="text-[15px] text-[var(--color-text-muted)]">
            ← Назад
          </Link>
          <div className="mt-4 overflow-hidden rounded-[10px] bg-[var(--color-surface-muted)]">
            {listing.imageKeys[0] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={mediaSrc(listing.imageKeys[0])}
                alt="фото объявления"
                className="aspect-[4/3] w-full object-cover"
              />
            ) : (
              <div className="flex aspect-[4/3] items-center justify-center text-[13px] font-semibold">
                {LISTING_TYPE_LABELS[listing.type]}
              </div>
            )}
          </div>
          {listing.imageKeys.length > 1 ? (
            <div className="mt-3 flex gap-2 overflow-x-auto">
              {listing.imageKeys.slice(1).map((key) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={key}
                  src={mediaSrc(key)}
                  alt=""
                  className="h-20 w-[107px] shrink-0 rounded-[8px] object-cover"
                />
              ))}
            </div>
          ) : null}
        </div>
        <div className="mt-6 md:mt-10">
          {listing.isOwner && listing.status !== "published" ? (
            <p className="mb-4 rounded-[10px] bg-[var(--color-warning-bg)] px-3 py-2 text-[15px] text-[var(--color-warning)]">
              {listing.status === "rejected"
                ? `Не опубликовано. Причина: ${listing.rejectionReason ?? "—"}`
                : listing.status === "pending"
                  ? "На проверке. Обычно в течение 24 часов."
                  : LISTING_STATUS_LABELS[listing.status]}
            </p>
          ) : null}
          {expired ? (
            <p className="mb-4 text-[15px] text-[var(--color-danger)]">
              Объявление неактуально.
            </p>
          ) : null}
          <p className="text-[13px] font-semibold tracking-wide text-[var(--color-text-muted)]">
            {LISTING_TYPE_LABELS[listing.type]}
            {listing.districtName ? ` · ${listing.districtName}` : ""}
          </p>
          <h1 className="mt-2 text-[20px] leading-[26px] font-semibold md:text-[24px] md:leading-[30px]">
            {listing.title}
          </h1>
          {listing.details.type === "space" ? (
            <p className="mt-4 text-[18px] font-bold">
              {formatPrice(listing.details.priceAmount, listing.details.pricePeriod)}
            </p>
          ) : null}
          {listing.details.type === "event" ? (
            <>
              {listing.details.startsAt ? (
                <p className="mt-4 text-[18px] font-bold">
                  {formatEventWhen(listing.details.startsAt)}
                </p>
              ) : null}
              <p className="mt-1 text-[15px] font-semibold">
                {listing.details.priceAmount == null
                  ? "Бесплатно"
                  : formatPrice(listing.details.priceAmount, "event_ticket")}
              </p>
            </>
          ) : null}
          {listing.details.type === "vacancy" && listing.details.direction ? (
            <p className="mt-4 text-[18px] font-bold">
              {VACANCY_DIRECTION_LABELS[listing.details.direction]}
            </p>
          ) : null}
          <p className="mt-6 whitespace-pre-wrap text-[15px] leading-[22px]">
            {listing.description}
          </p>
          {listing.details.type === "space" ? (
            <dl className="mt-6 space-y-2 text-[15px]">
              {listing.details.areaM2 ? (
                <div>
                  <dt className="text-[13px] text-[var(--color-text-muted)]">Площадь</dt>
                  <dd className="font-semibold">{listing.details.areaM2} м²</dd>
                </div>
              ) : null}
              {listing.details.workspaceKind ? (
                <div>
                  <dt className="text-[13px] text-[var(--color-text-muted)]">Вид места</dt>
                  <dd className="font-semibold">
                    {WORKSPACE_KIND_LABELS[listing.details.workspaceKind]}
                  </dd>
                </div>
              ) : null}
            </dl>
          ) : null}
          {listing.details.type === "event" ? (
            <dl className="mt-6 space-y-2 text-[15px]">
              {listing.details.addressText ? (
                <div>
                  <dt className="text-[13px] text-[var(--color-text-muted)]">Адрес</dt>
                  <dd className="font-semibold">{listing.details.addressText}</dd>
                </div>
              ) : null}
              {listing.details.capacity ? (
                <div>
                  <dt className="text-[13px] text-[var(--color-text-muted)]">Мест</dt>
                  <dd className="font-semibold">{listing.details.capacity}</dd>
                </div>
              ) : null}
              {listing.details.externalUrl ? (
                <div>
                  <dt className="text-[13px] text-[var(--color-text-muted)]">Регистрация</dt>
                  <dd>
                    <a href={listing.details.externalUrl} className="font-semibold text-primary">
                      Ссылка
                    </a>
                  </dd>
                </div>
              ) : null}
            </dl>
          ) : null}
          {listing.details.type === "vacancy" ? (
            <dl className="mt-6 space-y-2 text-[15px]">
              {listing.details.employmentFormat ? (
                <div>
                  <dt className="text-[13px] text-[var(--color-text-muted)]">Формат</dt>
                  <dd className="font-semibold">
                    {EMPLOYMENT_FORMAT_LABELS[listing.details.employmentFormat]}
                    {listing.details.employmentNote
                      ? ` · ${listing.details.employmentNote}`
                      : ""}
                  </dd>
                </div>
              ) : null}
            </dl>
          ) : null}
          <div className="mt-4 flex flex-wrap gap-1.5">
            {listing.specializationNames.map((name) => (
              <span
                key={name}
                className="rounded-[6px] bg-[var(--color-surface-muted)] px-2 py-1 text-[12px] font-semibold"
              >
                {name}
              </span>
            ))}
          </div>
          <div className="mt-8 rounded-[10px] bg-[var(--color-surface-muted)] p-3">
            <p className="font-semibold">{listing.author.displayName}</p>
            <p className="text-[13px] text-[var(--color-text-muted)]">
              {listing.author.roleLabel}
            </p>
          </div>
          <div className="mt-6">
            {user && !user.profileCompleted && !expired ? (
              <Button asChild className="w-full">
                <Link href={`/onboarding/role?next=${encodeURIComponent(`/listings/${listing.id}`)}`}>
                  Завершить профиль, чтобы написать
                </Link>
              </Button>
            ) : (
              <ContactCta listing={listing} completed={Boolean(user?.profileCompleted)} />
            )}
          </div>
          {listing.isOwner ? (
            <div className="mt-6 flex flex-col gap-3">
              {listing.status === "draft" || listing.status === "rejected" ? (
                <form action={submitListingAction}>
                  <input type="hidden" name="id" value={listing.id} />
                  <Button type="submit" variant="secondary" className="w-full">
                    Отправить на проверку
                  </Button>
                </form>
              ) : null}
              <form action={archiveListingAction}>
                <input type="hidden" name="id" value={listing.id} />
                <Button type="submit" variant="ghost" className="w-full">
                  В архив
                </Button>
              </form>
            </div>
          ) : null}
        </div>
      </article>
    </AppShell>
  );
}
