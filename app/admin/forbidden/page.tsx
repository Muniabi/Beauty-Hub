import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function AdminForbiddenPage() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-[var(--color-bg)] px-4">
      <div className="w-full max-w-md rounded-[20px] border border-border bg-[var(--color-surface)] p-8 text-center">
        <p className="text-[13px] font-medium tracking-[0.12em] text-[var(--color-text-muted)] uppercase">
          Админ
        </p>
        <h1 className="mt-3 font-display text-[32px] font-semibold tracking-[-0.03em]">
          Нет доступа
        </h1>
        <p className="mt-3 text-[15px] text-[var(--color-text-muted)]">
          Этот раздел только для модераторов.
        </p>
        <Button asChild className="mt-6 w-full">
          <Link href="/">На главную</Link>
        </Button>
      </div>
    </div>
  );
}
