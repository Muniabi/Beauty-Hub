import type { ListingStatus, ListingType, ReportReason, ReportStatus } from "@/lib/domain";
import type { ListingDetails, ListingRecord } from "@/lib/listings/types";

export type AdminQueueRow = {
  id: string;
  type: ListingType;
  title: string;
  districtName: string;
  imageKey: string | null;
  authorName: string;
  createdAt: Date;
  status: ListingStatus;
  openReports: number;
};

export type AdminAuthorStaff = {
  id: string;
  displayName: string;
  roleLabel: string;
  contactTelegram: string;
  contactPhone: string | null;
  telegramUsername: string | null;
};

export type AdminOpenReport = {
  id: string;
  reason: ReportReason;
  reasonLabel: string;
  createdAt: Date;
};

export type AdminListingDetail = {
  listing: ListingRecord;
  details: ListingDetails;
  author: AdminAuthorStaff;
  openReports: AdminOpenReport[];
};

export type AdminReportRow = {
  id: string;
  reason: ReportReason;
  reasonLabel: string;
  status: ReportStatus;
  createdAt: Date;
  reporterName: string;
  listingId: string;
  listingTitle: string;
  listingType: ListingType;
  listingStatus: ListingStatus;
  districtName: string;
  imageKey: string | null;
};

export type AdminReportDetail = AdminReportRow & {
  comment: string | null;
  reporterId: string;
};
