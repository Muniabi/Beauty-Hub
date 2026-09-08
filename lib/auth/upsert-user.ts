import { telegramContactHandle } from "@/lib/auth/telegram";
import type { TelegramIdentity } from "@/lib/auth/telegram";
import { isProfileCompleted } from "@/lib/auth/profile-completed";
import {
  createUserFromTelegram,
  findUserByTelegramId,
  touchTelegramLogin,
} from "@/lib/db/users";

export async function upsertTelegramUser(payload: TelegramIdentity) {
  const telegramUserId = payload.id;
  const existing = await findUserByTelegramId(telegramUserId);

  if (existing) {
    if (existing.status !== "active") {
      throw new Error("BLOCKED");
    }

    await touchTelegramLogin(existing._id, {
      username: payload.username ?? existing.telegram?.username ?? null,
      lastAuthDate: payload.auth_date,
    });

    const profileCompleted =
      existing.onboardingCompleted &&
      isProfileCompleted({
        role: existing.role,
        displayName: existing.profile?.displayName ?? "",
        contactTelegram: existing.profile?.contactTelegram ?? "",
      });

    return {
      userId: existing._id,
      isNew: false,
      profileCompleted,
    };
  }

  const handle = telegramContactHandle(payload.username);
  const created = await createUserFromTelegram({
    telegramUserId,
    username: payload.username ?? null,
    lastAuthDate: payload.auth_date,
    displayName: payload.first_name,
    contactTelegram: handle,
  });

  return {
    userId: created._id,
    isNew: true,
    profileCompleted: isProfileCompleted({
      role: null,
      displayName: payload.first_name,
      contactTelegram: handle,
    }),
  };
}

export async function getLastAuthDate(telegramUserId: bigint) {
  const account = await findUserByTelegramId(Number(telegramUserId));
  return account?.telegram?.lastAuthDate ?? null;
}
