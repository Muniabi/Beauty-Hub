import type { UserRole } from "@/lib/domain";

export type ProfileCompletionInput = {
  role: UserRole | null;
  displayName: string;
  contactTelegram: string;
};

export function isProfileCompleted(input: ProfileCompletionInput): boolean {
  return Boolean(
    input.role &&
      input.displayName.trim().length > 0 &&
      input.contactTelegram.trim().length > 0,
  );
}

export function isOnboardingFinished(input: ProfileCompletionInput & {
  onboardingCompleted: boolean;
}): boolean {
  return input.onboardingCompleted && isProfileCompleted(input);
}

export function normalizeTelegramHandle(value: string): string {
  return value.trim().replace(/^@+/, "");
}
