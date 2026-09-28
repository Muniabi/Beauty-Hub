import type { Filter } from "mongodb";

import { ROLE_LABELS } from "@/lib/auth/constants";
import type { ListingDoc, ReportDoc } from "@/lib/db/documents";
import {
  isDatabaseUnavailable,
  isMongoConfigured,
  listingsCollection,
  reportsCollection,
} from "@/lib/db/mongo";
import { findUsersByIds } from "@/lib/db/users";
import { hydrateListings, toDetails } from "@/lib/listings/map";
import { isListingId } from "@/lib/listings/visibility";
import {
  ADMIN_PAGE_SIZE,
  REPORT_REASON_LABELS,
  type QueueStatusFilter,
  statusesForQueueFilter,
} from "@/lib/moderation/constants";
import type {
  AdminListingDetail,
  AdminQueueRow,
  AdminReportDetail,
  AdminReportRow,
} from "@/lib/moderation/types";

async function openReportCounts(
  listingIds: string[],
): Promise<Map<string, number>> {
  const counts = new Map<string, number>();
  if (listingIds.length === 0) {
    return counts;
  }
  const rows = await (
    await reportsCollection()
  )
    .aggregate<{ _id: string; count: number }>([
      {
        $match: {
          listingId: { $in: listingIds },
          status: "open",
        },
      },
      { $group: { _id: "$listingId", count: { $sum: 1 } } },
    ])
    .toArray();
  for (const row of rows) {
    counts.set(row._id, row.count);
  }
  return counts;
}

export async function listAdminQueue(input: {
  status: QueueStatusFilter;
  offset?: number;
  limit?: number;
}): Promise<{ items: AdminQueueRow[]; total: number }> {
  if (!isMongoConfigured()) {
    return { items: [], total: 0 };
  }

  const take = input.limit ?? ADMIN_PAGE_SIZE;
  const skip = input.offset ?? 0;
  const statuses = statusesForQueueFilter(input.status);
  const filter: Filter<ListingDoc> = statuses
    ? { status: { $in: statuses } }
    : { status: { $in: ["pending", "published", "rejected", "archived"] } };

  try {
    const listings = await listingsCollection();
    const [rows, total] = await Promise.all([
      listings
        .find(filter)
        .sort({ createdAt: 1 })
        .skip(skip)
        .limit(take)
        .toArray(),
      listings.countDocuments(filter),
    ]);
    const hydrated = await hydrateListings(rows);
    const reportCounts = await openReportCounts(rows.map((row) => row._id));
    const createdById = new Map(rows.map((row) => [row._id, row.createdAt]));

    return {
      total,
      items: hydrated.map((listing) => ({
        id: listing.id,
        type: listing.type,
        title: listing.title,
        districtName: listing.districtName,
        imageKey: listing.media[0]?.objectKey ?? null,
        authorName: listing.author.displayName,
        createdAt: createdById.get(listing.id) ?? new Date(),
        status: listing.status,
        openReports: reportCounts.get(listing.id) ?? 0,
      })),
    };
  } catch (error) {
    if (isDatabaseUnavailable(error)) {
      return { items: [], total: 0 };
    }
    throw error;
  }
}

export async function getAdminListingDetail(
  listingId: string,
): Promise<AdminListingDetail | null> {
  if (!isMongoConfigured() || !isListingId(listingId)) {
    return null;
  }

  try {
    const row = await (await listingsCollection()).findOne({ _id: listingId });
    if (!row) {
      return null;
    }
    const [hydrated] = await hydrateListings([row]);
    const authors = await findUsersByIds([row.authorId]);
    const author = authors[0];
    const openReports = await (
      await reportsCollection()
    )
      .find({ listingId, status: "open" })
      .sort({ createdAt: 1 })
      .toArray();

    return {
      listing: hydrated,
      details: toDetails(hydrated),
      author: {
        id: row.authorId,
        displayName: author?.profile.displayName || hydrated.author.displayName,
        roleLabel: author?.role ? ROLE_LABELS[author.role] : "",
        contactTelegram: author?.profile.contactTelegram ?? "",
        contactPhone: author?.profile.contactPhone ?? null,
        telegramUsername: author?.telegram?.username ?? null,
      },
      openReports: openReports.map((report) => ({
        id: report._id,
        reason: report.reason,
        reasonLabel: REPORT_REASON_LABELS[report.reason],
        createdAt: report.createdAt,
      })),
    };
  } catch (error) {
    if (isDatabaseUnavailable(error)) {
      return null;
    }
    throw error;
  }
}

function toReportRow(
  report: ReportDoc,
  listing: ListingDoc | null,
  reporterName: string,
  districtName: string,
): AdminReportRow {
  return {
    id: report._id,
    reason: report.reason,
    reasonLabel: REPORT_REASON_LABELS[report.reason],
    status: report.status,
    createdAt: report.createdAt,
    reporterName,
    listingId: report.listingId,
    listingTitle: listing?.title ?? "Объявление удалено",
    listingType: listing?.type ?? "space",
    listingStatus: listing?.status ?? "archived",
    districtName,
    imageKey: listing?.media[0]?.objectKey ?? null,
  };
}

export async function listAdminReports(input: {
  status: "open" | "resolved" | "all";
  offset?: number;
  limit?: number;
}): Promise<{ items: AdminReportRow[]; total: number }> {
  if (!isMongoConfigured()) {
    return { items: [], total: 0 };
  }

  const take = input.limit ?? ADMIN_PAGE_SIZE;
  const skip = input.offset ?? 0;
  const filter: Filter<ReportDoc> =
    input.status === "all" ? {} : { status: input.status };

  try {
    const reports = await reportsCollection();
    const [rows, total] = await Promise.all([
      reports.find(filter).sort({ createdAt: 1 }).skip(skip).limit(take).toArray(),
      reports.countDocuments(filter),
    ]);

    const listingIds = [...new Set(rows.map((row) => row.listingId))];
    const reporterIds = [...new Set(rows.map((row) => row.reporterId))];
    const [listings, reporters] = await Promise.all([
      listingIds.length
        ? (await listingsCollection())
            .find({ _id: { $in: listingIds } })
            .toArray()
        : Promise.resolve([]),
      findUsersByIds(reporterIds),
    ]);
    const listingById = new Map(listings.map((row) => [row._id, row]));
    const reporterById = new Map(reporters.map((row) => [row._id, row]));
    const hydrated = await hydrateListings(listings);
    const districtById = new Map(
      hydrated.map((row) => [row.id, row.districtName]),
    );

    return {
      total,
      items: rows.map((report) => {
        const listing = listingById.get(report.listingId) ?? null;
        const reporter = reporterById.get(report.reporterId);
        return toReportRow(
          report,
          listing,
          reporter?.profile.displayName || "Пользователь",
          listing ? (districtById.get(listing._id) ?? "") : "",
        );
      }),
    };
  } catch (error) {
    if (isDatabaseUnavailable(error)) {
      return { items: [], total: 0 };
    }
    throw error;
  }
}

export async function getAdminReportDetail(
  reportId: string,
): Promise<AdminReportDetail | null> {
  if (!isMongoConfigured() || !isListingId(reportId)) {
    return null;
  }

  try {
    const report = await (await reportsCollection()).findOne({ _id: reportId });
    if (!report) {
      return null;
    }
    const [listing, reporters] = await Promise.all([
      (await listingsCollection()).findOne({ _id: report.listingId }),
      findUsersByIds([report.reporterId]),
    ]);
    const reporter = reporters[0];
    let districtName = "";
    if (listing) {
      const [hydrated] = await hydrateListings([listing]);
      districtName = hydrated.districtName;
    }
    return {
      ...toReportRow(
        report,
        listing,
        reporter?.profile.displayName || "Пользователь",
        districtName,
      ),
      comment: report.comment,
      reporterId: report.reporterId,
    };
  } catch (error) {
    if (isDatabaseUnavailable(error)) {
      return null;
    }
    throw error;
  }
}
