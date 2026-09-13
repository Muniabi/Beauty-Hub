import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { AppShell } from "@/components/app-shell";
import {
  ListingCreateForm,
  defaultsFromListing,
} from "@/components/listing-create-form";
import { getSessionUser } from "@/lib/auth/current-user";
import { listDistricts, listSpecializations } from "@/lib/catalogs";
import { LISTING_TYPE_LABELS } from "@/lib/listings/constants";
import { canOwnerEdit } from "@/lib/listings/lifecycle";
import { getOwnedListing } from "@/lib/listings/queries";

export default async function EditListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getSessionUser();
  if (!user) {
    redirect(`/login?next=/listings/${id}/edit`);
  }
  if (!user.profileCompleted) {
    redirect(`/onboarding/role?next=/listings/${id}/edit`);
  }

  const listing = await getOwnedListing(id, user.id);
  if (!listing) {
    notFound();
  }
  if (!canOwnerEdit(listing.status)) {
    notFound();
  }

  const [districts, specializations] = await Promise.all([
    listDistricts(),
    listSpecializations(),
  ]);

  return (
    <AppShell current="/profile">
      <Link href={`/listings/${listing.id}`} className="text-[15px] text-[var(--color-text-muted)]">
        ← К объявлению
      </Link>
      <h1 className="mt-4 font-display text-[32px] leading-[36px] font-semibold tracking-[-0.02em]">
        Редактировать
      </h1>
      <p className="mt-2 text-[15px] text-[var(--color-text-muted)]">
        {LISTING_TYPE_LABELS[listing.type]}
      </p>
      <ListingCreateForm
        type={listing.type}
        listingId={listing.id}
        districts={districts}
        specializations={specializations}
        defaults={defaultsFromListing(listing)}
        publishedNotice={listing.status === "published"}
      />
    </AppShell>
  );
}
