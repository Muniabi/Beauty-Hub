"use client";

import { useState, type ChangeEvent } from "react";

export function PhotoFields({ max = 6 }: { max?: number }) {
  const [keys, setKeys] = useState<string[]>([]);
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
      <p className="text-[13px] text-[var(--color-text-muted)]">
        {keys.length} из {max}
      </p>
      {keys.length < max ? (
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={onChange}
          className="text-[15px]"
        />
      ) : null}
      {error ? (
        <p className="text-[13px] text-[var(--color-danger)]">{error}</p>
      ) : null}
    </div>
  );
}
