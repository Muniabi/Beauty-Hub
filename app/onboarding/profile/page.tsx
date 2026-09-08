import { redirect } from "next/navigation";

import { saveOnboardingProfile } from "@/app/actions/profile";
import { SelectField, TextField } from "@/components/form-fields";
import { Button } from "@/components/ui/button";
import { getSessionUser } from "@/lib/auth/current-user";
import { withNext, safeNext } from "@/lib/auth/safe-next";
import { listDistricts, listSpecializations } from "@/lib/catalogs";

export default async function OnboardingProfilePage({
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
  if (user.profileCompleted) {
    redirect(next);
  }

  const [districts, specializations] = await Promise.all([
    listDistricts(),
    listSpecializations(),
  ]);

  return (
    <main className="mx-auto w-full max-w-[400px] px-4 py-10">
      <h1 className="text-[20px] leading-[26px] font-semibold">Профиль</h1>
      <p className="mt-2 text-[13px] leading-[18px] text-[var(--color-text-muted)]">
        Имя и Telegram нужны, чтобы с вами могли связаться.
      </p>
      <form action={saveOnboardingProfile} className="mt-8 flex flex-col gap-4">
        <input type="hidden" name="next" value={next} />
        <TextField
          label="Имя"
          name="displayName"
          required
          defaultValue={user.displayName}
          autoComplete="name"
        />
        <TextField
          label="Telegram"
          name="contactTelegram"
          required
          defaultValue={user.contactTelegram}
          placeholder="@username"
        />
        <SelectField
          label="Район"
          name="districtLocationId"
          defaultValue={user.districtLocationId ?? ""}
          placeholder="Не выбран"
          options={districts}
        />
        {user.role === "master" ? (
          <SelectField
            label="Специализация"
            name="specializationId"
            required
            defaultValue={user.specializationId ?? ""}
            placeholder="Выберите"
            options={specializations}
          />
        ) : null}
        <TextField
          label="Телефон"
          name="contactPhone"
          defaultValue={user.contactPhone ?? ""}
          autoComplete="tel"
        />
        <TextField
          label="Instagram"
          name="instagram"
          defaultValue={user.instagram ?? ""}
        />
        <Button type="submit" className="mt-2 w-full">
          Далее
        </Button>
      </form>
    </main>
  );
}
