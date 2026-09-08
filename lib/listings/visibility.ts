import type { ListingStatus, ListingType } from "@/lib/domain";

import { MOSCOW_TZ } from "@/lib/listings/constants";

const HIDDEN_FROM_CATALOG: ListingStatus[] = [
  "draft",
  "pending",
  "rejected",
  "expired",
  "archived",
];

export function startOfTodayMoscow(now = new Date()): Date {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: MOSCOW_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;
  return new Date(`${year}-${month}-${day}T00:00:00+03:00`);
}

export function isEventCurrent(startsAt: Date, now = new Date()): boolean {
  return startsAt.getTime() >= startOfTodayMoscow(now).getTime();
}

export function isPastExpiry(expiresAt: Date | null, now = new Date()): boolean {
  return Boolean(expiresAt && expiresAt.getTime() <= now.getTime());
}

export function isPubliclyVisible(input: {
  status: ListingStatus;
  type: ListingType;
  expiresAt: Date | null;
  eventStartsAt?: Date | null;
  now?: Date;
}): boolean {
  const now = input.now ?? new Date();
  if (input.status !== "published") {
    return false;
  }
  if (HIDDEN_FROM_CATALOG.includes(input.status)) {
    return false;
  }
  if (isPastExpiry(input.expiresAt, now)) {
    return false;
  }
  if (input.type === "event") {
    if (!input.eventStartsAt) {
      return false;
    }
    return isEventCurrent(input.eventStartsAt, now);
  }
  return true;
}

export function isExpiredForViewer(input: {
  status: ListingStatus;
  type: ListingType;
  expiresAt: Date | null;
  eventStartsAt?: Date | null;
  now?: Date;
}): boolean {
  const now = input.now ?? new Date();
  if (input.status === "expired") {
    return true;
  }
  if (input.status === "published" && isPastExpiry(input.expiresAt, now)) {
    return true;
  }
  if (
    input.status === "published" &&
    input.type === "event" &&
    input.eventStartsAt &&
    !isEventCurrent(input.eventStartsAt, now)
  ) {
    return true;
  }
  return false;
}

export function canOwnerView(status: ListingStatus): boolean {
  return (
    status === "draft" ||
    status === "pending" ||
    status === "rejected" ||
    status === "published" ||
    status === "expired" ||
    status === "archived"
  );
}

export function guestSeesUnpublishedAsMissing(status: ListingStatus): boolean {
  return (
    status === "draft" ||
    status === "pending" ||
    status === "rejected" ||
    status === "archived"
  );
}

export function assertOwner(authorId: string, actorId: string | null) {
  if (!actorId || actorId !== authorId) {
    throw new Error("FORBIDDEN");
  }
}

export const LISTING_ID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isListingId(id: string): boolean {
  return LISTING_ID_PATTERN.test(id);
}

export type ListingAccessKind = "missing" | "expired" | "ok";

export function resolveListingAccess(input: {
  exists: boolean;
  status: ListingStatus;
  type: ListingType;
  expiresAt: Date | null;
  eventStartsAt?: Date | null;
  authorId: string;
  viewerId: string | null;
  now?: Date;
}): ListingAccessKind {
  if (!input.exists) {
    return "missing";
  }

  const now = input.now ?? new Date();
  const expired = isExpiredForViewer({
    status: input.status,
    type: input.type,
    expiresAt: input.expiresAt,
    eventStartsAt: input.eventStartsAt,
    now,
  });

  if (expired) {
    return "expired";
  }

  if (
    isPubliclyVisible({
      status: input.status,
      type: input.type,
      expiresAt: input.expiresAt,
      eventStartsAt: input.eventStartsAt,
      now,
    })
  ) {
    return "ok";
  }

  if (input.viewerId === input.authorId) {
    return "ok";
  }

  return "missing";
}
