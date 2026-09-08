import Link from "next/link";
import { redirect } from "next/navigation";

import { AppShell } from "@/components/app-shell";
import { getSessionUser } from "@/lib/auth/current-user";

export default async function CreatePage() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login?next=/create");
  }
  if (!user.profileCompleted) {
    redirect("/onboarding/role?next=/create");
  }

  const types = [
    { href: "/create/space", label: "Кабинет", hint: "Сдать кабинет, кресло или место" },
    { href: "/create/event", label: "Мероприятие", hint: "Мастер-класс или обучение" },
    {
      href: "/create/vacancy",
      label: "Вакансия",
      hint: "Ищу мастера или ищу работу — на следующем шаге",
    },
  ];

  return (
    <AppShell current="/create">
      <h1 className="text-[20px] leading-[26px] font-semibold">Что разместить</h1>
      <div className="mt-6 flex max-w-md flex-col gap-3">
        {types.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-[10px] border border-border bg-card px-4 py-4"
          >
            <p className="text-[16px] font-semibold">{item.label}</p>
            <p className="mt-1 text-[13px] text-[var(--color-text-muted)]">{item.hint}</p>
          </Link>
        ))}
      </div>
    </AppShell>
  );
}
