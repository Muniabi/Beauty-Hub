"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { UserRole } from "@/lib/domain";

import { isPublicRole } from "@/lib/auth/constants";
import {
  clearSessionCookie,
  requireSessionUser,
} from "@/lib/auth/current-user";
import { normalizeTelegramHandle } from "@/lib/auth/profile-completed";
import { safeNext } from "@/lib/auth/safe-next";
import {
  completeOnboarding,
  softDeleteUser,
  updateUserNotifications,
  updateUserProfile,
  updateUserRole,
} from "@/lib/db/users";

function onboardingPath(next: string): string {
  const suffix = next !== "/" ? `?next=${encodeURIComponent(next)}` : "";
  return `/onboarding/role${suffix}`;
}

export async function logoutAction() {
  await clearSessionCookie();
  redirect("/");
}

export async function saveOnboardingRole(formData: FormData) {
  const user = await requireSessionUser();
  const next = safeNext(String(formData.get("next") ?? ""));
  const role = String(formData.get("role") ?? "");

  if (!isPublicRole(role)) {
    throw new Error("VALIDATION");
  }

  if (user.onboardingCompleted) {
    redirect(safeNext(next));
  }

  await updateUserRole(user.id, role as UserRole);

  const suffix = next !== "/" ? `?next=${encodeURIComponent(next)}` : "";
  redirect(`/onboarding/profile${suffix}`);
}

export async function saveOnboardingProfile(formData: FormData) {
  const user = await requireSessionUser();
  const next = safeNext(String(formData.get("next") ?? ""));
  const displayName = String(formData.get("displayName") ?? "").trim();
  const contactTelegram = normalizeTelegramHandle(
    String(formData.get("contactTelegram") ?? ""),
  );
  const districtLocationId = String(formData.get("districtLocationId") ?? "") || null;
  const specializationId = String(formData.get("specializationId") ?? "") || null;
  const contactPhone = String(formData.get("contactPhone") ?? "").trim() || null;
  const instagram = String(formData.get("instagram") ?? "").trim() || null;

  if (!user.role) {
    redirect(onboardingPath(next));
  }

  if (!displayName || !contactTelegram) {
    throw new Error("VALIDATION");
  }

  if (user.role === "master" && !specializationId) {
    throw new Error("VALIDATION");
  }

  await updateUserProfile(user.id, {
    displayName,
    contactTelegram,
    districtLocationId,
    specializationId: user.role === "master" ? specializationId : null,
    contactPhone,
    instagram,
  });

  const suffix = next !== "/" ? `?next=${encodeURIComponent(next)}` : "";
  redirect(`/onboarding/notifications${suffix}`);
}

export async function saveOnboardingNotifications(formData: FormData) {
  const user = await requireSessionUser();
  const next = safeNext(String(formData.get("next") ?? ""));
  const skip = String(formData.get("skip") ?? "") === "1";

  if (!skip) {
    await updateUserNotifications(user.id, {
      notifySpace: formData.get("notifySpace") === "on",
      notifyEvent: formData.get("notifyEvent") === "on",
      notifyVacancy: formData.get("notifyVacancy") === "on",
    });
  }

  await completeOnboarding(user.id);

  redirect(next);
}

export async function updateOwnProfile(formData: FormData) {
  const user = await requireSessionUser();
  const displayName = String(formData.get("displayName") ?? "").trim();
  const contactTelegram = normalizeTelegramHandle(
    String(formData.get("contactTelegram") ?? ""),
  );
  const districtLocationId = String(formData.get("districtLocationId") ?? "") || null;
  const specializationId = String(formData.get("specializationId") ?? "") || null;
  const contactPhone = String(formData.get("contactPhone") ?? "").trim() || null;
  const instagram = String(formData.get("instagram") ?? "").trim() || null;
  const bio = String(formData.get("bio") ?? "").trim() || null;
  const requestedRole = String(formData.get("role") ?? "");

  if (requestedRole && requestedRole !== user.role) {
    throw new Error("FORBIDDEN");
  }

  if (formData.get("isAdmin") != null) {
    throw new Error("FORBIDDEN");
  }

  if (!displayName || !contactTelegram) {
    throw new Error("VALIDATION");
  }

  if (user.role === "master" && !specializationId) {
    throw new Error("VALIDATION");
  }

  await updateUserProfile(user.id, {
    displayName,
    contactTelegram,
    districtLocationId,
    specializationId: user.role === "master" ? specializationId : null,
    contactPhone,
    instagram,
    bio,
  });

  revalidatePath("/profile");
}

export async function updateNotificationPreferences(formData: FormData) {
  const user = await requireSessionUser();
  await updateUserNotifications(user.id, {
    notifySpace: formData.get("notifySpace") === "on",
    notifyEvent: formData.get("notifyEvent") === "on",
    notifyVacancy: formData.get("notifyVacancy") === "on",
  });
  revalidatePath("/profile");
}

export async function deleteOwnAccount() {
  const user = await requireSessionUser();
  await softDeleteUser(user.id);
  await clearSessionCookie();
  redirect("/");
}

export async function assertProfileOwned(userId: string, ownerId: string) {
  if (userId !== ownerId) {
    throw new Error("FORBIDDEN");
  }
}
