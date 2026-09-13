import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <AppShell current="/search">
      <section className="mx-auto max-w-xl rounded-[20px] border border-border bg-card px-5 py-8 md:px-8">
        <p className="text-[13px] font-medium tracking-[0.16em] text-primary uppercase">
          Каталог
        </p>
        <h1 className="font-display mt-2 text-[36px] leading-[40px] font-semibold tracking-[-0.03em]">
          Объявление не найдено
        </h1>
        <p className="mt-3 text-[15px] leading-[22px] text-[var(--color-text-muted)]">
          Возможно, его сняли с публикации или ссылка устарела.
        </p>
        <Button asChild className="mt-6">
          <Link href="/search">К поиску</Link>
        </Button>
      </section>
    </AppShell>
  );
}
