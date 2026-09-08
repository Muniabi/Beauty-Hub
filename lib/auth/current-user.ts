import { cookies } from "next/headers";
import type { UserStatus } from "@/lib/domain";

import { SESSION_COOKIE } from "@/lib/auth/constants";
import { isProfileCompleted } from "@/lib/auth/profile-completed";
import { signSession, verifySession } from "@/lib/auth/session";
import { findUserById } from "@/lib/db/users";
import { locationName, specializationNames } from "@/lib/catalogs";
import { getSessionSecret, isSecureCookie } from "@/lib/env";
import { sessionCookieOptions } from "@/lib/auth/session";
import { isDatabaseUnavailable } from "@/lib/db/mongo";

export type SessionUser = {
  id: string;
  role: "master" | "space_owner" | "organizer" | null;
  isAdmin: boolean;
  onboardingCompleted: boolean;
  status: UserStatus;
  displayName: string;
  contactTelegram: string;
  contactPhone: string | null;
  instagram: string | null;
  bio: string | null;
  districtLocationId: string | null;
  districtName: string | null;
  specializationId: string | null;
  specializationName: string | null;
  telegramUsername: string | null;
  notifySpace: boolean;
  notifyEvent: boolean;
  notifyVacancy: boolean;
  profileCompleted: boolean;
};

export async function readSessionUserId(): Promise<string | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) {
    return null;
  }
  const session = await verifySession(token, getSessionSecret());
  return session?.userId ?? null;
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const userId = await readSessionUserId();
  if (!userId) {
    return null;
  }

  try {
    const user = await findUserById(userId);
    if (!user || user.status !== "active") {
      return null;
    }

    const profile = user.profile;
    const prefs = user.notificationPreference;
    const districtName = profile.districtLocationId
      ? (await locationName(profile.districtLocationId)) || null
      : null;
    const specNames = profile.specializationId
      ? await specializationNames([profile.specializationId])
      : [];
    const specializationName = specNames[0] ?? null;

    return {
      id: user._id,
      role: user.role,
      isAdmin: user.isAdmin,
      onboardingCompleted: user.onboardingCompleted,
      status: user.status,
      displayName: profile.displayName ?? "",
      contactTelegram: profile.contactTelegram ?? "",
      contactPhone: profile.contactPhone ?? null,
      instagram: profile.instagram ?? null,
      bio: profile.bio ?? null,
      districtLocationId: profile.districtLocationId ?? null,
      districtName,
      specializationId: profile.specializationId ?? null,
      specializationName,
      telegramUsername: user.telegram?.username ?? null,
      notifySpace: prefs?.notifySpace ?? false,
      notifyEvent: prefs?.notifyEvent ?? false,
      notifyVacancy: prefs?.notifyVacancy ?? false,
      profileCompleted:
        user.onboardingCompleted &&
        isProfileCompleted({
          role: user.role,
          displayName: profile.displayName ?? "",
          contactTelegram: profile.contactTelegram ?? "",
        }),
    };
  } catch (error) {
    if (isDatabaseUnavailable(error)) {
      return null;
    }
    throw error;
  }
}

export async function requireSessionUser(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) {
    throw new Error("UNAUTHORIZED");
  }
  return user;
}

export async function setSessionCookie(
  userId: string,
  options?: { thirdParty?: boolean },
) {
  const token = await signSession({ userId }, getSessionSecret());
  const thirdParty = options?.thirdParty === true;
  const cookie = sessionCookieOptions({
    secure: thirdParty ? true : isSecureCookie(),
    sameSite: thirdParty ? "none" : "lax",
  });
  const jar = await cookies();
  jar.set(cookie.name, token, cookie);
}

export async function clearSessionCookie() {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, "", {
    ...sessionCookieOptions({ secure: isSecureCookie() }),
    maxAge: 0,
  });
}
