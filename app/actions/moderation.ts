"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdminUser } from "@/lib/auth/current-user";
import {
  approveListing,
  rejectListing,
  resolveReport,
  unpublishListing,
} from "@/lib/moderation/commands";

function str(form: FormData, key: string): string {
  return String(form.get(key) ?? "");
}

export async function approveListingAction(formData: FormData) {
  const admin = await requireAdminUser();
  const id = str(formData, "id");
  const result = await approveListing(id, admin.id);

  if (result.kind === "not_found") {
    redirect("/admin/listings?error=not_found");
  }
  if (result.kind === "conflict") {
    redirect(`/admin/listings/${id}?error=conflict`);
  }

  revalidatePath("/admin/listings");
  revalidatePath(`/admin/listings/${id}`);
  revalidatePath("/search");
  revalidatePath("/");
  redirect(
    result.alreadyPublished
      ? "/admin/listings?toast=already_published"
      : "/admin/listings?toast=published",
  );
}

export async function rejectListingAction(formData: FormData) {
  const admin = await requireAdminUser();
  const id = str(formData, "id");
  const reason = str(formData, "reason");
  const result = await rejectListing(id, admin.id, reason);

  if (result.kind === "validation") {
    redirect(`/admin/listings/${id}?error=reason_required&reject=1`);
  }
  if (result.kind === "not_found") {
    redirect("/admin/listings?error=not_found");
  }
  if (result.kind === "conflict") {
    redirect(`/admin/listings/${id}?error=conflict`);
  }

  revalidatePath("/admin/listings");
  revalidatePath(`/admin/listings/${id}`);
  redirect("/admin/listings?toast=rejected");
}

export async function unpublishListingAction(formData: FormData) {
  const admin = await requireAdminUser();
  const id = str(formData, "id");
  const result = await unpublishListing(id, admin.id);

  if (result.kind === "not_found") {
    redirect("/admin/listings?error=not_found");
  }
  if (result.kind === "conflict") {
    redirect(`/admin/listings/${id}?error=conflict`);
  }

  revalidatePath("/admin/listings");
  revalidatePath(`/admin/listings/${id}`);
  revalidatePath("/search");
  revalidatePath("/");
  redirect("/admin/listings?toast=unpublished");
}

export async function resolveReportAction(formData: FormData) {
  const admin = await requireAdminUser();
  const id = str(formData, "id");
  const result = await resolveReport(id, admin.id);

  if (result.kind === "not_found") {
    redirect("/admin/reports?error=not_found");
  }

  revalidatePath("/admin/reports");
  revalidatePath(`/admin/reports/${id}`);
  redirect("/admin/reports?toast=resolved");
}
