import { ROLE_LABELS } from "@/lib/auth/constants";
import { locationName, specializationNames } from "@/lib/catalogs";
import type { ListingDoc } from "@/lib/db/documents";
import { findUsersByIds } from "@/lib/db/users";
import { accentText } from "@/lib/listings/format";
import type { ListingCardModel, ListingDetails, ListingRecord, ListingView } from "@/lib/listings/types";

export function toDetails(listing: ListingRecord): ListingDetails {
  if (listing.type === "space") {
    return {
      type: "space",
      priceAmount: listing.priceAmount,
      pricePeriod: listing.pricePeriod,
      areaM2: listing.spaceDetails?.areaM2 ?? null,
      workspaceKind: listing.spaceDetails?.workspaceKind ?? null,
    };
  }
  if (listing.type === "event") {
    return {
      type: "event",
      startsAt: listing.eventDetails?.startsAt ?? null,
      endsAt: listing.eventDetails?.endsAt ?? null,
      addressText: listing.eventDetails?.addressText ?? null,
      capacity: listing.eventDetails?.capacity ?? null,
      externalUrl: listing.eventDetails?.externalUrl ?? null,
      priceAmount: listing.priceAmount,
    };
  }
  return {
    type: "vacancy",
    direction: listing.vacancyDetails?.direction ?? null,
    employmentFormat: listing.vacancyDetails?.employmentFormat ?? null,
    employmentNote: listing.vacancyDetails?.employmentNote ?? null,
  };
}

export function toCardModel(listing: ListingRecord): ListingCardModel {
  const names = listing.specializationNames;
  const details = toDetails(listing);
  return {
    id: listing.id,
    type: listing.type,
    title: listing.title,
    districtName: listing.districtName,
    imageKey: listing.media[0]?.objectKey ?? null,
    specializationNames: names.slice(0, 2),
    extraCount: Math.max(0, names.length - 2),
    status: listing.status,
    accent: accentText(details),
  };
}

export function toListingView(
  listing: ListingRecord,
  viewerId: string | null,
  isExpired = false,
): ListingView {
  const role = listing.author.role;
  return {
    id: listing.id,
    type: listing.type,
    status: listing.status,
    title: listing.title,
    description: listing.description,
    districtName: listing.districtName,
    imageKeys: [...listing.media]
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((item) => item.objectKey),
    specializationNames: listing.specializationNames,
    details: toDetails(listing),
    author: {
      displayName: listing.author.displayName || "Автор",
      roleLabel: role ? ROLE_LABELS[role] : "",
    },
    rejectionReason: listing.rejectionReason,
    isExpired,
    isOwner: viewerId === listing.authorId,
  };
}

export async function hydrateListings(docs: ListingDoc[]): Promise<ListingRecord[]> {
  if (docs.length === 0) {
    return [];
  }

  const authors = await findUsersByIds(docs.map((doc) => doc.authorId));
  const authorById = new Map(authors.map((user) => [user._id, user]));

  return Promise.all(
    docs.map(async (doc) => {
      const author = authorById.get(doc.authorId);
      const [district, specNames] = await Promise.all([
        locationName(doc.locationId),
        specializationNames(doc.specializationIds),
      ]);
      return {
        id: doc._id,
        authorId: doc.authorId,
        type: doc.type,
        status: doc.status,
        title: doc.title,
        description: doc.description,
        locationId: doc.locationId,
        districtName: district,
        priceAmount: doc.priceAmount,
        pricePeriod: doc.pricePeriod,
        expiresAt: doc.expiresAt,
        publishedAt: doc.publishedAt,
        rejectionReason: doc.rejectionReason,
        media: [...doc.media].sort((a, b) => a.sortOrder - b.sortOrder),
        specializationIds: doc.specializationIds,
        specializationNames: specNames,
        spaceDetails: doc.spaceDetails,
        eventDetails: doc.eventDetails,
        vacancyDetails: doc.vacancyDetails,
        author: {
          role: author?.role ?? null,
          displayName: author?.profile.displayName ?? "Автор",
        },
      } satisfies ListingRecord;
    }),
  );
}
