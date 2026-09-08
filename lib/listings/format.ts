import type { ListingType, PricePeriod, VacancyDirection } from "@/lib/domain";

import {
  LISTING_TYPE_LABELS,
  PRICE_PERIOD_LABELS,
  VACANCY_DIRECTION_LABELS,
} from "@/lib/listings/constants";
import type { ListingDetails } from "@/lib/listings/types";

export function typeLabel(type: ListingType): string {
  return LISTING_TYPE_LABELS[type];
}

export function formatPrice(amount: number | null, period: PricePeriod | null): string {
  if (amount == null) {
    return "Бесплатно";
  }
  const formatted = new Intl.NumberFormat("ru-RU").format(amount);
  const suffix = period ? PRICE_PERIOD_LABELS[period] : "";
  return suffix ? `${formatted} ₽ / ${suffix}` : `${formatted} ₽`;
}

export function formatEventWhen(startsAt: Date | null): string {
  if (!startsAt) {
    return "";
  }
  const date = new Intl.DateTimeFormat("ru-RU", {
    timeZone: "Europe/Moscow",
    day: "numeric",
    month: "short",
  }).format(startsAt);
  const time = new Intl.DateTimeFormat("ru-RU", {
    timeZone: "Europe/Moscow",
    hour: "2-digit",
    minute: "2-digit",
  }).format(startsAt);
  return `${date} · ${time}`;
}

export function accentText(details: ListingDetails): string {
  if (details.type === "space") {
    return formatPrice(details.priceAmount, details.pricePeriod);
  }
  if (details.type === "event") {
    return formatEventWhen(details.startsAt);
  }
  return details.direction ? VACANCY_DIRECTION_LABELS[details.direction] : "";
}

export function vacancyDirectionLabel(direction: VacancyDirection): string {
  return VACANCY_DIRECTION_LABELS[direction];
}

export function mediaSrc(objectKey: string): string {
  return `/uploads/${encodeURIComponent(objectKey)}`;
}
