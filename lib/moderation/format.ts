export function formatRelativeRu(date: Date, now = new Date()): string {
  const diffMs = date.getTime() - now.getTime();
  const rtf = new Intl.RelativeTimeFormat("ru", { numeric: "auto" });
  const absMs = Math.abs(diffMs);
  const sign = diffMs <= 0 ? -1 : 1;

  if (absMs < 60_000) {
    return rtf.format(sign * Math.max(1, Math.round(absMs / 1000)), "second");
  }
  if (absMs < 3_600_000) {
    return rtf.format(sign * Math.round(absMs / 60_000), "minute");
  }
  if (absMs < 86_400_000 * 2) {
    return rtf.format(sign * Math.round(absMs / 3_600_000), "hour");
  }
  if (absMs < 86_400_000 * 30) {
    return rtf.format(sign * Math.round(absMs / 86_400_000), "day");
  }

  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function formatAbsoluteRu(date: Date): string {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
