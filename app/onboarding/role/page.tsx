import { redirect } from "next/navigation";
import { Building2, CalendarDays, Sparkles } from "lucide-react";

import { saveOnboardingRole } from "@/app/actions/profile";
import { Button } from "@/components/ui/button";
import { PUBLIC_ROLES, ROLE_LABELS } from "@/lib/auth/constants";
import { getSessionUser } from "@/lib/auth/current-user";
import { safeNext } from "@/lib/auth/safe-next";

const ROLE_COPY = {
  master: {
    hint: "Делаю услуги клиентам: маникюр, брови, волосы и не только.",
    icon: Sparkles,
  },
  space_owner: {
    hint: "Сдаю кабинет, кресло или место в салоне.",
    icon: Building2,
  },
  organizer: {
    hint: "Собираю мастер-классы, обучение и бьюти-события.",
    icon: CalendarDays,
  },
} as const;

export default async function OnboardingRolePage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const next = safeNext((await searchParams).next);
  const user = await getSessionUser();
  if (!user) {
    redirect(`/login?next=${encodeURIComponent(next)}`);
  }
  if (user.profileCompleted) {
    redirect(next);
  }

  return (
    <main className="mx-auto w-full max-w-[440px] px-4 py-10">
      <p className="text-[13px] font-medium tracking-[0.14em] text-primary uppercase">
        Знакомство
      </p>
      <h1 className="font-display mt-2 text-[36px] leading-[40px] font-semibold tracking-[-0.03em]">
        Кто вы в Beauty Hub
      </h1>
      <p className="mt-3 text-[15px] leading-[22px] text-[var(--color-text-muted)]">
        Роль выбирается один раз и не закрывает типы объявлений: мастер тоже может
        сдать кабинет или анонсировать обучение.
      </p>
      <form action={saveOnboardingRole} className="mt-8 flex flex-col gap-3">
        <input type="hidden" name="next" value={next} />
        {PUBLIC_ROLES.map((role) => {
          const copy = ROLE_COPY[role];
          const Icon = copy.icon;
          return (
            <label
              key={role}
              className="flex cursor-pointer gap-3 rounded-[16px] border border-border bg-card p-4 transition has-[:checked]:border-primary has-[:checked]:bg-[var(--color-accent-subtle)] has-[:checked]:shadow-sm"
            >
              <input
                type="radio"
                name="role"
                value={role}
                required
                defaultChecked={user.role === role}
                className="sr-only"
              />
              <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[var(--color-bg)] text-primary">
                <Icon className="size-5" strokeWidth={1.75} />
              </span>
              <span className="min-w-0">
                <span className="block text-[16px] font-semibold">
                  {ROLE_LABELS[role]}
                </span>
                <span className="mt-1 block text-[13px] leading-[18px] text-[var(--color-text-muted)]">
                  {copy.hint}
                </span>
              </span>
            </label>
          );
        })}
        <Button type="submit" className="mt-3 w-full">
          Далее
        </Button>
      </form>
    </main>
  );
}
