import { safeNext } from "@/lib/auth/safe-next";

const LISTING_COMPACT = /^l_([0-9a-f]{32})$/i;
const START_TOKEN = /^[A-Za-z0-9_-]{1,64}$/;

function uuidFromCompact(hex: string): string {
  const h = hex.toLowerCase();
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

export function compactListingStartParam(listingId: string): string {
  return `l_${listingId.replace(/-/g, "")}`;
}

/**
 * Maps Telegram start / startapp payloads onto internal paths.
 * startapp only allows A-Z a-z 0-9 _ - so listing ids are compact UUIDs.
 */
export function parseTelegramStartParam(
  raw: string | null | undefined,
): string {
  if (!raw) {
    return "/";
  }

  const value = raw.trim();
  if (!value || !START_TOKEN.test(value)) {
    return "/";
  }

  const listing = value.match(LISTING_COMPACT);
  if (listing?.[1]) {
    return `/listings/${uuidFromCompact(listing[1])}`;
  }

  switch (value) {
    case "home":
      return "/";
    case "search":
      return "/search";
    case "create":
      return "/create";
    case "profile":
      return "/profile";
    case "notifications":
      return "/profile";
    default:
      return "/";
  }
}

export function resolveTelegramNext(input: {
  startParam?: string | null;
  next?: string | null;
}): string {
  const fromStart = parseTelegramStartParam(input.startParam);
  if (fromStart !== "/") {
    return fromStart;
  }
  const fromNextToken = parseTelegramStartParam(input.next);
  if (fromNextToken !== "/") {
    return fromNextToken;
  }
  return safeNext(input.next);
}
