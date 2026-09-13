import Link from "next/link";
import { redirect } from "next/navigation";
import { Briefcase, Building2, CalendarDays, ChevronRight } from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { getSessionUser } from "@/lib/auth/current-user";
import { cn } from "@/lib/utils";

export default async function CreatePage() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login?next=/create");
  }
  if (!user.profileCompleted) {
    redirect("/onboarding/role?next=/create");
  }

  const types = [
    {
      href: "/create/space",
      label: "Кабинет",
      hint: "Сдать кабинет, кресло или место",
      icon: Building2,
    },
    {
      href: "/create/event",
      label: "Мероприятие",
      hint: "Мастер-класс или обучение",
      icon: CalendarDays,
    },
    {
      href: "/create/vacancy",
      label: "Вакансия",
      hint: "Ищу мастера или ищу работу",
      icon: Briefcase,
    },
  ];

  return (
    <AppShell current="/create">
      <h1 className="animate-fade-up text-[20px] leading-[26px] font-semibold tracking-[-0.01em]">
        Что разместить
      </h1>
      <p
        className="mt-2 max-w-md animate-fade-up text-[13px] leading-[18px] text-[var(--color-text-muted)]"
        style={{ animationDelay: "60ms" }}
      >
        Выберите тип объявления — дальше одна форма и отправка на модерацию.
      </p>
      <div className="mt-6 flex max-w-md flex-col gap-3">
        {types.map((item, index) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{ animationDelay: `${120 + index * 70}ms` }}
              className={cn(
                "group animate-fade-up flex min-h-20 items-center gap-3 rounded-[10px] border border-border bg-card px-4 py-3",
                "transition duration-200 ease-out",
                "hover:-translate-y-0.5 hover:border-[var(--color-border-strong)] hover:shadow-sm",
                "active:scale-[0.99]",
                "focus-visible:ring-2 focus-visible:ring-primary",
              )}
            >
              <span className="flex size-11 shrink-0 items-center justify-center rounded-[8px] bg-[var(--color-accent-subtle)] text-primary transition duration-200 group-hover:scale-105">
                <Icon className="size-5" strokeWidth={1.75} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[16px] leading-[22px] font-semibold">
                  {item.label}
                </span>
                <span className="mt-0.5 block text-[13px] leading-[18px] text-[var(--color-text-muted)]">
                  {item.hint}
                </span>
              </span>
              <ChevronRight
                className="size-5 shrink-0 text-[var(--color-text-muted)] transition duration-200 group-hover:translate-x-0.5 group-hover:text-primary"
                strokeWidth={1.75}
              />
            </Link>
          );
        })}
      </div>
    </AppShell>
  );
}
