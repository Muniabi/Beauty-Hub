import { compactListingStartParam } from "@/lib/auth/start-param";
import { safeNext } from "@/lib/auth/safe-next";
import { telegramBotUsername } from "@/lib/public-config";

const LISTING_PATH =
  /^\/listings\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i;

export function startParamFromPath(path: string | null | undefined): string {
  const pathname = (safeNext(path).split("?")[0] ?? "/").replace(/\/$/, "") || "/";
  if (pathname === "/search") {
    return "search";
  }
  if (pathname === "/create" || pathname.startsWith("/create/")) {
    return "create";
  }
  if (pathname === "/profile") {
    return "profile";
  }
  const listing = pathname.match(LISTING_PATH);
  if (listing?.[1]) {
    return compactListingStartParam(listing[1]);
  }
  return "";
}

export function telegramMiniAppHref(
  next?: string,
  startParam?: string,
): string | null {
  const bot = telegramBotUsername();
  if (!bot) {
    return null;
  }
  const fromStart = startParam?.trim() ?? "";
  const param =
    /^[A-Za-z0-9_-]{1,64}$/.test(fromStart) && fromStart
      ? fromStart
      : startParamFromPath(next);
  if (!param) {
    return `https://t.me/${bot}`;
  }
  return `https://t.me/${bot}?startapp=${param}`;
}
