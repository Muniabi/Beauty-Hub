import Link from "next/link";

import { AppShell } from "@/components/app-shell";

export default function NotFound() {
  return (
    <AppShell current="/search">
      <h1 className="text-[20px] font-semibold">Объявление не найдено</h1>
      <p className="mt-3 text-[15px] text-[var(--color-text-muted)]">
        Возможно, его сняли с публикации или ссылка устарела.
      </p>
      <Link href="/search" className="mt-6 inline-block font-semibold text-primary">
        К поиску
      </Link>
    </AppShell>
  );
}
