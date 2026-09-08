import type { ListingStatus, ListingType } from "@/lib/domain";

export const LISTING_TTL_DAYS = 30;
export const LISTING_PAGE_SIZE = 20;
export const HOME_NEW_LIMIT = 4;
export const MAX_LISTING_PHOTOS = 6;
export const MOSCOW_TZ = "Europe/Moscow";

export const LISTING_TYPE_LABELS: Record<ListingType, string> = {
  space: "Кабинет",
  event: "Мероприятие",
  vacancy: "Вакансия",
};

export const LISTING_STATUS_LABELS: Record<ListingStatus, string> = {
  draft: "Черновик",
  pending: "На проверке",
  published: "Опубликовано",
  rejected: "Не опубликовано",
  expired: "Неактуально",
  archived: "В архиве",
};

export const PRICE_PERIOD_LABELS = {
  month: "месяц",
  shift: "смена",
  hour: "час",
  event_ticket: "билет",
  other: "",
} as const;

export const VACANCY_DIRECTION_LABELS = {
  looking_for_master: "Ищу мастера",
  looking_for_job: "Ищу работу",
} as const;

export const WORKSPACE_KIND_LABELS = {
  cabinet: "Кабинет",
  chair: "Кресло",
  coworking_slot: "Коворкинг",
  other: "Другое",
} as const;

export const EMPLOYMENT_FORMAT_LABELS = {
  rent: "Аренда",
  hire: "Найм",
  percent: "Процент",
  other: "Другое",
} as const;
