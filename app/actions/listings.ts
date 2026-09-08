"use server";

import { redirect } from "next/navigation";

import { requireSessionUser } from "@/lib/auth/current-user";
import {
  archiveListing,
  createListing,
  submitListing,
  updateListing,
} from "@/lib/listings/commands";
import { searchPublicListings } from "@/lib/listings/queries";
import { listingTypeSchema } from "@/lib/listings/schemas";
import type { ListingType } from "@/lib/domain";

function str(form: FormData, key: string): string {
  return String(form.get(key) ?? "");
}

function parseForm(form: FormData) {
  const type = listingTypeSchema.parse(str(form, "type"));
  const specializationIds = form
    .getAll("specializationIds")
    .map(String)
    .filter(Boolean);
  const mediaKeys = form
    .getAll("mediaKeys")
    .map(String)
    .filter(Boolean);
  const saveDraft = str(form, "saveDraft") === "1";

  const base = {
    title: str(form, "title"),
    description: str(form, "description"),
    locationId: str(form, "locationId") || null,
    specializationIds,
    mediaKeys,
    saveDraft,
  };

  if (type === "space") {
    return {
      type,
      ...base,
      priceAmount: str(form, "priceAmount") ? Number(str(form, "priceAmount")) : null,
      pricePeriod: str(form, "pricePeriod") || null,
      areaM2: str(form, "areaM2") ? Number(str(form, "areaM2")) : null,
      workspaceKind: str(form, "workspaceKind") || null,
    };
  }

  if (type === "event") {
    return {
      type,
      ...base,
      startsAt: str(form, "startsAt") ? new Date(str(form, "startsAt")) : null,
      endsAt: str(form, "endsAt") ? new Date(str(form, "endsAt")) : null,
      addressText: str(form, "addressText") || null,
      capacity: str(form, "capacity") ? Number(str(form, "capacity")) : null,
      externalUrl: str(form, "externalUrl") || null,
      priceAmount: str(form, "priceAmount") ? Number(str(form, "priceAmount")) : null,
      isFree: form.get("isFree") === "on",
    };
  }

  return {
    type,
    ...base,
    direction: str(form, "direction") || null,
    employmentFormat: str(form, "employmentFormat") || null,
    employmentNote: str(form, "employmentNote") || null,
  };
}

export async function createListingAction(formData: FormData) {
  const user = await requireSessionUser();
  if (!user.profileCompleted) {
    redirect("/onboarding/role?next=/create");
  }
  const listing = await createListing(user.id, parseForm(formData));
  redirect(`/listings/${listing.id}`);
}

export async function updateListingAction(formData: FormData) {
  const user = await requireSessionUser();
  const id = str(formData, "id");
  await updateListing(id, user.id, parseForm(formData));
  redirect(`/listings/${id}`);
}

export async function submitListingAction(formData: FormData) {
  const user = await requireSessionUser();
  const id = str(formData, "id");
  await submitListing(id, user.id);
  redirect(`/listings/${id}`);
}

export async function archiveListingAction(formData: FormData) {
  const user = await requireSessionUser();
  const id = str(formData, "id");
  await archiveListing(id, user.id);
  redirect("/profile");
}

export async function loadMorePublicListings(input: {
  type: ListingType;
  q: string;
  offset: number;
}) {
  return searchPublicListings({
    type: input.type,
    q: input.q,
    offset: input.offset,
  });
}
