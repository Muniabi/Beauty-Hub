import { consumeRateLimit } from "@/lib/auth/rate-limit";
import { recordAnalyticsEvent } from "@/lib/analytics/record";
import {
  resolveContactReveal,
  type ContactFailureReason,
  type ContactReveal,
} from "@/lib/contact/resolve";
import { findUserById } from "@/lib/db/users";
import { isDatabaseUnavailable, isMongoConfigured, listingsCollection } from "@/lib/db/mongo";
import { isListingId } from "@/lib/listings/visibility";

export const CONTACT_RATE_LIMIT_MAX = 30;
export const CONTACT_RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;

export type ContactTarget = "telegram" | "phone";

export type GetContactResult =
  | Extract<ContactReveal, { ok: true }>
  | { ok: false; reason: ContactFailureReason | "rate_limited" };

export async function getListingContact(input: {
  listingId: string;
  viewerId: string | null;
  profileCompleted: boolean;
  target?: ContactTarget;
}): Promise<GetContactResult> {
  if (!input.viewerId) {
    return { ok: false, reason: "unauthorized" };
  }

  if (
    !consumeRateLimit({
      key: `contact:${input.viewerId}`,
      limit: CONTACT_RATE_LIMIT_MAX,
      windowMs: CONTACT_RATE_LIMIT_WINDOW_MS,
    })
  ) {
    return { ok: false, reason: "rate_limited" };
  }

  if (!isListingId(input.listingId) || !isMongoConfigured()) {
    return { ok: false, reason: "not_found" };
  }

  try {
    const listing = await (await listingsCollection()).findOne({
      _id: input.listingId,
    });
    const author = listing ? await findUserById(listing.authorId) : null;
    const revealed = resolveContactReveal({
      viewer: {
        id: input.viewerId,
        profileCompleted: input.profileCompleted,
      },
      listing: listing
        ? {
            exists: true,
            status: listing.status,
            type: listing.type,
            expiresAt: listing.expiresAt,
            eventStartsAt: listing.eventDetails?.startsAt ?? null,
            authorId: listing.authorId,
          }
        : null,
      author: author
        ? {
            status: author.status,
            contactTelegram: author.profile.contactTelegram ?? "",
            telegramUsername: author.telegram?.username ?? null,
            contactPhone: author.profile.contactPhone ?? null,
          }
        : null,
    });

    if (!revealed.ok) {
      return revealed;
    }

    await recordAnalyticsEvent({
      name: "contact_clicked",
      userId: input.viewerId,
      listingId: input.listingId,
      listingType: listing?.type ?? null,
      target: input.target ?? "telegram",
    });

    return revealed;
  } catch (error) {
    if (isDatabaseUnavailable(error)) {
      return { ok: false, reason: "not_found" };
    }
    throw error;
  }
}
