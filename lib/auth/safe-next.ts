const SAFE_NEXT = /^\/(?!\/)[A-Za-z0-9\-._~:/?#\[\]@!$&'()*+,;=%]*$/;

export function safeNext(raw: string | null | undefined): string {
  if (!raw) {
    return "/";
  }

  let value = raw.trim();
  try {
    value = decodeURIComponent(value);
  } catch {
    return "/";
  }

  if (value.includes("\\") || !value.startsWith("/") || value.startsWith("//")) {
    return "/";
  }

  const lower = value.toLowerCase();
  if (
    lower.startsWith("/http:") ||
    lower.startsWith("/https:") ||
    lower.includes("://") ||
    lower.startsWith("/javascript:")
  ) {
    return "/";
  }

  if (!SAFE_NEXT.test(value.split("#")[0] ?? value)) {
    return "/";
  }

  return value;
}

export function withNext(pathname: string, next: string): string {
  const safe = safeNext(next);
  const url = new URL(pathname, "http://local.invalid");
  if (safe !== "/") {
    url.searchParams.set("next", safe);
  }
  return `${url.pathname}${url.search}`;
}
