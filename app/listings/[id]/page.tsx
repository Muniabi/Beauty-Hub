import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin } from "lucide-react";

import { archiveListingAction, submitListingAction } from "@/app/actions/listings";
import { AuthorContactButtons } from "@/components/author-contact-buttons";
import { AppShell } from "@/components/app-shell";
import { ListingGallery } from "@/components/listing-gallery";
import { Button } from "@/components/ui/button";
import { getSessionUser } from "@/lib/auth/current-user";
import {
  EMPLOYMENT_FORMAT_LABELS,
  LISTING_STATUS_LABELS,
  LISTING_TYPE_LABELS,
  VACANCY_DIRECTION_LABELS,
  WORKSPACE_KIND_LABELS,
} from "@/lib/listings/constants";
import { formatEventWhen, formatPrice } from "@/lib/listings/format";
import { canOwnerEdit } from "@/lib/listings/lifecycle";
import { getListingForViewer } from "@/lib/listings/queries";
import type { ListingView } from "@/lib/listings/types";

function ContactCta({
  listing,
  completed,
  signedIn,
}: {
  listing: ListingView;
  completed: boolean;
  signedIn: boolean;
}) {
  const next = `/listings/${listing.id}`;
  if (listing.isExpired) {
    return (
      <Button asChild variant="secondary" className="w-full">
        <Link href="/search">К поиску</Link>
      </Button>
    );
  }
  if (listing.isOwner) {
    return (
      <p className="text-[15px] leading-[22px] text-[var(--color-text-muted)]">
        Это ваше объявление. Отклики придут вам в Telegram.
      </p>
    );
  }
  if (signedIn && !completed) {
    return (
      <Button asChild className="w-full">
        <Link href={`/onboarding/role?next=${encodeURIComponent(next)}`}>
          Завершить профиль, чтобы написать
        </Link>
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
    <AuthorContactButtons
      listingId={listing.id}
      hasPhone={listing.author.hasPhone}
    />
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[14px] bg-[var(--color-bg)] px-3 py-3">
      <dt className="text-[12px] font-medium tracking-[0.08em] text-[var(--color-text-muted)] uppercase">
        {label}
      </dt>
      <dd className="mt-1 text-[15px] font-semibold">{value}</dd>
    </div>
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
  const facts: { label: string; value: string }[] = [];

  if (listing.details.type === "space") {
    if (listing.details.areaM2) {
      facts.push({ label: "Площадь", value: `${listing.details.areaM2} м²` });
    }
    if (listing.details.workspaceKind) {
      facts.push({
        label: "Вид места",
        value: WORKSPACE_KIND_LABELS[listing.details.workspaceKind],
      });
    }
  }
  if (listing.details.type === "event") {
    if (listing.details.addressText) {
      facts.push({ label: "Адрес", value: listing.details.addressText });
    }
    if (listing.details.capacity) {
      facts.push({ label: "Мест", value: String(listing.details.capacity) });
    }
  }
  if (listing.details.type === "vacancy" && listing.details.employmentFormat) {
    facts.push({
      label: "Формат",
      value: listing.details.employmentNote
        ? `${EMPLOYMENT_FORMAT_LABELS[listing.details.employmentFormat]} · ${listing.details.employmentNote}`
        : EMPLOYMENT_FORMAT_LABELS[listing.details.employmentFormat],
    });
  }

  return (
    <AppShell current="/search">
      <article className="mx-auto max-w-5xl md:grid md:grid-cols-[1.15fr_0.85fr] md:items-start md:gap-10">
        <div>
          <Link
            href="/search"
            className="inline-flex items-center gap-2 text-[15px] text-[var(--color-text-muted)] transition hover:text-foreground"
          >
            <ArrowLeft className="size-4" strokeWidth={1.75} />
            К поиску
          </Link>
          <div className="mt-4">
            <ListingGallery
              imageKeys={listing.imageKeys}
              typeLabel={LISTING_TYPE_LABELS[listing.type]}
            />
          </div>
        </div>

        <div className="mt-6 space-y-4 md:sticky md:top-24 md:mt-10">
          {listing.isOwner && listing.status !== "published" ? (
            <p className="rounded-[16px] bg-[var(--color-warning-bg)] px-4 py-3 text-[15px] text-[var(--color-warning)]">
              {listing.status === "rejected"
                ? `Не опубликовано. Причина: ${listing.rejectionReason ?? "—"}`
                : listing.status === "pending"
                  ? "На проверке. Обычно в течение 24 часов."
                  : LISTING_STATUS_LABELS[listing.status]}
            </p>
          ) : null}
          {expired ? (
            <p className="rounded-[16px] bg-[var(--color-danger-bg)] px-4 py-3 text-[15px] text-[var(--color-danger)]">
              {listing.type === "event"
                ? "Мероприятие уже прошло, поэтому его нет в каталоге и поиске."
                : "Объявление неактуально."}
            </p>
          ) : null}

          <section className="rounded-[20px] border border-border bg-card p-5 md:p-6">
            <p className="flex items-center gap-2 text-[13px] font-medium tracking-[0.12em] text-primary uppercase">
              {LISTING_TYPE_LABELS[listing.type]}
              {listing.districtName ? (
                <span className="inline-flex items-center gap-1 font-medium tracking-normal text-[var(--color-text-muted)] normal-case">
                  <MapPin className="size-3.5" strokeWidth={1.75} />
                  {listing.districtName}
                </span>
              ) : null}
            </p>
            <h1 className="font-display mt-2 text-[32px] leading-[36px] font-semibold tracking-[-0.03em] md:text-[40px] md:leading-[44px]">
              {listing.title}
            </h1>
            {listing.details.type === "space" ? (
              <p className="mt-4 text-[22px] font-bold text-primary">
                {formatPrice(listing.details.priceAmount, listing.details.pricePeriod)}
              </p>
            ) : null}
            {listing.details.type === "event" ? (
              <>
                {listing.details.startsAt ? (
                  <p className="mt-4 text-[22px] font-bold text-primary">
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
              <p className="mt-4 text-[22px] font-bold text-primary">
                {VACANCY_DIRECTION_LABELS[listing.details.direction]}
              </p>
            ) : null}

            {listing.description ? (
              <p className="mt-5 whitespace-pre-wrap text-[15px] leading-[22px] text-[var(--color-text-muted)]">
                {listing.description}
              </p>
            ) : null}

            {facts.length > 0 ? (
              <dl className={`mt-5 grid gap-2 ${facts.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
                {facts.map((fact) => (
                  <Fact key={fact.label} label={fact.label} value={fact.value} />
                ))}
              </dl>
            ) : null}

            {listing.specializationNames.length > 0 ? (
              <div className="mt-5 flex flex-wrap gap-1.5">
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

            {listing.details.type === "event" && listing.details.externalUrl ? (
              <Button asChild variant="secondary" className="mt-5 w-full">
                <a href={listing.details.externalUrl} rel="noreferrer" target="_blank">
                  Регистрация на мероприятие
                </a>
              </Button>
            ) : null}
          </section>

          <section className="rounded-[20px] border border-border bg-card p-5">
            <div className="flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-full bg-[var(--color-accent-subtle)] text-[18px] font-semibold text-primary">
                {(listing.author.displayName || "А").slice(0, 1)}
              </div>
              <div>
                <p className="text-[12px] font-medium tracking-[0.1em] text-[var(--color-text-muted)] uppercase">
                  Автор объявления
                </p>
                <p className="text-[16px] font-semibold">{listing.author.displayName}</p>
                <p className="text-[13px] text-[var(--color-text-muted)]">
                  {listing.author.roleLabel}
                </p>
              </div>
            </div>
            <div className="mt-5">
              <ContactCta
                listing={listing}
                completed={Boolean(user?.profileCompleted)}
                signedIn={Boolean(user)}
              />
            </div>
          </section>

          {listing.isOwner ? (
            <section className="rounded-[20px] border border-border bg-card p-5">
              <p className="text-[13px] font-medium tracking-[0.12em] text-primary uppercase">
                Управление
              </p>
              <div className="mt-3 flex flex-col gap-3">
                {canOwnerEdit(listing.status) ? (
                  <Button asChild variant="secondary" className="w-full">
                    <Link href={`/listings/${listing.id}/edit`}>Редактировать</Link>
                  </Button>
                ) : null}
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
            </section>
          ) : null}
        </div>
      </article>
    </AppShell>
  );
}
