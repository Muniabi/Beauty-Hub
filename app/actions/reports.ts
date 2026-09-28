"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireSessionUser } from "@/lib/auth/current-user";
import { submitReport } from "@/lib/moderation/commands";

function str(form: FormData, key: string): string {
  return String(form.get(key) ?? "");
}

export async function submitReportAction(formData: FormData) {
  const user = await requireSessionUser();
  if (!user.profileCompleted) {
    redirect("/onboarding/role");
  }

  const listingId = str(formData, "listingId");
  const reason = str(formData, "reason");
  const comment = str(formData, "comment");
  const result = await submitReport({
    listingId,
    reporterId: user.id,
    reason,
    comment,
  });

  if (result.kind === "forbidden") {
    redirect(`/listings/${listingId}?error=report_forbidden`);
  }
  if (result.kind === "not_found") {
    redirect("/search");
  }
  if (result.kind === "validation") {
    redirect(`/listings/${listingId}?error=report_invalid`);
  }

  revalidatePath(`/listings/${listingId}`);
  redirect(`/listings/${listingId}?toast=report_sent`);
}
