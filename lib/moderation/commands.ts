import { z } from "zod";

import { recordAnalyticsEvent } from "@/lib/analytics/record";
import type { ListingDoc, ModerationActionDoc, ReportDoc } from "@/lib/db/documents";
import { newId } from "@/lib/db/ids";
import {
  listingsCollection,
  moderationActionsCollection,
  reportsCollection,
} from "@/lib/db/mongo";
import { findUserById } from "@/lib/db/users";
import { expiresAtFromPublish } from "@/lib/listings/lifecycle";
import { isListingId } from "@/lib/listings/visibility";

const reportReasonSchema = z.enum([
  "fraud",
  "spam",
  "wrong_info",
  "prohibited",
  "outdated",
]);

async function appendModerationAction(input: {
  listingId: string;
  actorId: string;
  action: ModerationActionDoc["action"];
  reason: string | null;
}) {
  const doc: ModerationActionDoc = {
    _id: newId(),
    listingId: input.listingId,
    actorId: input.actorId,
    action: input.action,
    reason: input.reason,
    createdAt: new Date(),
  };
  await (await moderationActionsCollection()).insertOne(doc);
}

export type ApproveResult =
  | { kind: "published"; alreadyPublished: false }
  | { kind: "published"; alreadyPublished: true }
  | { kind: "not_found" }
  | { kind: "conflict"; status: ListingDoc["status"] };

export async function approveListing(
  listingId: string,
  actorId: string,
): Promise<ApproveResult> {
  if (!isListingId(listingId)) {
    return { kind: "not_found" };
  }

  const listings = await listingsCollection();
  const existing = await listings.findOne({ _id: listingId });
  if (!existing) {
    return { kind: "not_found" };
  }

  if (existing.status === "published") {
    return { kind: "published", alreadyPublished: true };
  }

  if (existing.status !== "pending") {
    return { kind: "conflict", status: existing.status };
  }

  const publishedAt = new Date();
  const expiresAt =
    existing.type === "event" ? null : expiresAtFromPublish(publishedAt);

  await listings.updateOne(
    { _id: listingId, status: "pending" },
    {
      $set: {
        status: "published",
        publishedAt,
        expiresAt,
        rejectionReason: null,
        updatedAt: publishedAt,
      },
    },
  );

  await appendModerationAction({
    listingId,
    actorId,
    action: "approve",
    reason: null,
  });
  await recordAnalyticsEvent({
    name: "listing_approved",
    userId: actorId,
    listingId,
    listingType: existing.type,
  });

  return { kind: "published", alreadyPublished: false };
}

export type RejectResult =
  | { kind: "rejected" }
  | { kind: "not_found" }
  | { kind: "validation" }
  | { kind: "conflict"; status: ListingDoc["status"] };

export async function rejectListing(
  listingId: string,
  actorId: string,
  reasonRaw: string,
): Promise<RejectResult> {
  if (!isListingId(listingId)) {
    return { kind: "not_found" };
  }

  const reason = reasonRaw.trim();
  if (!reason) {
    return { kind: "validation" };
  }

  const listings = await listingsCollection();
  const existing = await listings.findOne({ _id: listingId });
  if (!existing) {
    return { kind: "not_found" };
  }

  if (existing.status === "rejected") {
    return { kind: "rejected" };
  }

  if (existing.status !== "pending") {
    return { kind: "conflict", status: existing.status };
  }

  const now = new Date();
  await listings.updateOne(
    { _id: listingId, status: "pending" },
    {
      $set: {
        status: "rejected",
        rejectionReason: reason,
        publishedAt: null,
        expiresAt: null,
        updatedAt: now,
      },
    },
  );

  await appendModerationAction({
    listingId,
    actorId,
    action: "reject",
    reason,
  });
  await recordAnalyticsEvent({
    name: "listing_rejected",
    userId: actorId,
    listingId,
    listingType: existing.type,
    target: reason.slice(0, 120),
  });

  return { kind: "rejected" };
}

export type UnpublishResult =
  | { kind: "archived" }
  | { kind: "not_found" }
  | { kind: "conflict"; status: ListingDoc["status"] };

export async function unpublishListing(
  listingId: string,
  actorId: string,
): Promise<UnpublishResult> {
  if (!isListingId(listingId)) {
    return { kind: "not_found" };
  }

  const listings = await listingsCollection();
  const existing = await listings.findOne({ _id: listingId });
  if (!existing) {
    return { kind: "not_found" };
  }

  if (existing.status === "archived") {
    return { kind: "archived" };
  }

  if (existing.status !== "published") {
    return { kind: "conflict", status: existing.status };
  }

  const now = new Date();
  await listings.updateOne(
    { _id: listingId, status: "published" },
    {
      $set: {
        status: "archived",
        updatedAt: now,
      },
    },
  );

  await appendModerationAction({
    listingId,
    actorId,
    action: "unpublish",
    reason: null,
  });
  await recordAnalyticsEvent({
    name: "listing_unpublished",
    userId: actorId,
    listingId,
    listingType: existing.type,
  });

  return { kind: "archived" };
}

export type SubmitReportResult =
  | { kind: "ok"; id: string }
  | { kind: "not_found" }
  | { kind: "forbidden" }
  | { kind: "validation" };

export async function submitReport(input: {
  listingId: string;
  reporterId: string;
  reason: string;
  comment?: string | null;
}): Promise<SubmitReportResult> {
  if (!isListingId(input.listingId)) {
    return { kind: "not_found" };
  }

  const reasonParsed = reportReasonSchema.safeParse(input.reason);
  if (!reasonParsed.success) {
    return { kind: "validation" };
  }

  const listing = await (await listingsCollection()).findOne({
    _id: input.listingId,
  });
  if (!listing) {
    return { kind: "not_found" };
  }
  if (listing.authorId === input.reporterId) {
    return { kind: "forbidden" };
  }

  const reporter = await findUserById(input.reporterId);
  if (!reporter || reporter.status !== "active") {
    return { kind: "forbidden" };
  }

  const comment = input.comment?.trim() || null;
  const doc: ReportDoc = {
    _id: newId(),
    reporterId: input.reporterId,
    listingId: input.listingId,
    reason: reasonParsed.data,
    comment,
    status: "open",
    createdAt: new Date(),
    resolvedAt: null,
  };
  await (await reportsCollection()).insertOne(doc);
  await recordAnalyticsEvent({
    name: "report_submitted",
    userId: input.reporterId,
    listingId: input.listingId,
    listingType: listing.type,
    target: reasonParsed.data,
  });

  return { kind: "ok", id: doc._id };
}

export type ResolveReportResult =
  | { kind: "resolved" }
  | { kind: "not_found" }
  | { kind: "already_resolved" };

export async function resolveReport(
  reportId: string,
  actorId: string,
): Promise<ResolveReportResult> {
  if (!isListingId(reportId)) {
    return { kind: "not_found" };
  }

  const reports = await reportsCollection();
  const existing = await reports.findOne({ _id: reportId });
  if (!existing) {
    return { kind: "not_found" };
  }
  if (existing.status === "resolved") {
    return { kind: "already_resolved" };
  }

  const now = new Date();
  await reports.updateOne(
    { _id: reportId, status: "open" },
    { $set: { status: "resolved", resolvedAt: now } },
  );
  await recordAnalyticsEvent({
    name: "report_resolved",
    userId: actorId,
    listingId: existing.listingId,
    target: existing.reason,
  });

  return { kind: "resolved" };
}
