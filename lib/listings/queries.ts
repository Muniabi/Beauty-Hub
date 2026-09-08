import type { Filter } from "mongodb";

import type { ListingDoc } from "@/lib/db/documents";
import {
  isDatabaseUnavailable,
  isMongoConfigured,
  listingsCollection,
} from "@/lib/db/mongo";
import { HOME_NEW_LIMIT, LISTING_PAGE_SIZE } from "@/lib/listings/constants";
import { hydrateListings, toCardModel, toListingView } from "@/lib/listings/map";
import type { ListingCardModel, ListingStatus, ListingType, ListingView } from "@/lib/listings/types";
import {
  isListingId,
  resolveListingAccess,
  startOfTodayMoscow,
} from "@/lib/listings/visibility";

export type PublicSearchInput = {
  type: ListingType;
  q?: string;
  districtId?: string;
  specializationId?: string;
  offset?: number;
  limit?: number;
  now?: Date;
};

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function publicFilter(input: PublicSearchInput, now: Date): Filter<ListingDoc> {
  const clauses: Filter<ListingDoc>[] = [
    { status: "published", type: input.type },
    { $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }] },
  ];

  if (input.type === "event") {
    clauses.push({
      "eventDetails.startsAt": { $gte: startOfTodayMoscow(now) },
    });
  }

  if (input.districtId) {
    clauses.push({ locationId: input.districtId });
  }

  if (input.specializationId) {
    clauses.push({ specializationIds: input.specializationId });
  }

  const query = input.q?.trim();
  if (query) {
    const pattern = escapeRegex(query);
    clauses.push({
      $or: [
        { title: { $regex: pattern, $options: "i" } },
        { description: { $regex: pattern, $options: "i" } },
      ],
    });
  }

  return { $and: clauses };
}

export async function searchPublicListings(input: PublicSearchInput): Promise<{
  items: ListingCardModel[];
  total: number;
}> {
  if (!isMongoConfigured()) {
    return { items: [], total: 0 };
  }

  const now = input.now ?? new Date();
  const take = input.limit ?? LISTING_PAGE_SIZE;
  const skip = input.offset ?? 0;
  const filter = publicFilter(input, now);

  try {
    const listings = await listingsCollection();
    const [rows, total] = await Promise.all([
      listings
        .find(filter)
        .sort({ publishedAt: -1 })
        .skip(skip)
        .limit(take)
        .toArray(),
      listings.countDocuments(filter),
    ]);
    const hydrated = await hydrateListings(rows);
    return {
      items: hydrated.map(toCardModel),
      total,
    };
  } catch (error) {
    if (isDatabaseUnavailable(error)) {
      return { items: [], total: 0 };
    }
    throw error;
  }
}

export async function listHomeNew(now = new Date()): Promise<{
  type: ListingType;
  items: ListingCardModel[];
} | null> {
  const types: ListingType[] = ["space", "event", "vacancy"];
  const results = await Promise.all(
    types.map(async (type) => ({
      type,
      ...(await searchPublicListings({ type, limit: HOME_NEW_LIMIT, now })),
    })),
  );
  return results.find((entry) => entry.items.length > 0) ?? null;
}

export async function listOwnListings(authorId: string): Promise<ListingCardModel[]> {
  if (!isMongoConfigured()) {
    return [];
  }
  try {
    const rows = await (
      await listingsCollection()
    )
      .find({ authorId })
      .sort({ updatedAt: -1 })
      .toArray();
    return (await hydrateListings(rows)).map(toCardModel);
  } catch (error) {
    if (isDatabaseUnavailable(error)) {
      return [];
    }
    throw error;
  }
}

export type ListingLookup =
  | { kind: "missing" }
  | { kind: "expired"; listing: ListingView }
  | { kind: "ok"; listing: ListingView };

export async function getListingForViewer(
  id: string,
  viewerId: string | null,
  now = new Date(),
): Promise<ListingLookup> {
  if (!isMongoConfigured()) {
    return { kind: "missing" };
  }

  if (!isListingId(id)) {
    return { kind: "missing" };
  }

  let row;
  try {
    row = await (await listingsCollection()).findOne({ _id: id });
  } catch (error) {
    if (isDatabaseUnavailable(error)) {
      return { kind: "missing" };
    }
    throw error;
  }

  const access = resolveListingAccess({
    exists: Boolean(row),
    status: row?.status ?? "draft",
    type: row?.type ?? "space",
    expiresAt: row?.expiresAt ?? null,
    eventStartsAt: row?.eventDetails?.startsAt ?? null,
    authorId: row?.authorId ?? "",
    viewerId,
    now,
  });

  if (!row || access === "missing") {
    return { kind: "missing" };
  }

  const [hydrated] = await hydrateListings([row]);
  if (access === "expired") {
    return { kind: "expired", listing: toListingView(hydrated, viewerId, true) };
  }

  return { kind: "ok", listing: toListingView(hydrated, viewerId) };
}

export type { ListingStatus };
