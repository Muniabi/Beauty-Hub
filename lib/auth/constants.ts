export const SESSION_COOKIE = "bh_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 14;
export const TELEGRAM_AUTH_MAX_AGE_SECONDS = 60 * 60 * 24;
export const AUTH_RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
export const AUTH_RATE_LIMIT_MAX = 20;

export const PUBLIC_ROLES = ["master", "space_owner", "organizer"] as const;
export type PublicRole = (typeof PUBLIC_ROLES)[number];

export const ROLE_LABELS: Record<PublicRole, string> = {
  master: "Мастер",
  space_owner: "Салон или помещение",
  organizer: "Организатор",
};

export function isPublicRole(value: string): value is PublicRole {
  return (PUBLIC_ROLES as readonly string[]).includes(value);
}
