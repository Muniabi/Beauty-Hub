import Link from "next/link";
import { redirect } from "next/navigation";

import {
  deleteOwnAccount,
  logoutAction,
  updateNotificationPreferences,
  updateOwnProfile,
} from "@/app/actions/profile";
import { AppShell } from "@/components/app-shell";
import { ListingCard } from "@/components/listing-card";
import { PreferenceToggle, SelectField, TextField } from "@/components/form-fields";
import { Button } from "@/components/ui/button";
import { ROLE_LABELS } from "@/lib/auth/constants";
import { getSessionUser } from "@/lib/auth/current-user";
import { listDistricts, listSpecializations } from "@/lib/catalogs";
import { listOwnListings } from "@/lib/listings/queries";

export default async function ProfilePage() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login?next=/profile");
  }

  const [districts, specializations, ownListings] = await Promise.all([
    listDistricts(),
    listSpecializations(),
    listOwnListings(user.id),
  ]);

  const roleLabel = user.role ? ROLE_LABELS[user.role] : "Роль не выбрана";

  return (
    <AppShell current="/profile">
      <section className="max-w-xl">
        <div className="flex items-center gap-4">
          <div className="flex size-14 items-center justify-center rounded-lg bg-[var(--color-surface-muted)] text-[20px] font-semibold">
            {(user.displayName || "?").slice(0, 1)}
          </div>
          <div>
            <h1 className="text-[20px] leading-[26px] font-semibold">
              {user.displayName || "Профиль"}
            </h1>
            <p className="text-[13px] leading-[18px] text-[var(--color-text-muted)]">
              {roleLabel}
              {user.districtName ? ` · ${user.districtName}` : ""}
            </p>
          </div>
        </div>

        {!user.profileCompleted ? (
          <p className="mt-6 rounded-[10px] bg-[var(--color-warning-bg)] px-3 py-3 text-[15px] text-[var(--color-warning)]">
            Завершите онбординг, чтобы создавать объявления и писать авторам.{" "}
            <Link href="/onboarding/role?next=/profile" className="font-semibold">
              Продолжить
            </Link>
          </p>
        ) : null}

        <h2 className="mt-8 text-[16px] font-semibold">Данные</h2>
        <form action={updateOwnProfile} className="mt-4 flex flex-col gap-4">
          <TextField
            label="Имя"
            name="displayName"
            required
            defaultValue={user.displayName}
          />
          <TextField
            label="Telegram"
            name="contactTelegram"
            required
            defaultValue={user.contactTelegram}
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
          />
          <TextField
            label="Instagram"
            name="instagram"
            defaultValue={user.instagram ?? ""}
          />
          <label className="flex flex-col gap-1.5">
            <span className="text-[13px] font-medium text-[var(--color-text-muted)]">
              О себе
            </span>
            <textarea
              name="bio"
              defaultValue={user.bio ?? ""}
              rows={4}
              className="rounded-[10px] border border-border bg-card px-3 py-2 text-[15px] outline-none focus-visible:border-primary"
            />
          </label>
          <Button type="submit">Сохранить</Button>
        </form>

        <h2 className="mt-10 text-[16px] font-semibold">Уведомления Telegram</h2>
        <p className="mt-1 text-[13px] leading-[18px] text-[var(--color-text-muted)]">
          Сообщения о новых объявлениях выбранного типа. По умолчанию выключено.
        </p>
        <form action={updateNotificationPreferences} className="mt-4 flex flex-col gap-3">
          <PreferenceToggle
            name="notifySpace"
            label="Кабинеты"
            defaultChecked={user.notifySpace}
          />
          <PreferenceToggle
            name="notifyEvent"
            label="Мероприятия"
            defaultChecked={user.notifyEvent}
          />
          <PreferenceToggle
            name="notifyVacancy"
            label="Вакансии"
            defaultChecked={user.notifyVacancy}
          />
          <Button type="submit" variant="secondary">
            Сохранить уведомления
          </Button>
        </form>

        <h2 className="mt-10 text-[16px] font-semibold">Мои объявления</h2>
        <div className="mt-3 flex flex-col gap-3">
          {ownListings.length === 0 ? (
            <p className="text-[15px] text-[var(--color-text-muted)]">
              Пока нет объявлений
            </p>
          ) : (
            ownListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} compact />
            ))
          )}
        </div>

        <form action={logoutAction} className="mt-10">
          <Button type="submit" variant="secondary" className="w-full">
            Выйти
          </Button>
        </form>
        <form action={deleteOwnAccount} className="mt-4">
          <button
            type="submit"
            className="text-[15px] text-[var(--color-danger)]"
          >
            Удалить аккаунт
          </button>
        </form>
        <p className="mt-6 text-[13px] text-[var(--color-text-muted)]">
          <Link href="/legal/privacy" className="underline">
            Конфиденциальность
          </Link>
          {" · "}
          <Link href="/legal/terms" className="underline">
            Условия
          </Link>
        </p>
      </section>
    </AppShell>
  );
}
