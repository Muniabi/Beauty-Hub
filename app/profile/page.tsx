import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus } from "lucide-react";

import {
  deleteOwnAccount,
  logoutAction,
  updateOwnProfile,
} from "@/app/actions/profile";
import { AppShell } from "@/components/app-shell";
import { ListingCard } from "@/components/listing-card";
import { NotificationSwitches } from "@/components/notification-switches";
import { SelectField, TextField } from "@/components/form-fields";
import { Button } from "@/components/ui/button";
import { ROLE_LABELS } from "@/lib/auth/constants";
import { getSessionUser } from "@/lib/auth/current-user";
import { listDistricts, listSpecializations } from "@/lib/catalogs";
import { canOwnerEdit } from "@/lib/listings/lifecycle";
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
  const createHref = user.profileCompleted ? "/create" : "/onboarding/role?next=/create";

  return (
    <AppShell current="/profile">
      <div className="mx-auto flex max-w-2xl flex-col gap-4">
        <section className="overflow-hidden rounded-[20px] border border-border bg-card px-5 py-6 md:px-7 md:py-8">
          <p className="text-[13px] font-medium tracking-[0.16em] text-primary uppercase">
            Профиль
          </p>
          <div className="mt-4 flex items-center gap-4">
            <div className="flex size-16 items-center justify-center rounded-full bg-[var(--color-accent-subtle)] text-[22px] font-semibold text-primary">
              {(user.displayName || "?").slice(0, 1)}
            </div>
            <div className="min-w-0">
              <h1 className="font-display text-[32px] leading-[36px] font-semibold tracking-[-0.03em]">
                {user.displayName || "Профиль"}
              </h1>
              <p className="mt-1 text-[15px] text-[var(--color-text-muted)]">
                {roleLabel}
                {user.districtName ? ` · ${user.districtName}` : ""}
              </p>
              {user.contactTelegram ? (
                <p className="text-[13px] text-[var(--color-text-muted)]">
                  Telegram @{user.contactTelegram}
                </p>
              ) : null}
            </div>
          </div>
          {!user.profileCompleted ? (
            <p className="mt-5 rounded-[16px] bg-[var(--color-warning-bg)] px-4 py-3 text-[15px] text-[var(--color-warning)]">
              Завершите онбординг, чтобы создавать объявления и писать авторам.{" "}
              <Link href="/onboarding/role?next=/profile" className="font-semibold">
                Продолжить
              </Link>
            </p>
          ) : null}
        </section>

        <section className="rounded-[20px] border border-border bg-card p-5 md:p-6">
          <p className="text-[13px] font-medium tracking-[0.12em] text-primary uppercase">
            Контакты
          </p>
          <h2 className="font-display mt-1 text-[28px] leading-[32px] font-semibold">
            Как с вами связаться
          </h2>
          <p className="mt-1 text-[13px] leading-[18px] text-[var(--color-text-muted)]">
            Эти данные видит человек, который открыл ваше объявление и нажал
            «Написать».
          </p>
          <form action={updateOwnProfile} className="mt-5 flex flex-col gap-4">
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
                className="rounded-[10px] border border-border bg-[var(--color-bg)] px-3 py-2 text-[15px] outline-none focus-visible:border-primary"
              />
            </label>
            <Button type="submit">Сохранить</Button>
          </form>
        </section>

        <section className="rounded-[20px] border border-border bg-card p-5 md:p-6">
          <p className="text-[13px] font-medium tracking-[0.12em] text-primary uppercase">
            Telegram
          </p>
          <h2 className="font-display mt-1 text-[28px] leading-[32px] font-semibold">
            Уведомления
          </h2>
          <p className="mt-1 text-[13px] leading-[18px] text-[var(--color-text-muted)]">
            Сообщения о новых объявлениях выбранного типа. По умолчанию выключено.
          </p>
          <div className="mt-4">
            <NotificationSwitches
              notifySpace={user.notifySpace}
              notifyEvent={user.notifyEvent}
              notifyVacancy={user.notifyVacancy}
            />
          </div>
        </section>

        <section className="rounded-[20px] border border-border bg-card p-5 md:p-6">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-[13px] font-medium tracking-[0.12em] text-primary uppercase">
                Каталог
              </p>
              <h2 className="font-display mt-1 text-[28px] leading-[32px] font-semibold">
                Мои объявления
              </h2>
            </div>
            <Button asChild variant="secondary" size="sm">
              <Link href={createHref}>
                <Plus className="size-4" strokeWidth={1.75} />
                Добавить
              </Link>
            </Button>
          </div>
          <div className="mt-4 flex flex-col gap-3">
            {ownListings.length === 0 ? (
              <div className="rounded-[16px] bg-[var(--color-bg)] px-4 py-5">
                <p className="text-[15px] font-semibold">Пока нет объявлений</p>
                <p className="mt-1 text-[13px] leading-[18px] text-[var(--color-text-muted)]">
                  Кабинет, мастер-класс или вакансия появятся здесь после создания.
                </p>
              </div>
            ) : (
              ownListings.map((listing) => (
                <div
                  key={listing.id}
                  className="rounded-[16px] border border-border bg-[var(--color-bg)] p-2"
                >
                  <ListingCard
                    listing={listing}
                    compact
                    className="border-0 bg-transparent hover:translate-y-0 hover:shadow-none"
                  />
                  {canOwnerEdit(listing.status) ? (
                    <Link
                      href={`/listings/${listing.id}/edit`}
                      className="mt-1 inline-flex px-2 pb-1 text-[13px] font-semibold text-primary"
                    >
                      Изменить
                    </Link>
                  ) : null}
                </div>
              ))
            )}
          </div>
        </section>

        <section className="rounded-[20px] border border-border bg-card p-5 md:p-6">
          <p className="text-[13px] font-medium tracking-[0.12em] text-primary uppercase">
            Аккаунт
          </p>
          <form action={logoutAction} className="mt-4">
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
      </div>
    </AppShell>
  );
}
