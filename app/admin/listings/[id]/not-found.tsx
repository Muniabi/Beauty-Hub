import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function AdminListingNotFound() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-[var(--color-bg)] px-4">
      <div className="w-full max-w-md rounded-[20px] border border-border bg-[var(--color-surface)] p-8 text-center">
        <h1 className="font-display text-[28px] font-semibold">Не найдено</h1>
        <p className="mt-2 text-[15px] text-[var(--color-text-muted)]">
          Объявления нет в очереди модерации.
        </p>
        <Button asChild className="mt-6 w-full">
          <Link href="/admin/listings">К очереди</Link>
        </Button>
      </div>
    </div>
  );
}
