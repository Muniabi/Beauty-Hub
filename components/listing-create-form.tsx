import { createListingAction, updateListingAction } from "@/app/actions/listings";
import { PhotoFields } from "@/components/photo-fields";
import { SelectField, TextField } from "@/components/form-fields";
import { Button } from "@/components/ui/button";
import type { ListingType } from "@/lib/domain";
import { toDatetimeLocalValue } from "@/lib/listings/format";
import type { ListingRecord } from "@/lib/listings/types";

export type ListingFormDefaults = {
  title?: string;
  description?: string;
  locationId?: string | null;
  specializationIds?: string[];
  mediaKeys?: string[];
  priceAmount?: number | null;
  pricePeriod?: string | null;
  areaM2?: number | null;
  workspaceKind?: string | null;
  startsAt?: Date | null;
  addressText?: string | null;
  capacity?: number | null;
  externalUrl?: string | null;
  isFree?: boolean;
  direction?: string | null;
  employmentFormat?: string | null;
  employmentNote?: string | null;
};

export function defaultsFromListing(listing: ListingRecord): ListingFormDefaults {
  return {
    title: listing.title,
    description: listing.description,
    locationId: listing.locationId,
    specializationIds: listing.specializationIds,
    mediaKeys: listing.media.map((item) => item.objectKey),
    priceAmount: listing.priceAmount,
    pricePeriod: listing.pricePeriod,
    areaM2: listing.spaceDetails?.areaM2 ?? null,
    workspaceKind: listing.spaceDetails?.workspaceKind ?? null,
    startsAt: listing.eventDetails?.startsAt ?? null,
    addressText: listing.eventDetails?.addressText ?? null,
    capacity: listing.eventDetails?.capacity ?? null,
    externalUrl: listing.eventDetails?.externalUrl ?? null,
    isFree: listing.type === "event" && listing.priceAmount == null,
    direction: listing.vacancyDetails?.direction ?? null,
    employmentFormat: listing.vacancyDetails?.employmentFormat ?? null,
    employmentNote: listing.vacancyDetails?.employmentNote ?? null,
  };
}

export function ListingCreateForm({
  type,
  districts,
  specializations,
  listingId,
  defaults,
  publishedNotice = false,
}: {
  type: ListingType;
  districts: { id: string; name: string }[];
  specializations: { id: string; name: string }[];
  listingId?: string;
  defaults?: ListingFormDefaults;
  publishedNotice?: boolean;
}) {
  const editing = Boolean(listingId);
  const selectedSpecs = new Set(defaults?.specializationIds ?? []);

  return (
    <form
      action={editing ? updateListingAction : createListingAction}
      className="mt-6 flex max-w-md flex-col gap-4"
    >
      <input type="hidden" name="type" value={type} />
      {listingId ? <input type="hidden" name="id" value={listingId} /> : null}
      {publishedNotice ? (
        <p className="rounded-[10px] bg-[var(--color-warning-bg)] px-3 py-3 text-[15px] text-[var(--color-warning)]">
          После сохранения объявление снова уйдёт на проверку и временно пропадёт
          из каталога.
        </p>
      ) : null}
      <PhotoFields initialKeys={defaults?.mediaKeys ?? []} />
      <TextField
        label="Заголовок"
        name="title"
        defaultValue={defaults?.title}
      />
      <label className="flex flex-col gap-1.5">
        <span className="text-[13px] font-medium text-[var(--color-text-muted)]">Описание</span>
        <textarea
          name="description"
          rows={5}
          defaultValue={defaults?.description}
          className="rounded-[10px] border border-border bg-card px-3 py-2 text-[15px]"
        />
      </label>
      <SelectField
        label="Район"
        name="locationId"
        placeholder="Выберите район"
        defaultValue={defaults?.locationId ?? ""}
        options={districts}
      />
      <fieldset className="flex flex-col gap-2">
        <legend className="text-[13px] font-medium text-[var(--color-text-muted)]">
          Специализации
        </legend>
        {specializations.map((item) => (
          <label key={item.id} className="flex items-center gap-2 text-[15px]">
            <input
              type="checkbox"
              name="specializationIds"
              value={item.id}
              defaultChecked={selectedSpecs.has(item.id)}
            />
            {item.name}
          </label>
        ))}
      </fieldset>

      {type === "space" ? (
        <>
          <TextField
            label="Цена, ₽"
            name="priceAmount"
            defaultValue={defaults?.priceAmount != null ? String(defaults.priceAmount) : ""}
          />
          <SelectField
            label="Период"
            name="pricePeriod"
            placeholder="Период"
            defaultValue={defaults?.pricePeriod ?? ""}
            options={[
              { id: "month", name: "Месяц" },
              { id: "shift", name: "Смена" },
              { id: "hour", name: "Час" },
            ]}
          />
          <TextField
            label="Площадь, м²"
            name="areaM2"
            defaultValue={defaults?.areaM2 != null ? String(defaults.areaM2) : ""}
          />
          <SelectField
            label="Вид места"
            name="workspaceKind"
            placeholder="Не указан"
            defaultValue={defaults?.workspaceKind ?? ""}
            options={[
              { id: "cabinet", name: "Кабинет" },
              { id: "chair", name: "Кресло" },
              { id: "coworking_slot", name: "Коворкинг" },
              { id: "other", name: "Другое" },
            ]}
          />
        </>
      ) : null}

      {type === "event" ? (
        <>
          <label className="flex flex-col gap-1.5">
            <span className="text-[13px] font-medium text-[var(--color-text-muted)]">
              Начало
            </span>
            <input
              type="datetime-local"
              name="startsAt"
              defaultValue={toDatetimeLocalValue(defaults?.startsAt)}
              className="h-12 rounded-[10px] border border-border bg-card px-3 md:h-11"
            />
          </label>
          <TextField
            label="Адрес"
            name="addressText"
            defaultValue={defaults?.addressText ?? ""}
          />
          <TextField
            label="Цена, ₽"
            name="priceAmount"
            defaultValue={
              defaults?.isFree || defaults?.priceAmount == null
                ? ""
                : String(defaults.priceAmount)
            }
          />
          <label className="flex items-center gap-2 text-[15px]">
            <input type="checkbox" name="isFree" defaultChecked={defaults?.isFree} />
            Бесплатно
          </label>
          <TextField
            label="Мест"
            name="capacity"
            defaultValue={defaults?.capacity != null ? String(defaults.capacity) : ""}
          />
          <TextField
            label="Ссылка на регистрацию"
            name="externalUrl"
            defaultValue={defaults?.externalUrl ?? ""}
          />
        </>
      ) : null}

      {type === "vacancy" ? (
        <>
          <SelectField
            label="Направление"
            name="direction"
            placeholder="Выберите"
            defaultValue={defaults?.direction ?? ""}
            options={[
              { id: "looking_for_master", name: "Ищу мастера" },
              { id: "looking_for_job", name: "Ищу работу" },
            ]}
          />
          <SelectField
            label="Формат занятости"
            name="employmentFormat"
            placeholder="Не указан"
            defaultValue={defaults?.employmentFormat ?? ""}
            options={[
              { id: "rent", name: "Аренда" },
              { id: "hire", name: "Найм" },
              { id: "percent", name: "Процент" },
              { id: "other", name: "Другое" },
            ]}
          />
          <TextField
            label="Уточнение, если другое"
            name="employmentNote"
            defaultValue={defaults?.employmentNote ?? ""}
          />
        </>
      ) : null}

      <p className="text-[13px] text-[var(--color-text-muted)]">
        ЗЖМ обычно Советский, Северный — Первомайский.
      </p>
      <Button type="submit">
        {editing ? "Сохранить и отправить на проверку" : "Отправить на проверку"}
      </Button>
      <Button type="submit" name="saveDraft" value="1" variant="secondary">
        Сохранить черновик
      </Button>
    </form>
  );
}
