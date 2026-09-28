import { redirect } from "next/navigation";

import { getSessionUser, type SessionUser } from "@/lib/auth/current-user";

export async function requireAdminPage(
  nextPath: string,
): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) {
    redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  }
  if (!user.isAdmin) {
    redirect("/admin/forbidden");
  }
  return user;
}
