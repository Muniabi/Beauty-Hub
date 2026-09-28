import Link from "next/link";

import { cn } from "@/lib/utils";

export function SegmentedFilter({
  basePath,
  value,
  options,
}: {
  basePath: string;
  value: string;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="flex flex-wrap gap-2" role="tablist" aria-label="Фильтр">
      {options.map((option) => {
        const active = option.value === value;
        const href =
          option.value === options[0]?.value
            ? basePath
            : `${basePath}?status=${option.value}`;
        return (
          <Link
            key={option.value}
            href={href}
            role="tab"
            aria-selected={active}
            className={cn(
              "inline-flex h-9 items-center rounded-md border px-3 text-[14px] font-medium transition",
              active
                ? "border-primary bg-[var(--color-accent-subtle)] text-primary"
                : "border-border bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:text-foreground",
            )}
          >
            {option.label}
          </Link>
        );
      })}
    </div>
  );
}
