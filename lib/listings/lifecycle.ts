import type { ListingStatus } from "@/lib/domain";

import { LISTING_TTL_DAYS } from "@/lib/listings/constants";

export function expiresAtFromPublish(publishedAt: Date): Date {
  const expires = new Date(publishedAt);
  expires.setUTCDate(expires.getUTCDate() + LISTING_TTL_DAYS);
  return expires;
}

export function nextStatusAfterSave(input: {
  current: ListingStatus;
  saveDraft: boolean;
  validForPending: boolean;
}): ListingStatus {
  if (input.saveDraft) {
    if (input.current === "published") {
      return "pending";
    }
    return input.current === "pending" ? "pending" : "draft";
  }

  if (!input.validForPending) {
    throw new Error("VALIDATION");
  }

  if (input.current === "archived" || input.current === "expired") {
    throw new Error("CONFLICT");
  }

  return "pending";
}

export function assertClientCannotSetStatus(payload: { status?: unknown }) {
  if (payload.status !== undefined) {
    throw new Error("FORBIDDEN");
  }
}

export function canOwnerMutate(status: ListingStatus): boolean {
  return status !== "archived";
}
