"use client";

import { useState } from "react";

import { resolveReportAction } from "@/app/actions/moderation";
import { Button } from "@/components/ui/button";

export function ResolveReportButton({ reportId }: { reportId: string }) {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <Button type="button" className="w-full" onClick={() => setOpen(true)}>
        Отметить разобранным
      </Button>
    );
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="rounded-[12px] border border-border bg-[var(--color-surface)] p-4 shadow-sm"
    >
      <p className="text-[16px] font-semibold">Жалоба закроется. Объявление не изменится.</p>
      <div className="mt-4 flex gap-2">
        <Button
          type="button"
          variant="secondary"
          className="flex-1"
          onClick={() => setOpen(false)}
        >
          Отмена
        </Button>
        <form action={resolveReportAction} className="flex-1">
          <input type="hidden" name="id" value={reportId} />
          <Button type="submit" className="w-full">
            Разобрано
          </Button>
        </form>
      </div>
    </div>
  );
}
