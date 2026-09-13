"use client";

import { useState } from "react";

import { mediaSrc } from "@/lib/listings/format";
import { cn } from "@/lib/utils";

export function ListingGallery({
  imageKeys,
  typeLabel,
}: {
  imageKeys: string[];
  typeLabel: string;
}) {
  const [active, setActive] = useState(0);
  const current = imageKeys[active] ?? null;

  return (
    <div>
      <div className="relative overflow-hidden rounded-[20px] bg-[var(--color-surface-muted)]">
        {current ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={mediaSrc(current)}
            alt="фото объявления"
            className="aspect-[4/3] w-full object-cover"
          />
        ) : (
          <div className="flex aspect-[4/3] items-center justify-center text-[13px] font-semibold tracking-[0.08em] uppercase">
            {typeLabel}
          </div>
        )}
        <span className="absolute top-3 left-3 rounded-[6px] bg-card/90 px-2 py-1 text-[12px] font-semibold tracking-wide backdrop-blur-sm">
          {typeLabel}
        </span>
      </div>
      {imageKeys.length > 1 ? (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {imageKeys.map((key, index) => (
            <button
              key={key}
              type="button"
              onClick={() => setActive(index)}
              aria-label={`Фото ${index + 1}`}
              className={cn(
                "h-20 w-[107px] shrink-0 overflow-hidden rounded-[12px] border",
                index === active
                  ? "border-primary"
                  : "border-transparent opacity-80 hover:opacity-100",
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={mediaSrc(key)} alt="" className="size-full object-cover" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
