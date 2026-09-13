"use client";

import { useState } from "react";

import { Switch } from "@/components/ui/switch";

export function PreferenceToggle({
  name,
  label,
  defaultChecked = false,
}: {
  name: string;
  label: string;
  defaultChecked?: boolean;
}) {
  const [checked, setChecked] = useState(defaultChecked);

  return (
    <label className="flex min-h-14 items-center justify-between gap-4 rounded-[10px] border border-border bg-card px-4 py-3">
      <span className="text-[15px] leading-[22px]">{label}</span>
      <input type="hidden" name={name} value={checked ? "on" : ""} />
      <Switch checked={checked} onCheckedChange={setChecked} aria-label={label} />
    </label>
  );
}
