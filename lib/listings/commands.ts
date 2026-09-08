import type { PricePeriod } from "@/lib/domain";
import type { ListingDoc } from "@/lib/db/documents";
import { newId } from "@/lib/db/ids";
import { listingsCollection } from "@/lib/db/mongo";
import { assertClientCannotSetStatus, canOwnerMutate, nextStatusAfterSave } from "@/lib/listings/lifecycle";
import { hydrateListings } from "@/lib/listings/map";
import {
  isValidForPending,
  listingWriteSchema,
  type ListingWriteInput,
} from "@/lib/listings/schemas";
import { assertOwner } from "@/lib/listings/visibility";

function detailsFields(input: ListingWriteInput): Pick<
  ListingDoc,
  "spaceDetails" | "eventDetails" | "vacancyDetails"
> {
  if (input.type === "space") {
    return {
      spaceDetails: {
        areaM2: input.areaM2 ?? null,
        workspaceKind: input.workspaceKind ?? null,
      },
      eventDetails: null,
      vacancyDetails: null,
    };
  }
  if (input.type === "event") {
    return {
      spaceDetails: null,
      eventDetails: input.startsAt
        ? {
            startsAt: input.startsAt,
            endsAt: input.endsAt ?? null,
            addressText: input.addressText ?? null,
            capacity: input.capacity ?? null,
            externalUrl: input.externalUrl || null,
          }
        : null,
      vacancyDetails: null,
    };
  }
  return {
    spaceDetails: null,
    eventDetails: null,
    vacancyDetails: input.direction
      ? {
          direction: input.direction,
          employmentFormat: input.employmentFormat ?? null,
          employmentNote: input.employmentNote ?? null,
        }
      : null,
  };
}

function priceFields(input: ListingWriteInput): {
  priceAmount: number | null;
  pricePeriod: PricePeriod | null;
} {
  if (input.type === "space") {
    return {
      priceAmount: input.priceAmount ?? null,
      pricePeriod: input.pricePeriod ?? null,
    };
  }
  if (input.type === "event") {
    return {
      priceAmount: input.isFree ? null : (input.priceAmount ?? null),
      pricePeriod: input.isFree ? null : "event_ticket",
    };
  }
  return { priceAmount: null, pricePeriod: null };
}

export function parseListingWrite(raw: unknown): ListingWriteInput {
  if (raw && typeof raw === "object" && "status" in raw) {
    assertClientCannotSetStatus(raw as { status?: unknown });
  }
  return listingWriteSchema.parse(raw);
}

function writePayload(authorId: string, input: ListingWriteInput, status: ListingDoc["status"]) {
  const now = new Date();
  return {
    authorId,
    type: input.type,
    status,
    title: input.title.trim(),
    description: input.description.trim(),
    locationId: input.locationId ?? null,
    ...priceFields(input),
    ...detailsFields(input),
    media: input.mediaKeys.map((objectKey, index) => ({
      objectKey,
      sortOrder: index,
      createdAt: now,
    })),
    specializationIds: input.specializationIds,
    updatedAt: now,
  };
}

export async function createListing(authorId: string, raw: unknown) {
  const input = parseListingWrite(raw);
  const valid = isValidForPending(input);
  const status = nextStatusAfterSave({
    current: "draft",
    saveDraft: input.saveDraft || !valid,
    validForPending: valid,
  });
  const now = new Date();
  const doc: ListingDoc = {
    _id: newId(),
    createdAt: now,
    publishedAt: null,
    expiresAt: null,
    rejectionReason: null,
    ...writePayload(authorId, input, status),
  };
  await (await listingsCollection()).insertOne(doc);
  const [hydrated] = await hydrateListings([doc]);
  return hydrated;
}

export async function updateListing(
  listingId: string,
  actorId: string,
  raw: unknown,
) {
  const listings = await listingsCollection();
  const existing = await listings.findOne({ _id: listingId });
  if (!existing) {
    throw new Error("NOT_FOUND");
  }
  assertOwner(existing.authorId, actorId);
  if (!canOwnerMutate(existing.status)) {
    throw new Error("CONFLICT");
  }

  const input = parseListingWrite({
    ...(typeof raw === "object" && raw ? raw : {}),
    type: existing.type,
  });
  if (input.type !== existing.type) {
    throw new Error("FORBIDDEN");
  }

  const valid = isValidForPending(input);
  const status = nextStatusAfterSave({
    current: existing.status,
    saveDraft: input.saveDraft || !valid,
    validForPending: valid,
  });

  const next = {
    ...writePayload(existing.authorId, input, status),
    publishedAt: status === "pending" ? null : existing.publishedAt,
  };
  await listings.updateOne({ _id: listingId }, { $set: next });
  const updated = await listings.findOne({ _id: listingId });
  if (!updated) {
    throw new Error("NOT_FOUND");
  }
  const [hydrated] = await hydrateListings([updated]);
  return hydrated;
}

export async function archiveListing(listingId: string, actorId: string) {
  const listings = await listingsCollection();
  const existing = await listings.findOne({ _id: listingId });
  if (!existing) {
    throw new Error("NOT_FOUND");
  }
  assertOwner(existing.authorId, actorId);
  await listings.updateOne(
    { _id: listingId },
    { $set: { status: "archived", updatedAt: new Date() } },
  );
}

export async function submitListing(listingId: string, actorId: string) {
  const listings = await listingsCollection();
  const existing = await listings.findOne({ _id: listingId });
  if (!existing) {
    throw new Error("NOT_FOUND");
  }
  assertOwner(existing.authorId, actorId);

  const [hydrated] = await hydrateListings([existing]);
  const raw: ListingWriteInput = (() => {
    if (existing.type === "space") {
      return {
        type: "space",
        title: existing.title,
        description: existing.description,
        locationId: existing.locationId,
        specializationIds: existing.specializationIds,
        mediaKeys: existing.media.map((row) => row.objectKey),
        saveDraft: false,
        priceAmount: existing.priceAmount,
        pricePeriod:
          existing.pricePeriod === "month" ||
          existing.pricePeriod === "shift" ||
          existing.pricePeriod === "hour"
            ? existing.pricePeriod
            : null,
        areaM2: existing.spaceDetails?.areaM2 ?? null,
        workspaceKind: existing.spaceDetails?.workspaceKind ?? null,
      };
    }
    if (existing.type === "event") {
      return {
        type: "event",
        title: existing.title,
        description: existing.description,
        locationId: existing.locationId,
        specializationIds: existing.specializationIds,
        mediaKeys: existing.media.map((row) => row.objectKey),
        saveDraft: false,
        startsAt: existing.eventDetails?.startsAt ?? null,
        endsAt: existing.eventDetails?.endsAt ?? null,
        addressText: existing.eventDetails?.addressText ?? null,
        capacity: existing.eventDetails?.capacity ?? null,
        externalUrl: existing.eventDetails?.externalUrl ?? null,
        priceAmount: existing.priceAmount,
        isFree: existing.priceAmount == null,
      };
    }
    return {
      type: "vacancy",
      title: existing.title,
      description: existing.description,
      locationId: existing.locationId,
      specializationIds: existing.specializationIds,
      mediaKeys: existing.media.map((row) => row.objectKey),
      saveDraft: false,
      direction: existing.vacancyDetails?.direction ?? null,
      employmentFormat: existing.vacancyDetails?.employmentFormat ?? null,
      employmentNote: existing.vacancyDetails?.employmentNote ?? null,
    };
  })();

  if (!isValidForPending(raw)) {
    throw new Error("VALIDATION");
  }

  await listings.updateOne(
    { _id: listingId },
    { $set: { status: "pending", publishedAt: null, updatedAt: new Date() } },
  );
  return hydrated;
}
