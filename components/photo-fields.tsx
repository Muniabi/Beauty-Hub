"use client";

import { useState, type ChangeEvent } from "react";
import { ImagePlus, X } from "lucide-react";

import { mediaSrc } from "@/lib/listings/format";

export function PhotoFields({
  max = 6,
  initialKeys = [],
}: {
  max?: number;
  initialKeys?: string[];
}) {
  const [keys, setKeys] = useState<string[]>(initialKeys);
  const [error, setError] = useState("");

  async function onChange(event: ChangeEvent<HTMLInputElement>) {
    const files = [...(event.target.files ?? [])];
    setError("");
    for (const file of files) {
      if (keys.length >= max) {
        break;
      }
      const body = new FormData();
      body.set("file", file);
      const response = await fetch("/api/uploads", { method: "POST", body });
      if (!response.ok) {
        setError("Не получилось загрузить фото. JPEG, PNG или WebP до 5 МБ.");
        return;
      }
      const data = (await response.json()) as { objectKey: string };
      setKeys((current) => [...current, data.objectKey].slice(0, max));
    }
    event.target.value = "";
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="text-[13px] font-medium text-[var(--color-text-muted)]">
        Фото
      </span>
      {keys.map((key) => (
        <input key={key} type="hidden" name="mediaKeys" value={key} />
      ))}
      {keys.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {keys.map((key) => (
            <div
              key={key}
              className="relative size-20 overflow-hidden rounded-[10px] bg-[var(--color-surface-muted)]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={mediaSrc(key)} alt="" className="size-full object-cover" />
              <button
                type="button"
                aria-label="Убрать фото"
                onClick={() =>
                  setKeys((current) => current.filter((item) => item !== key))
                }
                className="absolute top-1 right-1 flex size-6 items-center justify-center rounded-full bg-background/90 text-foreground"
              >
                <X className="size-3.5" strokeWidth={2} />
              </button>
            </div>
          ))}
        </div>
      ) : null}
      <p className="text-[13px] text-[var(--color-text-muted)]">
        {keys.length} из {max}. Первое фото станет обложкой.
      </p>
      {keys.length < max ? (
        <label className="inline-flex h-12 cursor-pointer items-center justify-center gap-2 rounded-[10px] border border-dashed border-border bg-card px-3 text-[15px] font-medium text-primary">
          <ImagePlus className="size-4" strokeWidth={1.75} />
          Добавить фото
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={onChange}
            className="sr-only"
          />
        </label>
      ) : null}
      {error ? (
        <p className="text-[13px] text-[var(--color-danger)]">{error}</p>
      ) : null}
    </div>
  );
}
