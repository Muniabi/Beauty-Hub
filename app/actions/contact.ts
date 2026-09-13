"use server";

import { getSessionUser } from "@/lib/auth/current-user";
import { getListingContact, type GetContactResult } from "@/lib/contact/get-contact";

export async function getContactAction(
  listingId: string,
  target: "telegram" | "phone" = "telegram",
): Promise<GetContactResult> {
  const user = await getSessionUser();
  return getListingContact({
    listingId,
    viewerId: user?.id ?? null,
    profileCompleted: Boolean(user?.profileCompleted),
    target,
  });
}
