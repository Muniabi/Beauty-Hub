"use client";

import { useState, useTransition } from "react";

import { setNotificationPreference } from "@/app/actions/profile";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

const ROWS = [
  { key: "notifySpace" as const, label: "Кабинеты", hint: "Свободные кабинеты и кресла" },
  { key: "notifyEvent" as const, label: "Мероприятия", hint: "Мастер-классы и обучение" },
  { key: "notifyVacancy" as const, label: "Вакансии", hint: "Поиск мастера или работы" },
];

export function NotificationSwitches({
  notifySpace,
  notifyEvent,
  notifyVacancy,
}: {
  notifySpace: boolean;
  notifyEvent: boolean;
  notifyVacancy: boolean;
}) {
  const defaults = { notifySpace, notifyEvent, notifyVacancy };

  return (
    <div className="overflow-hidden rounded-[10px] border border-border bg-card">
      {ROWS.map((row, index) => (
        <NotificationSwitchRow
          key={row.key}
          name={row.key}
          label={row.label}
          hint={row.hint}
          defaultChecked={defaults[row.key]}
          divider={index < ROWS.length - 1}
        />
      ))}
    </div>
  );
}

function NotificationSwitchRow({
  name,
  label,
  hint,
  defaultChecked,
  divider,
}: {
  name: "notifySpace" | "notifyEvent" | "notifyVacancy";
  label: string;
  hint: string;
  defaultChecked: boolean;
  divider: boolean;
}) {
  const [checked, setChecked] = useState(defaultChecked);
  const [, startTransition] = useTransition();

  function toggle(next: boolean) {
    setChecked(next);
    startTransition(async () => {
      const data = new FormData();
      data.set("key", name);
      data.set("value", next ? "1" : "0");
      await setNotificationPreference(data);
    });
  }

  return (
    <div
      className={cn(
        "flex min-h-16 items-center justify-between gap-4 px-4 py-3",
        divider && "border-b border-border",
      )}
    >
      <button
        type="button"
        className="min-w-0 flex-1 text-left"
        onClick={() => toggle(!checked)}
      >
        <p className="text-[15px] leading-[22px] font-medium">{label}</p>
        <p className="text-[13px] leading-[18px] text-[var(--color-text-muted)]">{hint}</p>
      </button>
      <Switch
        checked={checked}
        onCheckedChange={toggle}
        aria-label={label}
      />
    </div>
  );
}
