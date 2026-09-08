import { redirect } from "next/navigation";

import { saveOnboardingNotifications } from "@/app/actions/profile";
import { PreferenceToggle } from "@/components/form-fields";
import { Button } from "@/components/ui/button";
import { getSessionUser } from "@/lib/auth/current-user";
import { safeNext, withNext } from "@/lib/auth/safe-next";

export default async function OnboardingNotificationsPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const next = safeNext((await searchParams).next);
  const user = await getSessionUser();
  if (!user) {
    redirect(`/login?next=${encodeURIComponent(next)}`);
  }
  if (!user.role) {
    redirect(withNext("/onboarding/role", next));
  }
  if (
    !user.displayName ||
    !user.contactTelegram ||
    (user.role === "master" && !user.specializationId)
  ) {
    redirect(withNext("/onboarding/profile", next));
  }
  if (user.profileCompleted) {
    redirect(next);
  }

  return (
    <main className="mx-auto w-full max-w-[400px] px-4 py-10">
      <h1 className="text-[20px] leading-[26px] font-semibold">Уведомления</h1>
      <p className="mt-2 text-[13px] leading-[18px] text-[var(--color-text-muted)]">
        Сообщения о новых объявлениях выбранного типа. По умолчанию выключено.
      </p>
      <form action={saveOnboardingNotifications} className="mt-8 flex flex-col gap-3">
        <input type="hidden" name="next" value={next} />
        <PreferenceToggle
          name="notifySpace"
          label="Кабинеты"
          defaultChecked={false}
        />
        <PreferenceToggle
          name="notifyEvent"
          label="Мероприятия"
          defaultChecked={false}
        />
        <PreferenceToggle
          name="notifyVacancy"
          label="Вакансии"
          defaultChecked={false}
        />
        <Button type="submit" className="mt-4 w-full">
          Сохранить
        </Button>
        <button
          type="submit"
          name="skip"
          value="1"
          className="h-12 text-[15px] font-semibold text-primary md:h-11"
        >
          Настроить позже в профиле
        </button>
      </form>
    </main>
  );
}
