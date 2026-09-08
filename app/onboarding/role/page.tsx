import { redirect } from "next/navigation";

import { saveOnboardingRole } from "@/app/actions/profile";
import { Button } from "@/components/ui/button";
import { PUBLIC_ROLES, ROLE_LABELS } from "@/lib/auth/constants";
import { getSessionUser } from "@/lib/auth/current-user";
import { safeNext } from "@/lib/auth/safe-next";

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
    <main className="mx-auto w-full max-w-[400px] px-4 py-10">
      <h1 className="text-[20px] leading-[26px] font-semibold">Кто вы</h1>
      <p className="mt-2 text-[13px] leading-[18px] text-[var(--color-text-muted)]">
        Роль можно выбрать один раз. Она не закрывает типы объявлений.
      </p>
      <form action={saveOnboardingRole} className="mt-8 flex flex-col gap-3">
        <input type="hidden" name="next" value={next} />
        {PUBLIC_ROLES.map((role) => (
          <label
            key={role}
            className="flex min-h-[72px] cursor-pointer items-center rounded-[10px] border border-border bg-card px-4 has-[:checked]:border-primary has-[:checked]:bg-[var(--color-accent-subtle)]"
          >
            <input
              type="radio"
              name="role"
              value={role}
              required
              defaultChecked={user.role === role}
              className="mr-3 size-4 accent-[var(--color-accent)]"
            />
            <span className="text-[15px] font-semibold">{ROLE_LABELS[role]}</span>
          </label>
        ))}
        <Button type="submit" className="mt-4 w-full">
          Далее
        </Button>
      </form>
    </main>
  );
}
