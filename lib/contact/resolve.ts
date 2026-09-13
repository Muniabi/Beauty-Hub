import type { ListingStatus, ListingType, UserStatus } from "@/lib/domain";
import {
  authorTelegramHandle,
  phoneHref,
  telegramChatHref,
} from "@/lib/contact/href";
import {
  isExpiredForViewer,
  isPubliclyVisible,
} from "@/lib/listings/visibility";

export type ContactViewer = {
  id: string;
  profileCompleted: boolean;
};

export type ContactListing = {
  exists: boolean;
  status: ListingStatus;
  type: ListingType;
  expiresAt: Date | null;
  eventStartsAt?: Date | null;
  authorId: string;
};

export type ContactAuthor = {
  status: UserStatus;
  contactTelegram: string;
  telegramUsername?: string | null;
  contactPhone: string | null;
};

export type ContactFailureReason =
  | "unauthorized"
  | "forbidden"
  | "not_found"
  | "expired"
  | "own_listing"
  | "unavailable";

export type ContactReveal =
  | {
      ok: true;
      telegram: string;
      telegramHref: string;
      phone: string | null;
      phoneHref: string | null;
    }
  | { ok: false; reason: ContactFailureReason };

export function resolveContactReveal(input: {
  viewer: ContactViewer | null;
  listing: ContactListing | null;
  author: ContactAuthor | null;
  now?: Date;
}): ContactReveal {
  if (!input.viewer) {
    return { ok: false, reason: "unauthorized" };
  }
  if (!input.viewer.profileCompleted) {
    return { ok: false, reason: "forbidden" };
  }
  if (!input.listing?.exists) {
    return { ok: false, reason: "not_found" };
  }

  const now = input.now ?? new Date();
  if (input.viewer.id === input.listing.authorId) {
    return { ok: false, reason: "own_listing" };
  }

  if (
    isExpiredForViewer({
      status: input.listing.status,
      type: input.listing.type,
      expiresAt: input.listing.expiresAt,
      eventStartsAt: input.listing.eventStartsAt,
      now,
    })
  ) {
    return { ok: false, reason: "expired" };
  }

  if (
    !isPubliclyVisible({
      status: input.listing.status,
      type: input.listing.type,
      expiresAt: input.listing.expiresAt,
      eventStartsAt: input.listing.eventStartsAt,
      now,
    })
  ) {
    return { ok: false, reason: "not_found" };
  }

  if (!input.author || input.author.status !== "active") {
    return { ok: false, reason: "unavailable" };
  }

  const telegram = authorTelegramHandle(input.author);
  const href = telegramChatHref(telegram);
  if (!telegram || !href) {
    return { ok: false, reason: "unavailable" };
  }

  const phone = input.author.contactPhone?.trim() || null;
  return {
    ok: true,
    telegram,
    telegramHref: href,
    phone,
    phoneHref: phone ? phoneHref(phone) : null,
  };
}
