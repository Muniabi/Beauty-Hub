import { createListingAction } from "@/app/actions/listings";
import { PhotoFields } from "@/components/photo-fields";
import { SelectField, TextField } from "@/components/form-fields";
import { Button } from "@/components/ui/button";
import type { ListingType } from "@/lib/domain";

export function ListingCreateForm({
  type,
  districts,
  specializations,
}: {
  type: ListingType;
  districts: { id: string; name: string }[];
  specializations: { id: string; name: string }[];
}) {
  return (
    <form action={createListingAction} className="mt-6 flex max-w-md flex-col gap-4">
      <input type="hidden" name="type" value={type} />
      <PhotoFields />
      <TextField label="Заголовок" name="title" />
      <label className="flex flex-col gap-1.5">
        <span className="text-[13px] font-medium text-[var(--color-text-muted)]">Описание</span>
        <textarea
          name="description"
          rows={5}
          className="rounded-[10px] border border-border bg-card px-3 py-2 text-[15px]"
        />
      </label>
      <SelectField
        label="Район"
        name="locationId"
        placeholder="Выберите район"
        options={districts}
      />
      <fieldset className="flex flex-col gap-2">
        <legend className="text-[13px] font-medium text-[var(--color-text-muted)]">
          Специализации
        </legend>
        {specializations.map((item) => (
          <label key={item.id} className="flex items-center gap-2 text-[15px]">
            <input type="checkbox" name="specializationIds" value={item.id} />
            {item.name}
          </label>
        ))}
      </fieldset>

      {type === "space" ? (
        <>
          <TextField label="Цена, ₽" name="priceAmount" />
          <SelectField
            label="Период"
            name="pricePeriod"
            placeholder="Период"
            options={[
              { id: "month", name: "Месяц" },
              { id: "shift", name: "Смена" },
              { id: "hour", name: "Час" },
            ]}
          />
          <TextField label="Площадь, м²" name="areaM2" />
          <SelectField
            label="Вид места"
            name="workspaceKind"
            placeholder="Не указан"
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
              className="h-12 rounded-[10px] border border-border bg-card px-3 md:h-11"
            />
          </label>
          <TextField label="Адрес" name="addressText" />
          <TextField label="Цена, ₽" name="priceAmount" />
          <label className="flex items-center gap-2 text-[15px]">
            <input type="checkbox" name="isFree" />
            Бесплатно
          </label>
          <TextField label="Мест" name="capacity" />
          <TextField label="Ссылка на регистрацию" name="externalUrl" />
        </>
      ) : null}

      {type === "vacancy" ? (
        <>
          <SelectField
            label="Направление"
            name="direction"
            placeholder="Выберите"
            options={[
              { id: "looking_for_master", name: "Ищу мастера" },
              { id: "looking_for_job", name: "Ищу работу" },
            ]}
          />
          <SelectField
            label="Формат занятости"
            name="employmentFormat"
            placeholder="Не указан"
            options={[
              { id: "rent", name: "Аренда" },
              { id: "hire", name: "Найм" },
              { id: "percent", name: "Процент" },
              { id: "other", name: "Другое" },
            ]}
          />
          <TextField label="Уточнение, если другое" name="employmentNote" />
        </>
      ) : null}

      <p className="text-[13px] text-[var(--color-text-muted)]">
        ЗЖМ обычно Советский, Северный — Первомайский.
      </p>
      <Button type="submit">Отправить на проверку</Button>
      <Button type="submit" name="saveDraft" value="1" variant="secondary">
        Сохранить черновик
      </Button>
    </form>
  );
}
