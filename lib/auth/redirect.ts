import { safeNext } from "@/lib/auth/safe-next";

export function telegramAuthRedirect(
  profileCompleted: boolean,
  next: string,
): string {
  const safe = safeNext(next);
  if (profileCompleted) {
    return safe;
  }
  return `/onboarding/role${safe !== "/" ? `?next=${encodeURIComponent(safe)}` : ""}`;
}
