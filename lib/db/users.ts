import type { UserRole, UserStatus } from "@/lib/domain";
import type { ProfileDoc, UserDoc } from "@/lib/db/documents";
import { newId } from "@/lib/db/ids";
import { isMongoConfigured, usersCollection } from "@/lib/db/mongo";

export async function findUserById(id: string): Promise<UserDoc | null> {
  if (!isMongoConfigured()) {
    return null;
  }
  return (await usersCollection()).findOne({ _id: id });
}

export async function findUsersByIds(ids: string[]): Promise<UserDoc[]> {
  if (ids.length === 0 || !isMongoConfigured()) {
    return [];
  }
  return (await usersCollection())
    .find({ _id: { $in: [...new Set(ids)] } })
    .toArray();
}

export async function findUserByTelegramId(
  telegramUserId: number,
): Promise<UserDoc | null> {
  return (await usersCollection()).findOne({
    "telegram.telegramUserId": telegramUserId,
  });
}

export async function createUserFromTelegram(input: {
  telegramUserId: number;
  username: string | null;
  lastAuthDate: number;
  displayName: string;
  contactTelegram: string;
}): Promise<UserDoc> {
  const now = new Date();
  const user: UserDoc = {
    _id: newId(),
    role: null,
    isAdmin: false,
    onboardingCompleted: false,
    status: "active",
    createdAt: now,
    lastLoginAt: now,
    profile: {
      displayName: input.displayName,
      bio: null,
      districtLocationId: null,
      avatarObjectKey: null,
      contactTelegram: input.contactTelegram,
      contactPhone: null,
      instagram: null,
      specializationId: null,
    },
    telegram: {
      telegramUserId: input.telegramUserId,
      username: input.username,
      connectedAt: now,
      botBlocked: false,
      lastAuthDate: input.lastAuthDate,
    },
    notificationPreference: {
      notifySpace: false,
      notifyEvent: false,
      notifyVacancy: false,
      updatedAt: now,
    },
  };
  await (await usersCollection()).insertOne(user);
  return user;
}

export async function touchTelegramLogin(
  userId: string,
  input: { username: string | null; lastAuthDate: number },
): Promise<void> {
  await (
    await usersCollection()
  ).updateOne(
    { _id: userId },
    {
      $set: {
        lastLoginAt: new Date(),
        "telegram.username": input.username,
        "telegram.lastAuthDate": input.lastAuthDate,
      },
    },
  );
}

export async function updateUserRole(userId: string, role: UserRole): Promise<void> {
  await (await usersCollection()).updateOne({ _id: userId }, { $set: { role } });
}

export async function updateUserProfile(
  userId: string,
  profile: Partial<ProfileDoc>,
): Promise<void> {
  const set: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(profile)) {
    set[`profile.${key}`] = value;
  }
  if (Object.keys(set).length === 0) {
    return;
  }
  await (await usersCollection()).updateOne({ _id: userId }, { $set: set });
}

export async function updateUserNotifications(
  userId: string,
  input: {
    notifySpace: boolean;
    notifyEvent: boolean;
    notifyVacancy: boolean;
  },
): Promise<void> {
  await (
    await usersCollection()
  ).updateOne(
    { _id: userId },
    {
      $set: {
        "notificationPreference.notifySpace": input.notifySpace,
        "notificationPreference.notifyEvent": input.notifyEvent,
        "notificationPreference.notifyVacancy": input.notifyVacancy,
        "notificationPreference.updatedAt": new Date(),
      },
    },
  );
}

export async function completeOnboarding(userId: string): Promise<void> {
  await (
    await usersCollection()
  ).updateOne({ _id: userId }, { $set: { onboardingCompleted: true } });
}

export async function softDeleteUser(userId: string): Promise<void> {
  const status: UserStatus = "deleted";
  await (
    await usersCollection()
  ).updateOne(
    { _id: userId },
    {
      $set: {
        status,
        lastLoginAt: null,
        telegram: null,
        "profile.displayName": "Удаленный пользователь",
        "profile.contactTelegram": "",
        "profile.contactPhone": null,
        "profile.instagram": null,
        "profile.bio": null,
        "profile.avatarObjectKey": null,
      },
    },
  );
}
