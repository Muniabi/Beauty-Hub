import type { ListingStatus, ReportReason, ReportStatus } from "@/lib/domain";

export const ADMIN_PAGE_SIZE = 20;

export const REPORT_REASON_LABELS: Record<ReportReason, string> = {
  fraud: "Мошенничество",
  spam: "Спам",
  wrong_info: "Неверная информация",
  prohibited: "Запрещённый контент",
  outdated: "Неактуально",
};

export const REPORT_STATUS_LABELS: Record<ReportStatus, string> = {
  open: "Открыта",
  resolved: "Разобрано",
};

export const QUEUE_STATUS_FILTERS = [
  "pending",
  "published",
  "rejected",
  "all",
] as const;

export type QueueStatusFilter = (typeof QUEUE_STATUS_FILTERS)[number];

export const QUEUE_STATUS_LABELS: Record<QueueStatusFilter, string> = {
  pending: "На проверке",
  published: "Опубликовано",
  rejected: "Отклонено",
  all: "Все",
};

export function isQueueStatusFilter(value: string): value is QueueStatusFilter {
  return (QUEUE_STATUS_FILTERS as readonly string[]).includes(value);
}

export function statusesForQueueFilter(
  filter: QueueStatusFilter,
): ListingStatus[] | null {
  if (filter === "all") {
    return null;
  }
  return [filter];
}
